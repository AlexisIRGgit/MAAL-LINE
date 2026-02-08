# MAAL LINE - Arquitectura de Base de Datos y Sistema E-Commerce

## 📊 Diagrama General del Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            MAAL LINE E-COMMERCE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                 │
│   │   TIENDA     │    │    ADMIN     │    │  EMPLEADOS   │                 │
│   │   (Público)  │    │   (Owner)    │    │   (Staff)    │                 │
│   └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                 │
│          │                   │                   │                          │
│          └───────────────────┼───────────────────┘                          │
│                              │                                              │
│                    ┌─────────▼─────────┐                                    │
│                    │    NEXT.JS API    │                                    │
│                    │    (Backend)      │                                    │
│                    └─────────┬─────────┘                                    │
│                              │                                              │
│          ┌───────────────────┼───────────────────┐                          │
│          │                   │                   │                          │
│   ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐                    │
│   │   NEON DB   │    │   STRIPE    │    │  ANALYTICS  │                    │
│   │  (Postgres) │    │  (Pagos)    │    │ (Eventos)   │                    │
│   └─────────────┘    └─────────────┘    └─────────────┘                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ ESQUEMA DE BASE DE DATOS

### 1. USUARIOS Y AUTENTICACIÓN

```sql
-- ═══════════════════════════════════════════════════════════════
-- TABLA: users (Todos los usuarios del sistema)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email               VARCHAR(255) UNIQUE NOT NULL,
    password_hash       VARCHAR(255),                    -- NULL si usa OAuth

    -- Datos personales
    first_name          VARCHAR(100),
    last_name           VARCHAR(100),
    phone               VARCHAR(20),
    avatar_url          TEXT,

    -- Autenticación
    auth_provider       VARCHAR(20) DEFAULT 'email',     -- 'email', 'google', 'apple'
    auth_provider_id    VARCHAR(255),                    -- ID del proveedor OAuth
    email_verified      BOOLEAN DEFAULT FALSE,
    email_verified_at   TIMESTAMP,

    -- Rol del usuario
    role                VARCHAR(20) DEFAULT 'customer',  -- 'customer', 'employee', 'manager', 'admin', 'owner'

    -- Estado
    status              VARCHAR(20) DEFAULT 'active',    -- 'active', 'inactive', 'suspended', 'banned'

    -- Metadata
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW(),
    last_login_at       TIMESTAMP,

    -- Índices para búsqueda
    CONSTRAINT valid_role CHECK (role IN ('customer', 'employee', 'manager', 'admin', 'owner')),
    CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'suspended', 'banned'))
);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: user_sessions (Sesiones activas)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE user_sessions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id) ON DELETE CASCADE,

    token               VARCHAR(255) UNIQUE NOT NULL,
    device_info         JSONB,                           -- {browser, os, device}
    ip_address          INET,

    expires_at          TIMESTAMP NOT NULL,
    created_at          TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: password_resets (Recuperación de contraseña)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE password_resets (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
    token               VARCHAR(255) UNIQUE NOT NULL,
    expires_at          TIMESTAMP NOT NULL,
    used_at             TIMESTAMP,
    created_at          TIMESTAMP DEFAULT NOW()
);
```

### 2. SISTEMA DE ROLES Y PERMISOS

```sql
-- ═══════════════════════════════════════════════════════════════
-- TABLA: permissions (Permisos disponibles)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE permissions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(100) UNIQUE NOT NULL,
    description         TEXT,
    category            VARCHAR(50),                     -- 'orders', 'products', 'customers', 'analytics', 'settings'
    created_at          TIMESTAMP DEFAULT NOW()
);

-- Permisos predefinidos:
-- orders.view, orders.edit, orders.fulfill, orders.refund
-- products.view, products.create, products.edit, products.delete
-- customers.view, customers.edit, customers.delete
-- analytics.view, analytics.export
-- settings.view, settings.edit
-- employees.view, employees.create, employees.edit, employees.delete

-- ═══════════════════════════════════════════════════════════════
-- TABLA: role_permissions (Permisos por rol)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE role_permissions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role                VARCHAR(20) NOT NULL,
    permission_id       UUID REFERENCES permissions(id) ON DELETE CASCADE,
    created_at          TIMESTAMP DEFAULT NOW(),

    UNIQUE(role, permission_id)
);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: employee_details (Info adicional de empleados)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE employee_details (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    employee_code       VARCHAR(20) UNIQUE,              -- Código interno: EMP-001
    department          VARCHAR(50),                     -- 'ventas', 'almacen', 'atencion_cliente'
    hire_date           DATE,

    -- Permisos específicos (override de rol)
    custom_permissions  JSONB,                           -- Permisos adicionales específicos

    notes               TEXT,                            -- Notas internas
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);
```

