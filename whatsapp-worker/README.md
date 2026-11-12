# WhatsApp worker (trial)

Connects one WhatsApp number through [whatsapp-web.js](https://github.com/wwebjs/whatsapp-web.js) and forwards every
customer message to the MAAL LINE app (`/api/whatsapp/inbound`), which runs the bot and returns the replies.

**Trial only.** Unofficial clients break WhatsApp's terms and the number can be banned: use a spare SIM, never the
store's main number. The long-term setup is Meta's Cloud API (`/api/whatsapp/webhook`), which needs no worker.

## Railway

1. New service from this GitHub repo, **Root Directory** `whatsapp-worker` (it builds the Dockerfile).
2. Add a **Volume** mounted at `/data` (keeps the WhatsApp session across deploys).
3. Variables: `APP_URL=https://www.maalline.com`, `WORKER_SECRET=<32+ random characters>`.
4. Settings → Networking → Generate Domain.
5. Open `https://<domain>/qr?token=<WORKER_SECRET>` and scan it from the bot's phone
   (WhatsApp → Linked devices → Link a device).

## Vercel (the app)

`WHATSAPP_TRANSPORT=webjs`, `WHATSAPP_WORKER_URL=https://<railway domain>`, `WHATSAPP_WORKER_SECRET=<same secret>`,
`ANTHROPIC_API_KEY`. Remove `WHATSAPP_TRANSPORT` (or set it to `cloud`) when moving to the Cloud API.

## Endpoints

- `GET /health` — `{ ready }`, public
- `GET /qr?token=…` — QR page while not linked
- `POST /send` (Bearer secret) — staff replies from `/admin/whatsapp`
