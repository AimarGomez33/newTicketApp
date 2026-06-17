# print-bridge (legado)

> Este servidor queda solo como referencia historica/formato ESC/POS. Para la app
> React Native usa `nativeApp/my-app/src/utils/printer.ts`, donde el socket TCP
> se abre dentro de la app y no se requiere Node, Express, HTTP local ni
> procesos externos.

Servidor Node.js que actúa como **puente HTTP → ESC/POS → TCP** para una
impresora térmica POS de 80 mm (ej. Epson TM-T20, Bixolon, SNBC, etc.).

## Arquitectura

```
┌──────────────────────┐        POST /print        ┌───────────────────┐
│  App Expo / móvil    │  ──────────────────────►  │  print-bridge     │
│  (React Native)      │       JSON con orden       │  (Node + Express) │
└──────────────────────┘                            └────────┬──────────┘
                                                             │ Buffer ESC/POS
                                                             │ TCP :9100
                                                    ┌────────▼──────────┐
                                                    │  Impresora POS    │
                                                    │  192.168.10.3     │
                                                    └───────────────────┘
```

## Requisitos

- **Node.js ≥ 18**
- La impresora debe estar accesible en `192.168.10.3:9100` (puerto RAW)
- Este servidor debe ejecutarse en una máquina de la misma red WiFi

## Instalación

```bash
cd nativeApp/print-bridge
npm install
```

## Uso

```bash
# Producción
npm start

# Desarrollo (recarga automática si hay cambios)
npm run dev
```

El servidor arranca en `0.0.0.0:3030`.

## Configuración via variables de entorno

| Variable          | Descripción                          | Default           |
|-------------------|--------------------------------------|-------------------|
| `PORT`            | Puerto HTTP del bridge               | `3030`            |
| `PRINTER_HOST`    | IP de la impresora                   | `192.168.10.3`    |
| `PRINTER_PORT`    | Puerto RAW de la impresora (ESC/POS) | `9100`            |
| `PRINTER_TIMEOUT` | Timeout de conexión TCP (ms)         | `5000`            |

Ejemplo con variables personalizadas:

```bash
PORT=8080 PRINTER_HOST=10.0.0.55 npm start
```

## Endpoints

### `GET /health`
Devuelve el estado del servidor y la IP/puerto de la impresora configurada.

```json
{
  "status": "ok",
  "printer": "192.168.10.3:9100",
  "time": "2026-06-16T03:00:00.000Z"
}
```

### `POST /print`
Recibe la orden y la manda a imprimir.

**Body (JSON):**
```json
{
  "mesa": "Mesa 3",
  "createdAt": "2026-06-16T03:00:00.000Z",
  "totalItems": 3,
  "totalPrice": 235,
  "items": [
    { "name": "Pozole Grande",  "qty": 1, "price": 120, "total": 120 },
    { "name": "Taco con Queso", "qty": 2, "price":  47, "total":  94 },
    { "name": "Refresco",       "qty": 1, "price":  28, "total":  28 }
  ]
}
```

**Respuestas:**
- `200 ok` — Ticket enviado e impreso correctamente.
- `400 …`   — Validación fallida (orden vacía, etc.).
- `502 …`   — Error de red con la impresora (timeout, no alcanzable).

## Script de prueba

Con el servidor corriendo, en otra terminal:

```bash
node test-ticket.js
# Con URL personalizada:
node test-ticket.js http://192.168.1.10:3030
```

## Estructura de archivos

```
print-bridge/
├── package.json
├── test-ticket.js       ← Script para probar el envío
└── src/
    ├── index.js         ← Servidor HTTP Express (entrada principal)
    ├── escpos.js        ← Generador de comandos ESC/POS
    └── printer.js       ← Cliente TCP (envía a la impresora)
```

## Ticket impreso — ejemplo visual

```
================================================
            COMANDA
================================================
        16/06/2026, 03:15
          Mesa: Mesa 3
------------------------------------------------
PRODUCTO                                   TOTAL
------------------------------------------------
1x Pozole Grande                           $120
  @ $120 c/u
2x Taco con Queso                           $94
  @ $47 c/u
1x Refresco                                $28
  @ $28 c/u
================================================
TOTAL (4 articulos)                        $242
================================================

      Gracias por su preferencia!

```

## Notas de red

1. La app Expo usa la URL `http://192.168.10.3:3030` por defecto
   (variable `EXPO_PUBLIC_PRINT_BRIDGE_URL` en `.env`).
2. Si el bridge corre en **otra máquina** (no la impresora), actualiza
   `EXPO_PUBLIC_PRINT_BRIDGE_URL` con la IP de esa máquina.
3. Asegura que el firewall permita el puerto 3030 (TCP entrante).