### 3. PRODUCTOS E INVENTARIO

```sql
-- ═══════════════════════════════════════════════════════════════
-- TABLA: categories (Categorías de productos)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE categories (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(100) NOT NULL,
    slug                VARCHAR(100) UNIQUE NOT NULL,
    description         TEXT,
    image_url           TEXT,
    parent_id           UUID REFERENCES categories(id),  -- Subcategorías
    sort_order          INTEGER DEFAULT 0,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: products (Productos)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE products (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Info básica
    name                VARCHAR(255) NOT NULL,
    slug                VARCHAR(255) UNIQUE NOT NULL,
    description         TEXT,
    short_description   VARCHAR(500),

    -- Precios
    price               DECIMAL(10,2) NOT NULL,
    compare_at_price    DECIMAL(10,2),                   -- Precio anterior (para mostrar descuento)
    cost_price          DECIMAL(10,2),                   -- Costo real (solo admin)

    -- Categorización
    category_id         UUID REFERENCES categories(id),
    tags                TEXT[],                          -- ['new', 'bestseller', 'limited']

    -- SEO
    meta_title          VARCHAR(255),
    meta_description    TEXT,

    -- Estado
    status              VARCHAR(20) DEFAULT 'draft',     -- 'draft', 'active', 'archived'
    is_featured         BOOLEAN DEFAULT FALSE,

    -- Metadata
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW(),
    published_at        TIMESTAMP,

    created_by          UUID REFERENCES users(id),
    updated_by          UUID REFERENCES users(id)
);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: product_images (Imágenes de productos)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE product_images (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id          UUID REFERENCES products(id) ON DELETE CASCADE,

    url                 TEXT NOT NULL,
    alt_text            VARCHAR(255),
    sort_order          INTEGER DEFAULT 0,
    is_primary          BOOLEAN DEFAULT FALSE,

    created_at          TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: product_variants (Variantes: talla/color)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE product_variants (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id          UUID REFERENCES products(id) ON DELETE CASCADE,

    sku                 VARCHAR(100) UNIQUE NOT NULL,    -- MAAL-TEE-BLK-M

    -- Atributos
    size                VARCHAR(20),                     -- 'XS', 'S', 'M', 'L', 'XL', 'XXL'
    color               VARCHAR(50),
    color_hex           VARCHAR(7),                      -- #000000

    -- Precio (si difiere del producto base)
    price_adjustment    DECIMAL(10,2) DEFAULT 0,

    -- Inventario
    stock_quantity      INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,

    -- Estado
    is_active           BOOLEAN DEFAULT TRUE,

    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: inventory_movements (Historial de inventario)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE inventory_movements (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id          UUID REFERENCES product_variants(id) ON DELETE CASCADE,

    type                VARCHAR(20) NOT NULL,            -- 'purchase', 'sale', 'return', 'adjustment', 'damage'
    quantity            INTEGER NOT NULL,                -- Positivo = entrada, Negativo = salida

    reference_type      VARCHAR(20),                     -- 'order', 'manual', 'return'
    reference_id        UUID,                            -- ID del pedido, devolución, etc.

    notes               TEXT,
    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMP DEFAULT NOW()
);
```

### 4. CLIENTES Y DIRECCIONES

