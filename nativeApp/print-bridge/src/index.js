/**
 * index.js — Servidor HTTP print-bridge
 *
 * Escucha peticiones POST /print desde la app Expo (React Native),
 * genera los comandos ESC/POS y los envía a la impresora POS vía TCP.
 *
 * Configuración via variables de entorno:
 *   PORT              Puerto HTTP de este servidor  (default: 3030)
 *   PRINTER_HOST      IP de la impresora            (default: 192.168.10.3)
 *   PRINTER_PORT      Puerto RAW de la impresora    (default: 9100)
 *   PRINTER_TIMEOUT   Timeout de conexión TCP en ms (default: 5000)
 */

'use strict';

const express        = require('express');
const cors           = require('cors');
const { buildTicket }    = require('./escpos');
const { sendToPrinter }  = require('./printer');

// ── Configuración ────────────────────────────────────────────────────────────
const HTTP_PORT      = parseInt(process.env.PORT          ?? '3030', 10);
const PRINTER_HOST   = process.env.PRINTER_HOST            ?? '192.168.10.3';
const PRINTER_PORT   = parseInt(process.env.PRINTER_PORT  ?? '9100', 10);
const PRINTER_TIMEOUT= parseInt(process.env.PRINTER_TIMEOUT ?? '5000', 10);

// ── App Express ──────────────────────────────────────────────────────────────
const app = express();

app.use(cors());                           // Permite solicitudes desde Expo Web / LAN
app.use(express.json({ limit: '256kb' }));

// ── Salud ────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    printer: `${PRINTER_HOST}:${PRINTER_PORT}`,
    time: new Date().toISOString(),
  });
});

// ── Endpoint de impresión ────────────────────────────────────────────────────
/**
 * POST /print
 * Body (JSON):
 * {
 *   mesa:        string,
 *   items:       [ { name: string, qty: number, price: number, total: number } ],
 *   totalItems:  number,
 *   totalPrice:  number,
 *   createdAt:   string  // ISO date
 * }
 */
app.post('/print', async (req, res) => {
  const { mesa, items, totalItems, totalPrice, createdAt } = req.body ?? {};

  // Validación básica
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).send('La orden no contiene artículos.');
  }

  console.log(`[PRINT] Mesa: ${mesa ?? '—'}  |  ${totalItems} art.  |  $${totalPrice}`);
  items.forEach((it) =>
    console.log(`  • ${it.qty}x ${it.name}  →  $${it.total}`)
  );

  let ticketBuffer;
  try {
    ticketBuffer = buildTicket({ mesa, items, totalItems, totalPrice, createdAt });
  } catch (err) {
    console.error('[ESC/POS] Error al construir el ticket:', err);
    return res.status(500).send(`Error al construir el ticket: ${err.message}`);
  }

  try {
    await sendToPrinter(ticketBuffer, PRINTER_HOST, PRINTER_PORT, PRINTER_TIMEOUT);
    console.log('[PRINT] ✓ Ticket enviado a la impresora.');
    return res.status(200).send('ok');
  } catch (err) {
    console.error('[PRINT] ✗ Error al enviar a la impresora:', err.message);
    return res.status(502).send(err.message);
  }
});

// ── Inicio ───────────────────────────────────────────────────────────────────
app.listen(HTTP_PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║          🖨  PRINT BRIDGE v1.0           ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║  HTTP   →  0.0.0.0:${String(HTTP_PORT).padEnd(22)}║`);
  console.log(`║  Impresora → ${PRINTER_HOST}:${PRINTER_PORT}       ║`);
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
  console.log('Endpoints disponibles:');
  console.log(`  GET  http://localhost:${HTTP_PORT}/health`);
  console.log(`  POST http://localhost:${HTTP_PORT}/print`);
  console.log('');
});
