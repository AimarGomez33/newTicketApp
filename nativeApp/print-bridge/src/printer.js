/**
 * printer.js — Envía un Buffer de comandos ESC/POS a la impresora
 *              vía socket TCP (puerto RAW 9100).
 */

'use strict';

const net = require('net');

/**
 * Envía `data` (Buffer) a la impresora en `host`:`port` via TCP.
 *
 * @param {Buffer}  data
 * @param {string}  host   IP de la impresora  (default: 192.168.10.3)
 * @param {number}  port   Puerto RAW          (default: 9100)
 * @param {number}  timeoutMs  Tiempo máximo de espera (default: 5000 ms)
 * @returns {Promise<void>}
 */
function sendToPrinter(data, host = '192.168.10.3', port = 9100, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let settled = false;

    const done = (err) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      if (err) reject(err);
      else resolve();
    };

    socket.setTimeout(timeoutMs);

    socket.on('connect', () => {
      socket.write(data, (err) => {
        if (err) return done(err);
        // Pequeña espera para que la impresora procese el buffer antes de cerrar
        socket.end();
      });
    });

    socket.on('end', () => done());
    socket.on('close', () => done());

    socket.on('timeout', () => {
      done(new Error(`Timeout: no se pudo conectar a la impresora en ${host}:${port} en ${timeoutMs}ms`));
    });

    socket.on('error', (err) => {
      done(new Error(`Error de red al conectar con la impresora (${host}:${port}): ${err.message}`));
    });

    socket.connect(port, host);
  });
}

module.exports = { sendToPrinter };