```sql
-- ═══════════════════════════════════════════════════════════════
-- TABLA: customer_profiles (Perfil extendido de clientes)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE customer_profiles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    -- Marketing
    accepts_marketing   BOOLEAN DEFAULT FALSE,
    marketing_opt_in_at TIMESTAMP,

    -- Segmentación
    customer_group      VARCHAR(50) DEFAULT 'standard',  -- 'standard', 'vip', 'wholesale'
    total_spent         DECIMAL(12,2) DEFAULT 0,
    order_count         INTEGER DEFAULT 0,

    -- Preferencias
    preferred_language  VARCHAR(10) DEFAULT 'es',
    currency            VARCHAR(3) DEFAULT 'MXN',

    -- Notas internas (solo staff)
    internal_notes      TEXT,
    tags                TEXT[],                          -- ['vip', 'influencer', 'problema']

    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: addresses (Direcciones de envío/facturación)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE addresses (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id) ON DELETE CASCADE,

    type                VARCHAR(20) DEFAULT 'shipping',  -- 'shipping', 'billing'
    is_default          BOOLEAN DEFAULT FALSE,

    -- Datos
    full_name           VARCHAR(255) NOT NULL,
    phone               VARCHAR(20),

    street_line_1       VARCHAR(255) NOT NULL,
    street_line_2       VARCHAR(255),
    city                VARCHAR(100) NOT NULL,
    state               VARCHAR(100) NOT NULL,
    postal_code         VARCHAR(20) NOT NULL,
    country             VARCHAR(2) DEFAULT 'MX',

    -- Instrucciones
    delivery_notes      TEXT,

    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);
```

### 5. PEDIDOS Y PAGOS

