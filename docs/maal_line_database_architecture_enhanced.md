# MAAL Line — Database Architecture (Enhanced)

> Extensión del documento original con mejoras orientadas a **e‑commerce streetwear**, drops, control de inventario y operación real (pagos, envíos y devoluciones).

---

## 1. Inventory Reservations (Prevención de overselling)

### inventory_reservations
Reserva temporal de stock cuando un usuario agrega productos al carrito o inicia checkout.

```sql
CREATE TABLE inventory_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_variant_id UUID NOT NULL REFERENCES product_variants(id),
  cart_id UUID,
  checkout_session_id UUID,
  quantity INT NOT NULL CHECK (quantity > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active | released | converted
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_reservations_variant ON inventory_reservations(product_variant_id);
CREATE INDEX idx_inventory_reservations_status ON inventory_reservations(status);
```

**Flujo recomendado**:
- Add to cart → crear reserva
- Checkout iniciado → renovar `expires_at`
- Pago exitoso → `converted` + inventory_movement
- Expira → `released`

---

## 2. Shipments (Envíos y fulfillment)

### shipments
```sql
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  status VARCHAR(30) NOT NULL DEFAULT 'pending', -- pending | shipped | delivered | returned
  carrier VARCHAR(50),
  tracking_number VARCHAR(100),
  tracking_url TEXT,
  label_url TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### shipment_items
```sql
CREATE TABLE shipment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES shipments(id),
  order_item_id UUID NOT NULL REFERENCES order_items(id),
  quantity INT NOT NULL CHECK (quantity > 0)
);
```

---

## 3. Returns / RMA (Devoluciones)

### returns
```sql
CREATE TABLE returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  status VARCHAR(30) NOT NULL DEFAULT 'requested', -- requested | approved | received | rejected | refunded
  reason VARCHAR(100),
  notes TEXT,
  created_by UUID, -- user/admin
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### return_items
```sql
CREATE TABLE return_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id UUID NOT NULL REFERENCES returns(id),
  order_item_id UUID NOT NULL REFERENCES order_items(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  condition VARCHAR(30) -- new | damaged | used
);
```

---

## 4. Collections / Drops (Streetwear core)

### collections
```sql
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) UNIQUE NOT NULL,
  type VARCHAR(30) DEFAULT 'seasonal', -- drop | seasonal | collab
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT false,
  hero_image TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### collection_products
```sql
CREATE TABLE collection_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES collections(id),
  product_id UUID NOT NULL REFERENCES products(id),
  sort_order INT DEFAULT 0
);
```

---

## 5. Payment Webhooks & Idempotency

### webhook_events
```sql
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(30) NOT NULL, -- stripe | mercadopago | conekta
  event_id VARCHAR(150) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(30) DEFAULT 'received', -- received | processed | failed
  received_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_webhook_provider_event ON webhook_events(provider, event_id);
```

### idempotency_keys
```sql
CREATE TABLE idempotency_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(150) UNIQUE NOT NULL,
  scope VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 6. Variant Options (Escalable)

> Opcional, recomendado si en el futuro se agregan más atributos además de talla/color.

```sql
CREATE TABLE variant_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_variant_id UUID NOT NULL REFERENCES product_variants(id),
  option_name VARCHAR(50), -- size, color, fit, material
  option_value VARCHAR(50)
);
```

---

## 7. Recomendaciones Técnicas Globales

- Usar **TIMESTAMPTZ** en todas las fechas.
- Índices clave:
  - orders(status, created_at)
  - product_variants(product_id)
  - inventory_movements(product_variant_id)
- Mantener `inventory_movements` como **fuente de verdad** del stock.
- Reservas **no descuentan stock**, solo bloquean temporalmente.

---

## 8. Flujo Completo Resumido

1. Usuario agrega producto → inventory_reservation
2. Checkout → reserva activa
3. Pago confirmado → order + inventory_movement (-)
4. Envío → shipment
5. Devolución → return + inventory_movement (+/-)

---

> Este documento deja la base de datos lista para **drops, alto tráfico, operación real y escalado** sin rehacer estructura en el futuro.

