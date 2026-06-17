import TcpSocket from 'react-native-tcp-socket';
import { Buffer } from 'buffer';

const PRINTER_HOST = '192.168.10.3';
const PRINTER_PORT = 9100;

const CMD = {
  INIT: [0x1b, 0x40],
  ALIGN_CENTER: [0x1b, 0x61, 0x01],
  ALIGN_LEFT: [0x1b, 0x61, 0x00],
  CUT: [0x1d, 0x56, 0x42, 0x00], // Full cut
  FEED_N: (n: number) => [0x1b, 0x64, n],
};

export async function printDirect(data: any) {
  // 1. Verificar si el módulo carge correctamente
  if (!TcpSocket || !TcpSocket.createConnection) {
    throw new Error('MODULO_NATIVO_FALTANTE: No puedes usar la app de Expo Go. Debes compilar con "npx expo run:android"');
  }

  return new Promise((resolve, reject) => {
    console.log(`Intentando conectar a ${PRINTER_HOST}:${PRINTER_PORT}...`);
    
    const client = TcpSocket.createConnection({
      host: PRINTER_HOST,
      port: PRINTER_PORT,
    }, () => {
      console.log('¡Conectado a la impresora!');
      
      const bufferArr: number[] = [];
      const add = (arr: number[]) => bufferArr.push(...arr);
      const addText = (text: string) => {
        const cleanText = text
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/ñ/g, 'n');
        const buf = Buffer.from(cleanText + '\n', 'ascii');
        for (let i = 0; i < buf.length; i++) bufferArr.push(buf[i]);
      };

      try {
        add(CMD.INIT);
        add(CMD.ALIGN_CENTER);
        addText('--- PRUEBA DE COMANDA ---');
        addText(`Mesa: ${data.mesa || 'N/A'}`);
        addText('-------------------------');
        
        data.items.forEach((item: any) => {
          addText(`${item.qty}x ${item.name} ... $${item.total}`);
        });
        
        addText('-------------------------');
        addText(`TOTAL: $${data.totalPrice}`);
        add(CMD.FEED_N(4));
        add(CMD.CUT);

        client.write(Buffer.from(bufferArr), (err) => {
          if (err) {
            console.error('Error al escribir:', err);
            reject(err);
          } else {
            console.log('Datos enviados.');
            client.end();
          }
        });
      } catch (e) {
        reject(e);
      }
    });

    client.on('error', (error) => {
      console.log('Error de Socket:', error);
      reject(new Error(`Error de red: ${error.message}`));
    });

    client.setTimeout(4000);
    client.on('timeout', () => {
      console.log('Timeout de conexión');
      client.destroy();
      reject(new Error('La impresora no responde (Timeout). Revisa la IP y el WiFi.'));
    });

    client.on('close', () => {
      console.log('Conexión cerrada.');
      resolve(true);
    });
  });
}