```sql
-- ═══════════════════════════════════════════════════════════════
-- TABLA: orders (Pedidos)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number        VARCHAR(20) UNIQUE NOT NULL,     -- MAAL-2024-00001

    -- Cliente
    user_id             UUID REFERENCES users(id),       -- NULL para guest checkout
    email               VARCHAR(255) NOT NULL,
    phone               VARCHAR(20),

    -- Estado
    status              VARCHAR(30) DEFAULT 'pending',
    -- Estados: pending, confirmed, processing, shipped, delivered, cancelled, refunded

    fulfillment_status  VARCHAR(30) DEFAULT 'unfulfilled',
    -- Estados: unfulfilled, partial, fulfilled

    payment_status      VARCHAR(30) DEFAULT 'pending',
    -- Estados: pending, paid, partially_refunded, refunded, failed

    -- Totales
    subtotal            DECIMAL(12,2) NOT NULL,
    discount_total      DECIMAL(12,2) DEFAULT 0,
    shipping_total      DECIMAL(12,2) DEFAULT 0,
    tax_total           DECIMAL(12,2) DEFAULT 0,
    total               DECIMAL(12,2) NOT NULL,

    currency            VARCHAR(3) DEFAULT 'MXN',

    -- Direcciones (snapshot al momento del pedido)
    shipping_address    JSONB NOT NULL,
    billing_address     JSONB,

    -- Envío
    shipping_method     VARCHAR(100),
    shipping_carrier    VARCHAR(100),
    tracking_number     VARCHAR(255),
    tracking_url        TEXT,

    -- Descuentos
    discount_code       VARCHAR(50),
    discount_id         UUID,

    -- Notas
    customer_notes      TEXT,                            -- Notas del cliente
    internal_notes      TEXT,                            -- Notas internas (staff)

    -- Metadata
    ip_address          INET,
    user_agent          TEXT,
    source              VARCHAR(50) DEFAULT 'web',       -- 'web', 'mobile', 'instagram', 'manual'

    -- Timestamps
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW(),
    confirmed_at        TIMESTAMP,
    shipped_at          TIMESTAMP,
    delivered_at        TIMESTAMP,
    cancelled_at        TIMESTAMP,

    -- Staff
    processed_by        UUID REFERENCES users(id),
    cancelled_by        UUID REFERENCES users(id),
    cancellation_reason TEXT
);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: order_items (Items del pedido)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE order_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID REFERENCES orders(id) ON DELETE CASCADE,

    -- Producto (snapshot)
    product_id          UUID REFERENCES products(id),
    variant_id          UUID REFERENCES product_variants(id),

    product_name        VARCHAR(255) NOT NULL,           -- Snapshot del nombre
    variant_name        VARCHAR(255),                    -- "Negro / M"
    sku                 VARCHAR(100),
    image_url           TEXT,

    -- Cantidades
    quantity            INTEGER NOT NULL,
    quantity_fulfilled  INTEGER DEFAULT 0,

    -- Precios
    unit_price          DECIMAL(10,2) NOT NULL,
    discount_amount     DECIMAL(10,2) DEFAULT 0,
    total               DECIMAL(12,2) NOT NULL,

    created_at          TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: order_status_history (Historial de estados)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE order_status_history (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID REFERENCES orders(id) ON DELETE CASCADE,

    status              VARCHAR(30) NOT NULL,
    notes               TEXT,

    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: payments (Pagos)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID REFERENCES orders(id) ON DELETE CASCADE,

    -- Proveedor de pago
    provider            VARCHAR(50) NOT NULL,            -- 'stripe', 'conekta', 'paypal', 'mercadopago'
    provider_payment_id VARCHAR(255),                    -- ID del pago en el proveedor
    provider_charge_id  VARCHAR(255),

    -- Método
    method              VARCHAR(50),                     -- 'card', 'oxxo', 'spei', 'paypal'
    card_brand          VARCHAR(20),                     -- 'visa', 'mastercard', 'amex'
    card_last_four      VARCHAR(4),

    -- Monto
    amount              DECIMAL(12,2) NOT NULL,
    currency            VARCHAR(3) DEFAULT 'MXN',

    -- Estado
    status              VARCHAR(30) DEFAULT 'pending',   -- 'pending', 'completed', 'failed', 'refunded'

    -- Metadata
    metadata            JSONB,                           -- Respuesta completa del proveedor

    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW(),
    completed_at        TIMESTAMP,
    failed_at           TIMESTAMP,
    failure_reason      TEXT
);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: refunds (Reembolsos)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE refunds (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID REFERENCES orders(id) ON DELETE CASCADE,
    payment_id          UUID REFERENCES payments(id),

    amount              DECIMAL(12,2) NOT NULL,
    reason              VARCHAR(255),
    notes               TEXT,

    status              VARCHAR(30) DEFAULT 'pending',   -- 'pending', 'completed', 'failed'

    provider_refund_id  VARCHAR(255),

    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMP DEFAULT NOW(),
    completed_at        TIMESTAMP
);
```

### 6. CARRITO Y WISHLIST

```sql
-- ═══════════════════════════════════════════════════════════════
-- TABLA: carts (Carritos)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE carts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id          VARCHAR(255),                    -- Para usuarios no logueados

    -- Estado
    status              VARCHAR(20) DEFAULT 'active',    -- 'active', 'converted', 'abandoned'

    -- Totales (calculados)
    subtotal            DECIMAL(12,2) DEFAULT 0,
    discount_total      DECIMAL(12,2) DEFAULT 0,
    total               DECIMAL(12,2) DEFAULT 0,

    -- Descuento aplicado
    discount_code       VARCHAR(50),

    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW(),
    converted_at        TIMESTAMP,                       -- Cuando se convierte en pedido

    -- Para recuperación de carritos abandonados
    abandoned_email_sent_at TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: cart_items (Items del carrito)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE cart_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id             UUID REFERENCES carts(id) ON DELETE CASCADE,

    product_id          UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_id          UUID REFERENCES product_variants(id) ON DELETE CASCADE,

    quantity            INTEGER NOT NULL DEFAULT 1,

    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW(),

    UNIQUE(cart_id, variant_id)
);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: wishlists (Lista de deseos)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE wishlists (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id          UUID REFERENCES products(id) ON DELETE CASCADE,

    created_at          TIMESTAMP DEFAULT NOW(),

    UNIQUE(user_id, product_id)
);
```

