import { NativeModules } from 'react-native';
import { Buffer } from 'buffer';

const PRINTER_HOST = '192.168.10.3';
const PRINTER_PORT = 9100;
const PRINTER_TIMEOUT_MS = 5000;
const CLOSE_DELAY_MS = 150;
const COLS = 48;

type TcpSocketModule = typeof import('react-native-tcp-socket');

type TicketItem = {
  name: string;
  qty: number;
  price: number;
  total?: number;
};

export type PrintTicketData = {
  mesa?: string;
  items: TicketItem[];
  totalItems?: number;
  totalPrice?: number;
  createdAt?: string | Date;
};

const CMD = {
  INIT: [0x1b, 0x40],
  CUT_PARTIAL: [0x1d, 0x56, 0x01],
  FEED_N: (n: number) => [0x1b, 0x64, n],
  BOLD_ON: [0x1b, 0x45, 0x01],
  BOLD_OFF: [0x1b, 0x45, 0x00],
  DOUBLE_ON: [0x1d, 0x21, 0x11],
  DOUBLE_OFF: [0x1d, 0x21, 0x00],
  ALIGN_LEFT: [0x1b, 0x61, 0x00],
  ALIGN_CENTER: [0x1b, 0x61, 0x01],
  ALIGN_RIGHT: [0x1b, 0x61, 0x02],
  CHARSET_CP858: [0x1b, 0x74, 0x13],
};

let tcpSocketModule: TcpSocketModule | undefined;

function getTcpSocket() {
  if (!NativeModules.TcpSockets) {
    throw new Error(
      'El modulo TCP nativo no esta cargado. Reinstala/recompila la app con "npm run android:dev"; Expo Go y builds anteriores no incluyen react-native-tcp-socket.',
    );
  }

  if (!tcpSocketModule) {
    // La libreria falla al importarse si NativeModules.TcpSockets es null.
    // Por eso se carga de forma diferida despues de validar el modulo nativo.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    tcpSocketModule = require('react-native-tcp-socket') as TcpSocketModule;
  }

  return tcpSocketModule.default ?? tcpSocketModule;
}

function normalizeText(value: string) {
  return value
    .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
    .replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ü/g, 'u')
    .replace(/Á/g, 'A').replace(/É/g, 'E').replace(/Í/g, 'I')
    .replace(/Ó/g, 'O').replace(/Ú/g, 'U').replace(/Ü/g, 'U')
    .replace(/ñ/g, 'n').replace(/Ñ/g, 'N')
    .replace(/¿/g, '?').replace(/¡/g, '!')
    .replace(/[^\x00-\x7F]/g, '?');
}

function textBytes(value: string) {
  return Array.from(Buffer.from(`${normalizeText(value)}\n`, 'ascii'));
}

function separator(char = '-', cols = COLS) {
  return char.repeat(cols);
}

function leftRight(left: string, right: string, cols = COLS) {
  const gap = cols - left.length - right.length;
  if (gap <= 0) {
    const maxLeft = Math.max(0, cols - right.length - 1);
    return `${left.slice(0, maxLeft)} ${right}`;
  }

  return left + ' '.repeat(gap) + right;
}

function money(value: number) {
  return `$${Number(value || 0).toLocaleString('es-MX')}`;
}

