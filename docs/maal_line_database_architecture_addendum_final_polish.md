# MAAL Line — Database Architecture Addendum (Final Polish)

> Últimos ajustes **no obligatorios pero recomendados** para dejar la arquitectura **100% completa, robusta y lista para operar a escala**. Este documento es un *add-on* al esquema final existente.

---

## 1. ENUMS / CHECK CONSTRAINTS (Consistencia de estados)

Para evitar estados inválidos por bugs de app o scripts, se recomienda **normalizar estados críticos**.

### Ejemplo: orders.status
```sql
ALTER TABLE orders
ADD CONSTRAINT orders_status_check
CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded'));
```

Aplicar el mismo patrón a:
- orders.payment_status
- orders.fulfillment_status
- payments.status
- shipments.status
- returns.status
- inventory_reservations.status

---

## 2. SOFT DELETES (Auditoría y recuperación)

Para entidades sensibles:
- products
- users
- discounts
- collections

Agregar:
```sql
ALTER TABLE products ADD COLUMN deleted_at TIMESTAMPTZ;
```

**Regla**: registros con `deleted_at IS NOT NULL` no se muestran, pero siguen auditables.

---

## 3. ÍNDICES GIN PARA ARRAYS (Performance futura)

Optimiza filtros por tags y segmentación.

```sql
CREATE INDEX idx_products_tags_gin ON products USING GIN(tags);
CREATE INDEX idx_customer_profiles_tags_gin ON customer_profiles USING GIN(tags);
CREATE INDEX idx_discounts_customer_groups_gin ON discounts USING GIN(customer_groups);
```

---

## 4. TABLA DE JOBS / BACKGROUND TASKS

Para trazabilidad de procesos automáticos (cron, Inngest, queues).

### background_jobs
```sql
CREATE TABLE background_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type VARCHAR(50) NOT NULL, -- expire_reservations, send_email, abandoned_cart
  reference_type VARCHAR(50),
  reference_id UUID,
  status VARCHAR(30) DEFAULT 'pending', -- pending | processing | completed | failed
  attempts INTEGER DEFAULT 0,
  last_error TEXT,
  scheduled_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_background_jobs_status ON background_jobs(status);
CREATE INDEX idx_background_jobs_type ON background_jobs(job_type);
```

Uso típico:
- Expirar inventory_reservations
- Enviar emails diferidos
- Abandoned cart recovery
- Back-in-stock notifications

---

## 5. FEATURE FLAGS / EXPERIMENTOS

Para habilitar features gradualmente (drops, early access, A/B testing).

### feature_flags
```sql
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  is_enabled BOOLEAN DEFAULT FALSE,
  rules JSONB, -- targeting por rol, grupo, porcentaje
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

Ejemplos:
- enable_drop_checkout
- vip_early_access
- new_checkout_ui

---

## 6. STORE CREDITS (Para devoluciones sin reembolso)

Si la resolución del RMA es *store credit*.

### store_credits
```sql
CREATE TABLE store_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(12,2) NOT NULL,
  balance DECIMAL(12,2) NOT NULL,
  source VARCHAR(50), -- return, promo, manual
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### store_credit_transactions
```sql
CREATE TABLE store_credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_credit_id UUID REFERENCES store_credits(id),
  order_id UUID,
  amount DECIMAL(12,2) NOT NULL,
  type VARCHAR(20), -- debit | credit
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. RATE LIMIT / SECURITY EVENTS

Para proteger checkout, login y pagos.

### security_events
```sql
CREATE TABLE security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  ip_address INET,
  event_type VARCHAR(50), -- login_failed, rate_limited, suspicious_payment
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 8. MVP VS ESCALA (Recomendación)

### MVP (implementar de inicio)
- users / auth
- products / variants
- carts + inventory_reservations
- orders / payments
- inventory_movements
- shipments (simple)
- email_logs

### Activar después (cuando haya tracción)
- analytics_events completos
- conversion_funnel
- feature_flags
- store_credits
- background_jobs avanzados

---

## 🏁 CIERRE

Con este addendum:
- La base queda **blindada contra edge cases**
- Soporta **experimentos, drops, devoluciones complejas**
- Está lista para **alto tráfico y crecimiento real**

> **Estado final:** Arquitectura de e-commerce streetwear nivel *producto serio*, sin deuda técnica temprana.