### 7. DESCUENTOS Y PROMOCIONES

```sql
-- ═══════════════════════════════════════════════════════════════
-- TABLA: discounts (Códigos de descuento)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE discounts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    code                VARCHAR(50) UNIQUE NOT NULL,
    description         TEXT,

    -- Tipo de descuento
    type                VARCHAR(20) NOT NULL,            -- 'percentage', 'fixed_amount', 'free_shipping'
    value               DECIMAL(10,2) NOT NULL,          -- 15 (%) o 100 ($)

    -- Restricciones
    minimum_purchase    DECIMAL(10,2),                   -- Mínimo de compra
    maximum_discount    DECIMAL(10,2),                   -- Descuento máximo (para %)

    -- Límites de uso
    usage_limit         INTEGER,                         -- Usos totales permitidos
    usage_count         INTEGER DEFAULT 0,               -- Usos actuales
    usage_limit_per_user INTEGER DEFAULT 1,              -- Usos por usuario

    -- Validez
    starts_at           TIMESTAMP DEFAULT NOW(),
    expires_at          TIMESTAMP,

    -- Aplicabilidad
    applies_to          VARCHAR(20) DEFAULT 'all',       -- 'all', 'specific_products', 'specific_categories'
    product_ids         UUID[],
    category_ids        UUID[],

    -- Estado
    is_active           BOOLEAN DEFAULT TRUE,

    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: discount_usage (Uso de descuentos)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE discount_usage (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discount_id         UUID REFERENCES discounts(id) ON DELETE CASCADE,
    user_id             UUID REFERENCES users(id),
    order_id            UUID REFERENCES orders(id),

    amount_saved        DECIMAL(10,2),

    created_at          TIMESTAMP DEFAULT NOW()
);
```

### 8. ANALYTICS Y EVENTOS

```sql
-- ═══════════════════════════════════════════════════════════════
-- TABLA: analytics_events (Eventos de usuario)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE analytics_events (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identificación
    user_id             UUID REFERENCES users(id),
    session_id          VARCHAR(255) NOT NULL,

    -- Evento
    event_name          VARCHAR(100) NOT NULL,
    -- Eventos principales:
    -- page_view, product_view, add_to_cart, remove_from_cart,
    -- begin_checkout, add_shipping_info, add_payment_info,
    -- purchase, search, login, signup

    event_category      VARCHAR(50),                     -- 'ecommerce', 'engagement', 'account'

    -- Datos del evento
    properties          JSONB,                           -- {product_id, value, currency, etc}

    -- Página
    page_url            TEXT,
    page_title          VARCHAR(255),
    referrer            TEXT,

    -- Dispositivo
    device_type         VARCHAR(20),                     -- 'desktop', 'mobile', 'tablet'
    browser             VARCHAR(50),
    os                  VARCHAR(50),
    screen_resolution   VARCHAR(20),

    -- Ubicación
    ip_address          INET,
    country             VARCHAR(2),
    city                VARCHAR(100),

    -- UTM
    utm_source          VARCHAR(100),
    utm_medium          VARCHAR(100),
    utm_campaign        VARCHAR(100),
    utm_term            VARCHAR(100),
    utm_content         VARCHAR(100),

    created_at          TIMESTAMP DEFAULT NOW()
);

-- Índices para queries de analytics
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: page_views (Vistas de página detalladas)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE page_views (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    session_id          VARCHAR(255) NOT NULL,
    user_id             UUID REFERENCES users(id),

    page_url            TEXT NOT NULL,
    page_type           VARCHAR(50),                     -- 'home', 'collection', 'product', 'cart', 'checkout'

    -- Tiempo en página
    time_on_page        INTEGER,                         -- Segundos
    scroll_depth        INTEGER,                         -- Porcentaje 0-100

    -- Interacciones
    interactions        JSONB,                           -- {clicks: [], hovers: []}

    created_at          TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: conversion_funnel (Embudo de conversión)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE conversion_funnel (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    session_id          VARCHAR(255) NOT NULL,
    user_id             UUID REFERENCES users(id),

    -- Etapas alcanzadas
    visited_home        BOOLEAN DEFAULT FALSE,
    visited_collection  BOOLEAN DEFAULT FALSE,
    viewed_product      BOOLEAN DEFAULT FALSE,
    added_to_cart       BOOLEAN DEFAULT FALSE,
    began_checkout      BOOLEAN DEFAULT FALSE,
    added_shipping      BOOLEAN DEFAULT FALSE,
    added_payment       BOOLEAN DEFAULT FALSE,
    completed_purchase  BOOLEAN DEFAULT FALSE,

    -- Timestamps de cada etapa
    home_at             TIMESTAMP,
    collection_at       TIMESTAMP,
    product_at          TIMESTAMP,
    cart_at             TIMESTAMP,
    checkout_at         TIMESTAMP,
    shipping_at         TIMESTAMP,
    payment_at          TIMESTAMP,
    purchase_at         TIMESTAMP,

    -- Abandono
    abandoned_at        VARCHAR(50),                     -- Etapa donde abandonó

    -- Resultado
    order_id            UUID REFERENCES orders(id),
    order_value         DECIMAL(12,2),

    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);
```

