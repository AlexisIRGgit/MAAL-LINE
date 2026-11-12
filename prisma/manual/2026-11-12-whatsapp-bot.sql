-- WhatsApp bot tables (additive only; safe to run more than once).
-- Production has drift, so this is applied by hand instead of `prisma db push`.

CREATE TABLE IF NOT EXISTS whatsapp_conversations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone           varchar(20) NOT NULL UNIQUE,
  contact_name    varchar(120),
  status          varchar(10) NOT NULL DEFAULT 'bot',
  handoff_reason  text,
  handoff_at      timestamptz,
  last_inbound_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS whatsapp_conversations_status_idx ON whatsapp_conversations (status);

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES whatsapp_conversations (id) ON DELETE CASCADE,
  wa_message_id   varchar(150) UNIQUE,
  author          varchar(10) NOT NULL,
  body            text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS whatsapp_messages_conversation_id_created_at_idx ON whatsapp_messages (conversation_id, created_at);