function formatDate(value?: string | Date) {
  const date = value ? new Date(value) : new Date();

  return date.toLocaleString('es-MX', {
    timeZone: 'America/Mexico_City',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function buildTicketBuffer(data: PrintTicketData) {
  const totalItems = data.totalItems ?? data.items.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  const totalPrice = data.totalPrice ?? data.items.reduce((sum, item) => {
    const lineTotal = item.total ?? Number(item.qty || 0) * Number(item.price || 0);
    return sum + lineTotal;
  }, 0);

  const bytes: number[] = [];
  const add = (...chunks: number[][]) => chunks.forEach((chunk) => bytes.push(...chunk));
  const line = (value: string) => add(textBytes(value));

  add(CMD.INIT, CMD.CHARSET_CP858);
  add(CMD.ALIGN_CENTER, CMD.DOUBLE_ON, CMD.BOLD_ON);
  line('COMANDA');
  add(CMD.DOUBLE_OFF, CMD.BOLD_OFF, CMD.ALIGN_LEFT);

  add(CMD.BOLD_ON);
  line(separator('='));
  add(CMD.BOLD_OFF);

  add(CMD.ALIGN_CENTER);
  line(formatDate(data.createdAt));
  add(CMD.ALIGN_LEFT);

  if (data.mesa) {
    add(CMD.ALIGN_CENTER, CMD.BOLD_ON);
    line(`Mesa: ${data.mesa}`);
    add(CMD.BOLD_OFF, CMD.ALIGN_LEFT);
  }

  line(separator('-'));
  add(CMD.BOLD_ON);
  line(leftRight('PRODUCTO', 'TOTAL'));
  add(CMD.BOLD_OFF);
  line(separator('-'));

  data.items.forEach((item) => {
    const qty = Number(item.qty || 0);
    const price = Number(item.price || 0);
    const total = item.total ?? qty * price;
    const totalLabel = money(total);
    const qtyLabel = `${qty}x ${item.name}`;

    if (qtyLabel.length + totalLabel.length + 1 <= COLS) {
      line(leftRight(qtyLabel, totalLabel));
    } else {
      const maxNameLen = COLS - 4;
      line(qtyLabel.length > maxNameLen ? `${qtyLabel.slice(0, maxNameLen - 1)}.` : qtyLabel);
      add(CMD.ALIGN_RIGHT);
      line(totalLabel);
      add(CMD.ALIGN_LEFT);
    }

    line(`  @ ${money(price)} c/u`);
  });

  add(CMD.BOLD_ON);
  line(separator('='));
  line(leftRight(
    `TOTAL (${totalItems} art${totalItems !== 1 ? 'iculos' : 'iculo'})`,
    money(totalPrice),
  ));
  add(CMD.BOLD_OFF);

  add(CMD.FEED_N(2), CMD.ALIGN_CENTER);
  line('Gracias por su preferencia!');
  add(CMD.FEED_N(4), CMD.CUT_PARTIAL);

  return Buffer.from(bytes);
}

export async function printDirect(data: PrintTicketData) {
  if (!data.items.length) {
    throw new Error('La orden no contiene articulos.');
  }

  const TcpSocket = getTcpSocket();
  const payload = buildTicketBuffer(data);

  return new Promise<{ bytes: number; host: string; port: number }>((resolve, reject) => {
    let settled = false;

    const client = TcpSocket.createConnection({
      host: PRINTER_HOST,
      port: PRINTER_PORT,
      connectTimeout: PRINTER_TIMEOUT_MS,
      interface: 'wifi',
    }, () => {
      client.write(payload, undefined, (error?: Error) => {
        if (error) {
          finish(error);
          return;
        }

        setTimeout(() => {
          client.end();
        }, CLOSE_DELAY_MS);
      });
    });

    const finish = (error?: Error) => {
      if (settled) {
        return;
      }

      settled = true;
      client.destroy();

      if (error) {
        reject(error);
        return;
      }

      resolve({
        bytes: payload.length,
        host: PRINTER_HOST,
        port: PRINTER_PORT,
      });
    };

    client.setTimeout(PRINTER_TIMEOUT_MS);

    client.on('timeout', () => {
      finish(new Error(`La impresora no responde en ${PRINTER_HOST}:${PRINTER_PORT}. Revisa que el telefono siga conectado al WiFi local sin internet y que la impresora use RAW 9100.`));
    });

    client.on('error', (error) => {
      finish(new Error(`Error TCP con la impresora ${PRINTER_HOST}:${PRINTER_PORT}: ${error.message}`));
    });

    client.on('close', () => {
      finish();
    });
  });
}

export const printerConfig = {
  host: PRINTER_HOST,
  port: PRINTER_PORT,
  timeoutMs: PRINTER_TIMEOUT_MS,
};