### 9. NOTIFICACIONES Y COMUNICACIÓN

```sql
-- ═══════════════════════════════════════════════════════════════
-- TABLA: notifications (Notificaciones internas)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE notifications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id) ON DELETE CASCADE,

    type                VARCHAR(50) NOT NULL,            -- 'order_update', 'low_stock', 'new_order', etc
    title               VARCHAR(255) NOT NULL,
    message             TEXT NOT NULL,

    -- Link relacionado
    link_url            TEXT,
    link_text           VARCHAR(100),

    -- Estado
    read_at             TIMESTAMP,

    created_at          TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: email_logs (Historial de emails enviados)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE email_logs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id             UUID REFERENCES users(id),
    email               VARCHAR(255) NOT NULL,

    type                VARCHAR(50) NOT NULL,            -- 'order_confirmation', 'shipping', 'abandoned_cart', etc
    subject             VARCHAR(255) NOT NULL,

    -- Estado
    status              VARCHAR(20) DEFAULT 'sent',      -- 'sent', 'delivered', 'opened', 'clicked', 'bounced'

    -- Tracking
    opened_at           TIMESTAMP,
    clicked_at          TIMESTAMP,

    -- Referencia
    reference_type      VARCHAR(50),                     -- 'order', 'cart'
    reference_id        UUID,

    created_at          TIMESTAMP DEFAULT NOW()
);
```

### 10. CONFIGURACIÓN Y LOGS

```sql
-- ═══════════════════════════════════════════════════════════════
-- TABLA: store_settings (Configuración de la tienda)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE store_settings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key                 VARCHAR(100) UNIQUE NOT NULL,
    value               JSONB NOT NULL,
    description         TEXT,
    updated_by          UUID REFERENCES users(id),
    updated_at          TIMESTAMP DEFAULT NOW()
);

-- Settings predefinidos:
-- store_name, store_email, store_phone
-- currency, tax_rate
-- shipping_methods, shipping_zones
-- payment_methods
-- email_templates
-- notification_settings

-- ═══════════════════════════════════════════════════════════════
-- TABLA: activity_logs (Auditoría de acciones)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE activity_logs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id             UUID REFERENCES users(id),

    action              VARCHAR(100) NOT NULL,           -- 'order.created', 'product.updated', 'user.login'
    entity_type         VARCHAR(50),                     -- 'order', 'product', 'user'
    entity_id           UUID,

    -- Cambios
    old_values          JSONB,
    new_values          JSONB,

    -- Contexto
    ip_address          INET,
    user_agent          TEXT,

    created_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);
```

---

## 👥 SISTEMA DE ROLES

### Jerarquía de Roles

