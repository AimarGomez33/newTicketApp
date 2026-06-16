/**
 * test-ticket.js — Envía una orden de prueba al print-bridge para validar
 *                  que el servidor y la impresora funcionan correctamente.
 *
 * Uso: node test-ticket.js [url]
 *   url — URL base del bridge (default: http://localhost:3030)
 */

'use strict';

const BRIDGE_URL = process.argv[2] ?? 'http://localhost:3030';

const testOrder = {
  mesa: 'Mesa 5',
  createdAt: new Date().toISOString(),
  totalItems: 5,
  totalPrice: 327,
  items: [
    { name: 'Pozole Grande',          qty: 1, price: 120, total: 120 },
    { name: 'Taco con Queso (c/u)',   qty: 2, price:  47, total:  94 },
    { name: 'Alitas 6 pzas',          qty: 1, price:  80, total:  80 },
    { name: 'Refrescos',              qty: 2, price:  28, total:  56 },
    { name: 'Orden de Papas Sencillas', qty: 1, price: -23, total: -23 }, // Descuento
  ],
};

(async () => {
  console.log(`Enviando orden de prueba a ${BRIDGE_URL}/print …\n`);
  console.log(JSON.stringify(testOrder, null, 2));
  console.log('');

  try {
    const res = await fetch(`${BRIDGE_URL}/print`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testOrder),
    });

    const body = await res.text();
    if (res.ok) {
      console.log('✓ Ticket enviado correctamente:', body);
    } else {
      console.error(`✗ Error HTTP ${res.status}:`, body);
      process.exit(1);
    }
  } catch (err) {
    console.error('✗ Error de red:', err.message);
    console.error('  ¿Está corriendo el servidor? npm start');
    process.exit(1);
  }
})();
