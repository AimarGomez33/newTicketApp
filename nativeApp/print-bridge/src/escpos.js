/**
 * escpos.js — Generador de comandos ESC/POS para impresora térmica 80 mm
 *
 * Comandos ESC/POS básicos suficientes para generar un ticket de restaurante.
 * Ancho de papel: 80 mm → 48 caracteres por línea (fuente estándar 12×24).
 */

'use strict';

// ── Constantes ESC/POS ──────────────────────────────────────────────────────
const ESC = 0x1b;
const GS  = 0x1d;
const LF  = 0x0a;

const CMD = {
  INIT:           Buffer.from([ESC, 0x40]),                   // Inicializar
  CUT_FULL:       Buffer.from([GS, 0x56, 0x00]),              // Cortar papel (full cut)
  CUT_PARTIAL:    Buffer.from([GS, 0x56, 0x01]),              // Cortar papel (partial)
  FEED_N:         (n) => Buffer.from([ESC, 0x64, n]),         // Avanzar n líneas
  BOLD_ON:        Buffer.from([ESC, 0x45, 0x01]),
  BOLD_OFF:       Buffer.from([ESC, 0x45, 0x00]),
  DOUBLE_ON:      Buffer.from([GS, 0x21, 0x11]),              // Alto x2 + Ancho x2
  DOUBLE_OFF:     Buffer.from([GS, 0x21, 0x00]),
  ALIGN_LEFT:     Buffer.from([ESC, 0x61, 0x00]),
  ALIGN_CENTER:   Buffer.from([ESC, 0x61, 0x01]),
  ALIGN_RIGHT:    Buffer.from([ESC, 0x61, 0x02]),
  CHARSET_CP858:  Buffer.from([ESC, 0x74, 0x13]),             // Página de códigos 858 (Latín)
};

const COLS = 48; // Caracteres por línea para papel de 80 mm

// ── Utilidades de formato ────────────────────────────────────────────────────

/**
 * Línea dividida izquierda-derecha.
 * Ej: leftRight("Tacos x3", "$105")  →  "Tacos x3               $105"
 */
function leftRight(left, right, cols = COLS) {
  const gap = cols - left.length - right.length;
  if (gap <= 0) {
    // Truncar la parte izquierda si no cabe
    const truncLeft = left.slice(0, cols - right.length - 1);
    return `${truncLeft} ${right}`;
  }
  return left + ' '.repeat(gap) + right;
}

/**
 * Texto centrado en `cols` caracteres.
 */
function center(text, cols = COLS) {
  const pad = Math.max(0, Math.floor((cols - text.length) / 2));
  return ' '.repeat(pad) + text;
}

/**
 * Línea de separación (dashes).
 */
function separator(char = '-', cols = COLS) {
  return char.repeat(cols);
}

/**
 * Convierte una cadena UTF-8 en Buffer usando latin1 (compatible CP858).
 * Reemplaza caracteres fuera del rango 0-255 por '?'.
 */
function textBuf(str) {
  // Normalización básica de caracteres especiales comunes en español
  const normalized = str
    .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
    .replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ü/g, 'u')
    .replace(/Á/g, 'A').replace(/É/g, 'E').replace(/Í/g, 'I')
    .replace(/Ó/g, 'O').replace(/Ú/g, 'U').replace(/Ü/g, 'U')
    .replace(/ñ/g, 'n').replace(/Ñ/g, 'N')
    .replace(/¿/g, '?').replace(/¡/g, '!')
    .replace(/[^\x00-\xFF]/g, '?');

  return Buffer.from(normalized + '\n', 'latin1');
}

// ── Builder principal ────────────────────────────────────────────────────────

/**
 * Genera el Buffer completo con todos los comandos ESC/POS para imprimir
 * el ticket de la comanda.
 *
 * @param {Object} data
 * @param {string}  data.mesa        Número/nombre de la mesa
 * @param {Array}   data.items       [ { name, qty, price, total } ]
 * @param {number}  data.totalItems  Cantidad total de artículos
 * @param {number}  data.totalPrice  Precio total
 * @param {string}  data.createdAt   ISO date string
 * @returns {Buffer}
 */
function buildTicket(data) {
  const { mesa, items = [], totalItems = 0, totalPrice = 0, createdAt } = data;
  const parts = [];

  const push = (...bufs) => bufs.forEach((b) => parts.push(b));
  const line = (str) => push(textBuf(str));

  // ── Cabecera ────────────────────────────────────────────────────────────
  push(CMD.INIT, CMD.CHARSET_CP858);
  push(CMD.ALIGN_CENTER, CMD.DOUBLE_ON, CMD.BOLD_ON);
  line('COMANDA');
  push(CMD.DOUBLE_OFF, CMD.BOLD_OFF, CMD.ALIGN_LEFT);

  push(CMD.BOLD_ON);
  line(separator('='));
  push(CMD.BOLD_OFF);

  // Fecha / hora
  const fecha = createdAt
    ? new Date(createdAt).toLocaleString('es-MX', {
        timeZone: 'America/Mexico_City',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleString('es-MX');

  push(CMD.ALIGN_CENTER);
  line(fecha);
  push(CMD.ALIGN_LEFT);

  if (mesa) {
    push(CMD.ALIGN_CENTER, CMD.BOLD_ON);
    line(`Mesa: ${mesa}`);
    push(CMD.BOLD_OFF, CMD.ALIGN_LEFT);
  }

  line(separator('-'));

  // ── Encabezado de columnas ──────────────────────────────────────────────
  push(CMD.BOLD_ON);
  line(leftRight('PRODUCTO', 'TOTAL'));
  push(CMD.BOLD_OFF);
  line(separator('-'));

  // ── Artículos ───────────────────────────────────────────────────────────
  for (const item of items) {
    const totalStr = `$${Number(item.total).toLocaleString('es-MX')}`;
    const qtyLabel = `${item.qty}x ${item.name}`;

    // Si la combinación cabe en una línea, la ponemos completa;
    // si no, nombre arriba y precio alineado a la derecha abajo.
    if (qtyLabel.length + totalStr.length + 1 <= COLS) {
      line(leftRight(qtyLabel, totalStr));
    } else {
      // Nombre en línea propia (truncado si hace falta)
      const maxNameLen = COLS - 4;
      const displayName = qtyLabel.length > maxNameLen
        ? qtyLabel.slice(0, maxNameLen - 1) + '.'
        : qtyLabel;
      line(displayName);
      push(CMD.ALIGN_RIGHT);
      line(totalStr);
      push(CMD.ALIGN_LEFT);
    }

    // Precio unitario en tono secundario (sin negrita, tamaño normal)
    const unitStr = `  @ $${Number(item.price).toLocaleString('es-MX')} c/u`;
    line(unitStr);
  }

  // ── Total ───────────────────────────────────────────────────────────────
  push(CMD.BOLD_ON);
  line(separator('='));
  line(leftRight(
    `TOTAL (${totalItems} art${totalItems !== 1 ? 'iculos' : 'iculo'})`,
    `$${Number(totalPrice).toLocaleString('es-MX')}`
  ));
  push(CMD.BOLD_OFF);

  // ── Pie ─────────────────────────────────────────────────────────────────
  push(CMD.FEED_N(2), CMD.ALIGN_CENTER);
  line('Gracias por su preferencia!');
  push(CMD.FEED_N(4));

  // ── Corte de papel ──────────────────────────────────────────────────────
  push(CMD.CUT_PARTIAL);

  return Buffer.concat(parts);
}

module.exports = { buildTicket };