```
┌─────────────────────────────────────────────────────────────────┐
│                          OWNER                                   │
│                    (Acceso total)                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          ADMIN                                   │
│         (Todo excepto configuración crítica)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         MANAGER                                  │
│     (Pedidos, productos, clientes, reportes básicos)           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         EMPLOYEE                                 │
│           (Ver/procesar pedidos, ver clientes)                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         CUSTOMER                                 │
│              (Solo su cuenta y pedidos)                         │
└─────────────────────────────────────────────────────────────────┘
```

### Matriz de Permisos

| Permiso | Customer | Employee | Manager | Admin | Owner |
|---------|----------|----------|---------|-------|-------|
| **PEDIDOS** |
| Ver sus pedidos | ✅ | - | - | - | - |
| Ver todos los pedidos | ❌ | ✅ | ✅ | ✅ | ✅ |
| Procesar pedidos | ❌ | ✅ | ✅ | ✅ | ✅ |
| Cancelar pedidos | ❌ | ❌ | ✅ | ✅ | ✅ |
| Reembolsar | ❌ | ❌ | ✅ | ✅ | ✅ |
| **PRODUCTOS** |
| Ver productos | ✅ | ✅ | ✅ | ✅ | ✅ |
| Crear productos | ❌ | ❌ | ✅ | ✅ | ✅ |
| Editar productos | ❌ | ❌ | ✅ | ✅ | ✅ |
| Eliminar productos | ❌ | ❌ | ❌ | ✅ | ✅ |
| **INVENTARIO** |
| Ver stock | ❌ | ✅ | ✅ | ✅ | ✅ |
| Ajustar stock | ❌ | ❌ | ✅ | ✅ | ✅ |
| **CLIENTES** |
| Ver su perfil | ✅ | - | - | - | - |
| Ver todos los clientes | ❌ | ✅ | ✅ | ✅ | ✅ |
| Editar clientes | ❌ | ❌ | ✅ | ✅ | ✅ |
| Eliminar clientes | ❌ | ❌ | ❌ | ✅ | ✅ |
| **DESCUENTOS** |
| Usar códigos | ✅ | ✅ | ✅ | ✅ | ✅ |
| Crear códigos | ❌ | ❌ | ✅ | ✅ | ✅ |
| **ANALYTICS** |
| Ver dashboard | ❌ | ❌ | ✅ | ✅ | ✅ |
| Ver reportes completos | ❌ | ❌ | ❌ | ✅ | ✅ |
| Exportar datos | ❌ | ❌ | ❌ | ✅ | ✅ |
| **EMPLEADOS** |
| Ver empleados | ❌ | ❌ | ✅ | ✅ | ✅ |
| Crear empleados | ❌ | ❌ | ❌ | ✅ | ✅ |
| Editar roles | ❌ | ❌ | ❌ | ❌ | ✅ |
| **CONFIGURACIÓN** |
| Ver configuración | ❌ | ❌ | ❌ | ✅ | ✅ |
| Editar configuración | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 📊 PANEL ADMINISTRATIVO - PÁGINAS

### Estructura de Navegación

```
ADMIN PANEL (Web3 Dark Style)
│
├── 📊 DASHBOARD
│   ├── Resumen de ventas (hoy, semana, mes)
│   ├── Pedidos recientes
│   ├── Productos bajo stock
│   ├── Gráficas de revenue
│   └── Actividad en tiempo real
│
├── 🛒 PEDIDOS
│   ├── Lista de pedidos (filtros por estado)
│   ├── Detalle de pedido
│   ├── Procesar/Fulfillment
│   ├── Imprimir guía
│   └── Historial de estados
│
├── 📦 PRODUCTOS
│   ├── Lista de productos
│   ├── Crear/Editar producto
│   ├── Variantes (tallas/colores)
│   ├── Inventario
│   └── Categorías
│
├── 👥 CLIENTES
│   ├── Lista de clientes
│   ├── Perfil de cliente
│   ├── Historial de pedidos
│   └── Segmentación
│
├── 📈 ANALYTICS
│   ├── Overview
│   ├── Embudo de conversión
│   ├── Comportamiento de usuarios
│   ├── Productos más vistos
│   ├── Fuentes de tráfico
│   └── Reportes personalizados
│
├── 💰 FINANZAS
│   ├── Ingresos
│   ├── Pagos recibidos
│   ├── Reembolsos
│   └── Exportar reportes
│
├── 🏷️ MARKETING
│   ├── Códigos de descuento
│   ├── Carritos abandonados
│   └── Email campaigns (futuro)
│
├── 👤 EQUIPO
│   ├── Lista de empleados
│   ├── Crear/Editar empleado
│   ├── Asignar permisos
│   └── Actividad de empleados
│
└── ⚙️ CONFIGURACIÓN
    ├── Tienda
    ├── Pagos
    ├── Envíos
    ├── Notificaciones
    └── Integraciones
```

---

## 📈 MÉTRICAS Y KPIs A TRACKEAR

### Dashboard Principal

| Métrica | Descripción |
|---------|-------------|
| **Revenue Today** | Ingresos del día |
| **Orders Today** | Pedidos del día |
| **Average Order Value** | Valor promedio por pedido |
| **Conversion Rate** | Visitantes → Compradores |
| **Cart Abandonment Rate** | % carritos abandonados |
| **Returning Customers** | % clientes que recompran |

### Embudo de Conversión

```
Visitantes Únicos      →  100%
    ↓
Vieron Producto        →   45%
    ↓
Añadieron al Carrito   →   12%
    ↓
Iniciaron Checkout     →    6%
    ↓
Completaron Compra     →    3%
```

### Por Producto

- Vistas
- Añadido a carrito
- Comprado
- Tasa de conversión
- Revenue generado

---

## 🛠️ TECNOLOGÍAS RECOMENDADAS

| Componente | Tecnología | Razón |
|------------|------------|-------|
| **Database** | Neon (Postgres) | Serverless, gratis para empezar |
| **ORM** | Prisma | Type-safe, migraciones fáciles |
| **Auth** | NextAuth.js | OAuth + credentials, fácil de implementar |
| **Pagos** | Stripe + Conekta | Internacional + México (OXXO, SPEI) |
| **Email** | Resend | API moderna, templates fáciles |
| **Storage** | Cloudinary o Uploadthing | Imágenes de productos |
| **Analytics** | Custom + GA4 | Control total + estándar de industria |
| **Hosting** | Vercel + Railway | Frontend + DB/workers |

---

## 🚀 ORDEN DE IMPLEMENTACIÓN

### Fase 1: Fundamentos (Semana 1-2)
1. ✅ Setup Neon + Prisma
2. ✅ Autenticación (NextAuth)
3. ✅ CRUD de productos
4. ✅ Sistema de usuarios básico

### Fase 2: E-commerce Core (Semana 3-4)
5. ✅ Carrito funcional
6. ✅ Checkout
7. ✅ Integración de pagos (Stripe)
8. ✅ Emails transaccionales

### Fase 3: Admin Panel (Semana 5-6)
9. ✅ Dashboard básico
10. ✅ Gestión de pedidos
11. ✅ Gestión de productos
12. ✅ Sistema de roles

### Fase 4: Analytics (Semana 7-8)
13. ✅ Tracking de eventos
14. ✅ Embudo de conversión
15. ✅ Reportes y gráficas
16. ✅ Exportación de datos

### Fase 5: Optimización (Continuo)
17. ✅ Carritos abandonados
18. ✅ Notificaciones
19. ✅ Optimización de performance
20. ✅ Tests y QA

---

## ❓ PREGUNTAS PARA DEFINIR

1. **¿Habrá guest checkout?** (Comprar sin crear cuenta)
2. **¿Qué métodos de pago en México?** (Tarjeta, OXXO, SPEI, MSI)
3. **¿Integración con paqueterías?** (Estafeta, DHL, Fedex, 99minutos)
4. **¿Facturación automática?** (CFDI)
5. **¿Multi-idioma?** (Español + English)
6. **¿Multi-moneda?** (MXN + USD)
