# MAAL LINE — Arquitectura de Base de Datos Final

> Sistema completo de e-commerce para streetwear con soporte para drops, reservas de inventario, analytics avanzado y panel administrativo.

---

## 📐 Diagrama General del Sistema

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           MAAL LINE E-COMMERCE SYSTEM                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐ │
│    │   TIENDA    │     │    ADMIN    │     │  EMPLEADOS  │     │  CLIENTES   │ │
│    │  (Público)  │     │   (Owner)   │     │   (Staff)   │     │ (Mi Cuenta) │ │
│    └──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘ │
│           │                   │                   │                   │         │
│           └───────────────────┴───────────────────┴───────────────────┘         │
│                                       │                                          │
│                           ┌───────────▼───────────┐                             │
│                           │     NEXT.JS API       │                             │
│                           │   (API Routes/tRPC)   │                             │
│                           └───────────┬───────────┘                             │
│                                       │                                          │
│     ┌─────────────┬───────────────────┼───────────────────┬─────────────┐       │
│     │             │                   │                   │             │       │
│     ▼             ▼                   ▼                   ▼             ▼       │
│ ┌───────┐   ┌──────────┐       ┌──────────┐       ┌──────────┐   ┌──────────┐  │
│ │ NEON  │   │  STRIPE  │       │ CONEKTA  │       │  RESEND  │   │CLOUDINARY│  │
│ │(Postgres)│ │ (Pagos)  │       │(MX Pagos)│       │ (Email)  │   │(Imágenes)│  │
│ └───────┘   └──────────┘       └──────────┘       └──────────┘   └──────────┘  │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ ÍNDICE DE TABLAS

| # | Módulo | Tablas |
|---|--------|--------|
| 1 | Usuarios & Auth | `users`, `user_sessions`, `password_resets` |
| 2 | Roles & Permisos | `permissions`, `role_permissions`, `employee_details` |
| 3 | Productos | `products`, `product_images`, `product_variants`, `variant_options` |
| 4 | Categorías & Collections | `categories`, `collections`, `collection_products` |
| 5 | Inventario | `inventory_movements`, `inventory_reservations` |
| 6 | Clientes | `customer_profiles`, `addresses`, `product_waitlist` |
| 7 | Carrito & Wishlist | `carts`, `cart_items`, `wishlists` |
| 8 | Pedidos | `orders`, `order_items`, `order_status_history` |
| 9 | Pagos | `payments`, `refunds`, `webhook_events`, `idempotency_keys` |
| 10 | Envíos | `shipments`, `shipment_items` |
| 11 | Devoluciones | `returns`, `return_items` |
| 12 | Descuentos | `discounts`, `discount_usage` |
| 13 | Analytics | `analytics_events`, `page_views`, `conversion_funnel` |
| 14 | Notificaciones | `notifications`, `email_logs` |
| 15 | Configuración | `store_settings`, `activity_logs` |

**Total: 35 tablas**

---

## 1. 👤 USUARIOS Y AUTENTICACIÓN

### users
Todos los usuarios del sistema: clientes, empleados, admins.

```sql
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Credenciales
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
    email_verified_at   TIMESTAMPTZ,

    -- Rol del usuario
    role                VARCHAR(20) DEFAULT 'customer',
    -- Roles: 'customer', 'employee', 'manager', 'admin', 'owner'

    -- Estado
    status              VARCHAR(20) DEFAULT 'active',
    -- Estados: 'active', 'inactive', 'suspended', 'banned'

    -- Metadata
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    last_login_at       TIMESTAMPTZ,

    CONSTRAINT valid_role CHECK (role IN ('customer', 'employee', 'manager', 'admin', 'owner')),
    CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'suspended', 'banned'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
```

### user_sessions
Sesiones activas de usuarios.

```sql
CREATE TABLE user_sessions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    token               VARCHAR(255) UNIQUE NOT NULL,
    device_info         JSONB,                           -- {browser, os, device}
    ip_address          INET,

    expires_at          TIMESTAMPTZ NOT NULL,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token);
```

### password_resets
Tokens para recuperación de contraseña.

```sql
CREATE TABLE password_resets (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    token               VARCHAR(255) UNIQUE NOT NULL,
    expires_at          TIMESTAMPTZ NOT NULL,
    used_at             TIMESTAMPTZ,

    created_at          TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 2. 🔐 ROLES Y PERMISOS

### permissions
Permisos disponibles en el sistema.

```sql
CREATE TABLE permissions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    code                VARCHAR(100) UNIQUE NOT NULL,    -- 'orders.view', 'products.edit'
    name                VARCHAR(100) NOT NULL,
    description         TEXT,
    category            VARCHAR(50),                     -- 'orders', 'products', 'customers', etc.

    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Permisos predefinidos:
-- ORDERS: orders.view, orders.create, orders.edit, orders.cancel, orders.fulfill, orders.refund
-- PRODUCTS: products.view, products.create, products.edit, products.delete, products.publish
-- INVENTORY: inventory.view, inventory.adjust
-- CUSTOMERS: customers.view, customers.edit, customers.delete
-- ANALYTICS: analytics.view, analytics.export
-- DISCOUNTS: discounts.view, discounts.create, discounts.edit, discounts.delete
-- EMPLOYEES: employees.view, employees.create, employees.edit, employees.delete
-- SETTINGS: settings.view, settings.edit
```

### role_permissions
Asignación de permisos a roles.

```sql
CREATE TABLE role_permissions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    role                VARCHAR(20) NOT NULL,
    permission_id       UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,

    created_at          TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(role, permission_id)
);

CREATE INDEX idx_role_permissions_role ON role_permissions(role);
```

### employee_details
Información adicional para empleados.

```sql
CREATE TABLE employee_details (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    employee_code       VARCHAR(20) UNIQUE,              -- EMP-001
    department          VARCHAR(50),                     -- 'ventas', 'almacen', 'atencion_cliente'
    position            VARCHAR(100),
    hire_date           DATE,

    -- Permisos personalizados (override de rol)
    custom_permissions  UUID[],                          -- Array de permission IDs adicionales

    notes               TEXT,                            -- Notas internas

    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);
```

### Matriz de Permisos por Rol

| Permiso | Customer | Employee | Manager | Admin | Owner |
|---------|:--------:|:--------:|:-------:|:-----:|:-----:|
| **PEDIDOS** |
| Ver sus pedidos | ✅ | — | — | — | — |
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
| Ver su perfil | ✅ | — | — | — | — |
| Ver todos los clientes | ❌ | ✅ | ✅ | ✅ | ✅ |
| Editar clientes | ❌ | ❌ | ✅ | ✅ | ✅ |
| **ANALYTICS** |
| Ver dashboard | ❌ | ❌ | ✅ | ✅ | ✅ |
| Ver reportes completos | ❌ | ❌ | ❌ | ✅ | ✅ |
| Exportar datos | ❌ | ❌ | ❌ | ✅ | ✅ |
| **EMPLEADOS** |
| Ver empleados | ❌ | ❌ | ✅ | ✅ | ✅ |
| Gestionar empleados | ❌ | ❌ | ❌ | ✅ | ✅ |
| Editar roles | ❌ | ❌ | ❌ | ❌ | ✅ |
| **CONFIGURACIÓN** |
| Ver configuración | ❌ | ❌ | ❌ | ✅ | ✅ |
| Editar configuración | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 3. 📦 PRODUCTOS

### products
Catálogo de productos.

```sql
CREATE TABLE products (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Info básica
    name                VARCHAR(255) NOT NULL,
    slug                VARCHAR(255) UNIQUE NOT NULL,
    description         TEXT,
    short_description   VARCHAR(500),

    -- Precios
    price               DECIMAL(10,2) NOT NULL,
    compare_at_price    DECIMAL(10,2),                   -- Precio anterior (descuento)
    cost_price          DECIMAL(10,2),                   -- Costo real (solo admin)

    -- Categorización
    category_id         UUID REFERENCES categories(id),
    tags                TEXT[],                          -- ['new', 'bestseller', 'limited']

    -- SEO
    meta_title          VARCHAR(255),
    meta_description    TEXT,

    -- Estado
    status              VARCHAR(20) DEFAULT 'draft',
    -- Estados: 'draft', 'active', 'archived'

    is_featured         BOOLEAN DEFAULT FALSE,

    -- Metadata
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    published_at        TIMESTAMPTZ,

    created_by          UUID REFERENCES users(id),
    updated_by          UUID REFERENCES users(id)
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;
```

### product_images
Imágenes de productos.

```sql
CREATE TABLE product_images (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id          UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

    url                 TEXT NOT NULL,
    alt_text            VARCHAR(255),
    sort_order          INTEGER DEFAULT 0,
    is_primary          BOOLEAN DEFAULT FALSE,

    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON product_images(product_id);
```

### product_variants
Variantes de producto (talla, color).

```sql
CREATE TABLE product_variants (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id          UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

    sku                 VARCHAR(100) UNIQUE NOT NULL,    -- MAAL-TEE-BLK-M

    -- Atributos principales
    size                VARCHAR(20),                     -- 'XS', 'S', 'M', 'L', 'XL', 'XXL'
    color               VARCHAR(50),
    color_hex           VARCHAR(7),                      -- #000000

    -- Precio diferencial
    price_adjustment    DECIMAL(10,2) DEFAULT 0,

    -- Inventario
    stock_quantity      INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,

    -- Estado
    is_active           BOOLEAN DEFAULT TRUE,

    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
```

### variant_options
Opciones adicionales de variantes (escalable para futuro).

```sql
CREATE TABLE variant_options (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_variant_id  UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,

    option_name         VARCHAR(50) NOT NULL,            -- 'size', 'color', 'fit', 'material'
    option_value        VARCHAR(100) NOT NULL,

    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_variant_options_variant ON variant_options(product_variant_id);
```

---

## 4. 🏷️ CATEGORÍAS Y COLLECTIONS

### categories
Categorías de productos.

```sql
CREATE TABLE categories (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name                VARCHAR(100) NOT NULL,
    slug                VARCHAR(100) UNIQUE NOT NULL,
    description         TEXT,
    image_url           TEXT,

    parent_id           UUID REFERENCES categories(id),  -- Subcategorías

    sort_order          INTEGER DEFAULT 0,
    is_active           BOOLEAN DEFAULT TRUE,

    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);
```

### collections
Collections y Drops (core para streetwear).

```sql
CREATE TABLE collections (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name                VARCHAR(100) NOT NULL,
    slug                VARCHAR(120) UNIQUE NOT NULL,
    description         TEXT,

    -- Tipo de collection
    type                VARCHAR(30) DEFAULT 'seasonal',
    -- Tipos: 'drop', 'seasonal', 'collab', 'permanent'

    -- Imágenes
    hero_image          TEXT,
    thumbnail_image     TEXT,

    -- Temporalidad
    starts_at           TIMESTAMPTZ,
    ends_at             TIMESTAMPTZ,

    -- Acceso
    access_type         VARCHAR(20) DEFAULT 'public',
    -- Tipos: 'public', 'early_access', 'vip_only', 'password'
    access_password     VARCHAR(100),                    -- Para drops privados

    -- Estado
    is_active           BOOLEAN DEFAULT FALSE,
    is_featured         BOOLEAN DEFAULT FALSE,

    -- SEO
    meta_title          VARCHAR(255),
    meta_description    TEXT,

    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_collections_slug ON collections(slug);
CREATE INDEX idx_collections_type ON collections(type);
CREATE INDEX idx_collections_active ON collections(is_active);
CREATE INDEX idx_collections_dates ON collections(starts_at, ends_at);
```

### collection_products
Productos en cada collection.

```sql
CREATE TABLE collection_products (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id       UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    product_id          UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

    sort_order          INTEGER DEFAULT 0,

    created_at          TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(collection_id, product_id)
);

CREATE INDEX idx_collection_products_collection ON collection_products(collection_id);
```

---

## 5. 📊 INVENTARIO

### inventory_movements
Historial de movimientos de inventario (fuente de verdad).

```sql
CREATE TABLE inventory_movements (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id          UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,

    -- Tipo de movimiento
    type                VARCHAR(20) NOT NULL,
    -- Tipos: 'purchase', 'sale', 'return', 'adjustment', 'damage', 'transfer'

    quantity            INTEGER NOT NULL,                -- Positivo = entrada, Negativo = salida

    -- Referencia
    reference_type      VARCHAR(20),                     -- 'order', 'return', 'manual'
    reference_id        UUID,

    -- Stock resultante
    stock_after         INTEGER NOT NULL,

    notes               TEXT,
    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_movements_variant ON inventory_movements(variant_id);
CREATE INDEX idx_inventory_movements_type ON inventory_movements(type);
CREATE INDEX idx_inventory_movements_created ON inventory_movements(created_at);
```

### inventory_reservations
Reservas temporales de stock (prevención de overselling).

```sql
CREATE TABLE inventory_reservations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_variant_id  UUID NOT NULL REFERENCES product_variants(id),

    -- Quién reservó
    user_id             UUID REFERENCES users(id),
    cart_id             UUID,
    checkout_session_id UUID,

    quantity            INTEGER NOT NULL CHECK (quantity > 0),

    -- Estado
    status              VARCHAR(20) NOT NULL DEFAULT 'active',
    -- Estados: 'active', 'released', 'converted'

    expires_at          TIMESTAMPTZ NOT NULL,

    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_reservations_variant ON inventory_reservations(product_variant_id);
CREATE INDEX idx_inventory_reservations_status ON inventory_reservations(status);
CREATE INDEX idx_inventory_reservations_expires ON inventory_reservations(expires_at);
```

**Flujo de reservas:**
```
Add to cart    → Crear reserva (15 min)
Checkout init  → Renovar expires_at (30 min)
Pago exitoso   → status = 'converted' + inventory_movement
Expira/Cancel  → status = 'released'
```

---

## 6. 👥 CLIENTES

### customer_profiles
Perfil extendido de clientes.

```sql
CREATE TABLE customer_profiles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Marketing
    accepts_marketing   BOOLEAN DEFAULT FALSE,
    marketing_opt_in_at TIMESTAMPTZ,

    -- Segmentación
    customer_group      VARCHAR(50) DEFAULT 'standard',
    -- Grupos: 'standard', 'vip', 'wholesale', 'influencer'

    -- Métricas
    total_spent         DECIMAL(12,2) DEFAULT 0,
    order_count         INTEGER DEFAULT 0,
    average_order_value DECIMAL(10,2) DEFAULT 0,

    -- Preferencias
    preferred_language  VARCHAR(10) DEFAULT 'es',
    currency            VARCHAR(3) DEFAULT 'MXN',

    -- Notas internas (solo staff)
    internal_notes      TEXT,
    tags                TEXT[],                          -- ['vip', 'influencer', 'problema']

    -- Fechas importantes
    first_order_at      TIMESTAMPTZ,
    last_order_at       TIMESTAMPTZ,
    birthday            DATE,

    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customer_profiles_group ON customer_profiles(customer_group);
```

### addresses
Direcciones de envío y facturación.

```sql
CREATE TABLE addresses (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Tipo
    type                VARCHAR(20) DEFAULT 'shipping',  -- 'shipping', 'billing'
    is_default          BOOLEAN DEFAULT FALSE,

    -- Nombre/Contacto
    full_name           VARCHAR(255) NOT NULL,
    phone               VARCHAR(20),

    -- Dirección
    street_line_1       VARCHAR(255) NOT NULL,
    street_line_2       VARCHAR(255),
    neighborhood        VARCHAR(100),                    -- Colonia (México)
    city                VARCHAR(100) NOT NULL,
    state               VARCHAR(100) NOT NULL,
    postal_code         VARCHAR(20) NOT NULL,
    country             VARCHAR(2) DEFAULT 'MX',

    -- Instrucciones
    delivery_notes      TEXT,

    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_addresses_user ON addresses(user_id);
```

### product_waitlist
Lista de espera para productos agotados.

```sql
CREATE TABLE product_waitlist (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_variant_id  UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,

    email               VARCHAR(255) NOT NULL,           -- Para notificar

    notified_at         TIMESTAMPTZ,
    purchased_at        TIMESTAMPTZ,

    created_at          TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, product_variant_id)
);

CREATE INDEX idx_product_waitlist_variant ON product_waitlist(product_variant_id);
```

---

## 7. 🛒 CARRITO Y WISHLIST

### carts
Carritos de compra.

```sql
CREATE TABLE carts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identificación
    user_id             UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id          VARCHAR(255),                    -- Para guest users

    -- Estado
    status              VARCHAR(20) DEFAULT 'active',
    -- Estados: 'active', 'converted', 'abandoned'

    -- Totales calculados
    subtotal            DECIMAL(12,2) DEFAULT 0,
    discount_total      DECIMAL(12,2) DEFAULT 0,
    total               DECIMAL(12,2) DEFAULT 0,

    -- Descuento aplicado
    discount_code       VARCHAR(50),
    discount_id         UUID,

    -- Timestamps
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    converted_at        TIMESTAMPTZ,

    -- Recovery
    abandoned_email_sent_at TIMESTAMPTZ
);

CREATE INDEX idx_carts_user ON carts(user_id);
CREATE INDEX idx_carts_session ON carts(session_id);
CREATE INDEX idx_carts_status ON carts(status);
```

### cart_items
Items en el carrito.

```sql
CREATE TABLE cart_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id             UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,

    product_id          UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id          UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,

    quantity            INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),

    -- Precio al momento de agregar (por si cambia)
    unit_price          DECIMAL(10,2),

    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(cart_id, variant_id)
);

CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
```

### wishlists
Lista de deseos.

```sql
CREATE TABLE wishlists (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id          UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

    created_at          TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_wishlists_user ON wishlists(user_id);
```

---

## 8. 📋 PEDIDOS

### orders
Pedidos de clientes.

```sql
CREATE TABLE orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number        VARCHAR(20) UNIQUE NOT NULL,     -- MAAL-2024-00001

    -- Cliente
    user_id             UUID REFERENCES users(id),       -- NULL para guest checkout
    email               VARCHAR(255) NOT NULL,
    phone               VARCHAR(20),

    -- Estados
    status              VARCHAR(30) DEFAULT 'pending',
    -- Estados: 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'

    fulfillment_status  VARCHAR(30) DEFAULT 'unfulfilled',
    -- Estados: 'unfulfilled', 'partial', 'fulfilled'

    payment_status      VARCHAR(30) DEFAULT 'pending',
    -- Estados: 'pending', 'paid', 'partially_refunded', 'refunded', 'failed'

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

    -- Descuentos
    discount_code       VARCHAR(50),
    discount_id         UUID,

    -- Notas
    customer_notes      TEXT,
    internal_notes      TEXT,

    -- Metadata
    ip_address          INET,
    user_agent          TEXT,
    source              VARCHAR(50) DEFAULT 'web',       -- 'web', 'mobile', 'instagram', 'manual'

    -- UTM tracking
    utm_source          VARCHAR(100),
    utm_medium          VARCHAR(100),
    utm_campaign        VARCHAR(100),

    -- Timestamps
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at        TIMESTAMPTZ,
    shipped_at          TIMESTAMPTZ,
    delivered_at        TIMESTAMPTZ,
    cancelled_at        TIMESTAMPTZ,

    -- Staff
    processed_by        UUID REFERENCES users(id),
    cancelled_by        UUID REFERENCES users(id),
    cancellation_reason TEXT
);

CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created ON orders(created_at);
```

### order_items
Items de cada pedido.

```sql
CREATE TABLE order_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

    -- Producto (referencia + snapshot)
    product_id          UUID REFERENCES products(id),
    variant_id          UUID REFERENCES product_variants(id),

    -- Snapshot al momento del pedido
    product_name        VARCHAR(255) NOT NULL,
    variant_name        VARCHAR(255),                    -- "Negro / M"
    sku                 VARCHAR(100),
    image_url           TEXT,

    -- Cantidades
    quantity            INTEGER NOT NULL CHECK (quantity > 0),
    quantity_fulfilled  INTEGER DEFAULT 0,

    -- Precios
    unit_price          DECIMAL(10,2) NOT NULL,
    discount_amount     DECIMAL(10,2) DEFAULT 0,
    total               DECIMAL(12,2) NOT NULL,

    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
```

### order_status_history
Historial de cambios de estado.

```sql
CREATE TABLE order_status_history (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

    status              VARCHAR(30) NOT NULL,
    previous_status     VARCHAR(30),
    notes               TEXT,

    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_status_history_order ON order_status_history(order_id);
```

---

## 9. 💳 PAGOS

### payments
Pagos procesados.

```sql
CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

    -- Proveedor
    provider            VARCHAR(50) NOT NULL,            -- 'stripe', 'conekta', 'paypal', 'mercadopago'
    provider_payment_id VARCHAR(255),
    provider_charge_id  VARCHAR(255),

    -- Método
    method              VARCHAR(50),                     -- 'card', 'oxxo', 'spei', 'paypal'
    card_brand          VARCHAR(20),                     -- 'visa', 'mastercard', 'amex'
    card_last_four      VARCHAR(4),

    -- Monto
    amount              DECIMAL(12,2) NOT NULL,
    currency            VARCHAR(3) DEFAULT 'MXN',

    -- Estado
    status              VARCHAR(30) DEFAULT 'pending',
    -- Estados: 'pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'

    -- Metadata
    metadata            JSONB,

    -- Timestamps
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    completed_at        TIMESTAMPTZ,
    failed_at           TIMESTAMPTZ,
    failure_reason      TEXT
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_provider ON payments(provider);
CREATE INDEX idx_payments_status ON payments(status);
```

### refunds
Reembolsos procesados.

```sql
CREATE TABLE refunds (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payment_id          UUID NOT NULL REFERENCES payments(id),

    amount              DECIMAL(12,2) NOT NULL,
    reason              VARCHAR(255),
    notes               TEXT,

    status              VARCHAR(30) DEFAULT 'pending',
    -- Estados: 'pending', 'processing', 'completed', 'failed'

    provider_refund_id  VARCHAR(255),

    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    completed_at        TIMESTAMPTZ
);

CREATE INDEX idx_refunds_order ON refunds(order_id);
```

### webhook_events
Eventos de webhooks de proveedores de pago.

```sql
CREATE TABLE webhook_events (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    provider            VARCHAR(30) NOT NULL,            -- 'stripe', 'conekta', 'mercadopago'
    event_id            VARCHAR(150) NOT NULL,           -- ID único del proveedor
    event_type          VARCHAR(100),                    -- 'payment_intent.succeeded'

    payload             JSONB NOT NULL,

    status              VARCHAR(30) DEFAULT 'received',
    -- Estados: 'received', 'processing', 'processed', 'failed'

    error_message       TEXT,

    received_at         TIMESTAMPTZ DEFAULT NOW(),
    processed_at        TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_webhook_provider_event ON webhook_events(provider, event_id);
```

### idempotency_keys
Prevención de operaciones duplicadas.

```sql
CREATE TABLE idempotency_keys (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    key                 VARCHAR(150) UNIQUE NOT NULL,
    scope               VARCHAR(50),                     -- 'payment', 'order', 'refund'

    response            JSONB,                           -- Respuesta guardada

    created_at          TIMESTAMPTZ DEFAULT NOW(),
    expires_at          TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX idx_idempotency_keys_expires ON idempotency_keys(expires_at);
```

---

## 10. 🚚 ENVÍOS

### shipments
Envíos de pedidos.

```sql
CREATE TABLE shipments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

    -- Estado
    status              VARCHAR(30) NOT NULL DEFAULT 'pending',
    -- Estados: 'pending', 'processing', 'shipped', 'in_transit', 'delivered', 'returned', 'failed'

    -- Carrier
    carrier             VARCHAR(50),                     -- 'estafeta', 'dhl', 'fedex', '99minutos'
    service_type        VARCHAR(50),                     -- 'express', 'standard', 'same_day'

    -- Tracking
    tracking_number     VARCHAR(100),
    tracking_url        TEXT,

    -- Labels
    label_url           TEXT,
    label_format        VARCHAR(20),                     -- 'pdf', 'zpl'

    -- Costos
    shipping_cost       DECIMAL(10,2),

    -- Dirección (snapshot)
    shipping_address    JSONB,

    -- Pesos/dimensiones
    weight              DECIMAL(10,2),                   -- kg
    dimensions          JSONB,                           -- {length, width, height}

    -- Timestamps
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    shipped_at          TIMESTAMPTZ,
    delivered_at        TIMESTAMPTZ,

    -- Metadata del carrier
    metadata            JSONB
);

CREATE INDEX idx_shipments_order ON shipments(order_id);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_tracking ON shipments(tracking_number);
```

### shipment_items
Items en cada envío (para envíos parciales).

```sql
CREATE TABLE shipment_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id         UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    order_item_id       UUID NOT NULL REFERENCES order_items(id),

    quantity            INTEGER NOT NULL CHECK (quantity > 0),

    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shipment_items_shipment ON shipment_items(shipment_id);
```

---

## 11. 🔄 DEVOLUCIONES (RMA)

### returns
Solicitudes de devolución.

```sql
CREATE TABLE returns (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_number       VARCHAR(20) UNIQUE NOT NULL,     -- RMA-2024-00001
    order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

    -- Estado
    status              VARCHAR(30) NOT NULL DEFAULT 'requested',
    -- Estados: 'requested', 'approved', 'rejected', 'shipped', 'received', 'inspected', 'refunded', 'completed'

    -- Razón
    reason              VARCHAR(100) NOT NULL,
    -- Razones: 'wrong_size', 'defective', 'not_as_described', 'changed_mind', 'other'
    reason_details      TEXT,

    -- Resolución
    resolution          VARCHAR(30),
    -- Resoluciones: 'refund', 'exchange', 'store_credit'

    -- Envío de retorno
    return_shipping_method VARCHAR(50),
    return_tracking_number VARCHAR(100),
    return_label_url    TEXT,

    -- Montos
    refund_amount       DECIMAL(12,2),
    restocking_fee      DECIMAL(10,2) DEFAULT 0,

    -- Notas
    customer_notes      TEXT,
    internal_notes      TEXT,

    -- Timestamps
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    approved_at         TIMESTAMPTZ,
    received_at         TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,

    created_by          UUID REFERENCES users(id),
    processed_by        UUID REFERENCES users(id)
);

CREATE INDEX idx_returns_order ON returns(order_id);
CREATE INDEX idx_returns_status ON returns(status);
```

### return_items
Items en cada devolución.

```sql
CREATE TABLE return_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_id           UUID NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
    order_item_id       UUID NOT NULL REFERENCES order_items(id),

    quantity            INTEGER NOT NULL CHECK (quantity > 0),

    -- Condición al recibir
    condition           VARCHAR(30),
    -- Condiciones: 'new', 'like_new', 'used', 'damaged'

    -- ¿Regresar a inventario?
    return_to_stock     BOOLEAN DEFAULT FALSE,

    notes               TEXT,

    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_return_items_return ON return_items(return_id);
```

---

## 12. 🏷️ DESCUENTOS

### discounts
Códigos de descuento y promociones.

```sql
CREATE TABLE discounts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    code                VARCHAR(50) UNIQUE NOT NULL,
    description         TEXT,

    -- Tipo
    type                VARCHAR(20) NOT NULL,
    -- Tipos: 'percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y'

    value               DECIMAL(10,2) NOT NULL,          -- 15 (%) o 100 ($)

    -- Restricciones
    minimum_purchase    DECIMAL(10,2),
    maximum_discount    DECIMAL(10,2),

    -- Límites de uso
    usage_limit         INTEGER,                         -- Usos totales
    usage_count         INTEGER DEFAULT 0,
    usage_limit_per_user INTEGER DEFAULT 1,

    -- Validez
    starts_at           TIMESTAMPTZ DEFAULT NOW(),
    expires_at          TIMESTAMPTZ,

    -- Aplicabilidad
    applies_to          VARCHAR(30) DEFAULT 'all',
    -- Tipos: 'all', 'specific_products', 'specific_categories', 'specific_collections'

    product_ids         UUID[],
    category_ids        UUID[],
    collection_ids      UUID[],

    -- Restricciones de cliente
    customer_eligibility VARCHAR(30) DEFAULT 'all',
    -- Tipos: 'all', 'specific_customers', 'customer_groups'
    customer_ids        UUID[],
    customer_groups     TEXT[],

    -- Combinabilidad
    is_combinable       BOOLEAN DEFAULT FALSE,

    -- Estado
    is_active           BOOLEAN DEFAULT TRUE,

    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_discounts_code ON discounts(code);
CREATE INDEX idx_discounts_active ON discounts(is_active);
```

### discount_usage
Registro de uso de descuentos.

```sql
CREATE TABLE discount_usage (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discount_id         UUID NOT NULL REFERENCES discounts(id) ON DELETE CASCADE,
    user_id             UUID REFERENCES users(id),
    order_id            UUID REFERENCES orders(id),

    amount_saved        DECIMAL(10,2),

    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_discount_usage_discount ON discount_usage(discount_id);
CREATE INDEX idx_discount_usage_user ON discount_usage(user_id);
```

---

## 13. 📈 ANALYTICS

### analytics_events
Eventos de comportamiento de usuario.

```sql
CREATE TABLE analytics_events (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identificación
    user_id             UUID REFERENCES users(id),
    session_id          VARCHAR(255) NOT NULL,
    anonymous_id        VARCHAR(255),                    -- Para usuarios no logueados

    -- Evento
    event_name          VARCHAR(100) NOT NULL,
    event_category      VARCHAR(50),

    -- Eventos principales:
    -- page_view, product_view, product_click, add_to_cart, remove_from_cart,
    -- begin_checkout, add_shipping_info, add_payment_info, purchase,
    -- search, filter_applied, wishlist_add, share, login, signup

    -- Datos del evento
    properties          JSONB,
    -- Ejemplo: {product_id, product_name, price, quantity, category, etc}

    -- Página
    page_url            TEXT,
    page_path           VARCHAR(500),
    page_title          VARCHAR(255),
    referrer            TEXT,

    -- Dispositivo
    device_type         VARCHAR(20),                     -- 'desktop', 'mobile', 'tablet'
    browser             VARCHAR(50),
    browser_version     VARCHAR(20),
    os                  VARCHAR(50),
    os_version          VARCHAR(20),
    screen_resolution   VARCHAR(20),

    -- Ubicación
    ip_address          INET,
    country             VARCHAR(2),
    region              VARCHAR(100),
    city                VARCHAR(100),

    -- UTM
    utm_source          VARCHAR(100),
    utm_medium          VARCHAR(100),
    utm_campaign        VARCHAR(100),
    utm_term            VARCHAR(100),
    utm_content         VARCHAR(100),

    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at);
CREATE INDEX idx_analytics_events_page ON analytics_events(page_path);
```

### page_views
Vistas de página con métricas detalladas.

```sql
CREATE TABLE page_views (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    session_id          VARCHAR(255) NOT NULL,
    user_id             UUID REFERENCES users(id),

    -- Página
    page_url            TEXT NOT NULL,
    page_path           VARCHAR(500),
    page_type           VARCHAR(50),
    -- Tipos: 'home', 'collection', 'product', 'cart', 'checkout', 'account', 'other'

    -- Referencia (para product/collection pages)
    reference_id        UUID,

    -- Engagement
    time_on_page        INTEGER,                         -- Segundos
    scroll_depth        INTEGER,                         -- Porcentaje 0-100

    -- Interacciones
    click_count         INTEGER DEFAULT 0,

    created_at          TIMESTAMPTZ DEFAULT NOW(),
    exited_at           TIMESTAMPTZ
);

CREATE INDEX idx_page_views_session ON page_views(session_id);
CREATE INDEX idx_page_views_page_type ON page_views(page_type);
CREATE INDEX idx_page_views_created ON page_views(created_at);
```

### conversion_funnel
Tracking del embudo de conversión por sesión.

```sql
CREATE TABLE conversion_funnel (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    session_id          VARCHAR(255) UNIQUE NOT NULL,
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
    home_at             TIMESTAMPTZ,
    collection_at       TIMESTAMPTZ,
    product_at          TIMESTAMPTZ,
    cart_at             TIMESTAMPTZ,
    checkout_at         TIMESTAMPTZ,
    shipping_at         TIMESTAMPTZ,
    payment_at          TIMESTAMPTZ,
    purchase_at         TIMESTAMPTZ,

    -- Abandono
    abandoned_at_step   VARCHAR(50),

    -- Resultado
    order_id            UUID REFERENCES orders(id),
    order_value         DECIMAL(12,2),

    -- Atribución
    first_utm_source    VARCHAR(100),
    first_utm_medium    VARCHAR(100),
    first_utm_campaign  VARCHAR(100),

    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversion_funnel_user ON conversion_funnel(user_id);
CREATE INDEX idx_conversion_funnel_created ON conversion_funnel(created_at);
```

---

## 14. 🔔 NOTIFICACIONES

### notifications
Notificaciones in-app para usuarios y staff.

```sql
CREATE TABLE notifications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Tipo
    type                VARCHAR(50) NOT NULL,
    -- Tipos Staff: 'new_order', 'low_stock', 'return_request', 'payment_failed'
    -- Tipos Customer: 'order_confirmed', 'order_shipped', 'order_delivered', 'back_in_stock'

    title               VARCHAR(255) NOT NULL,
    message             TEXT NOT NULL,

    -- Acción
    action_url          TEXT,
    action_text         VARCHAR(100),

    -- Estado
    read_at             TIMESTAMPTZ,

    -- Referencia
    reference_type      VARCHAR(50),
    reference_id        UUID,

    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read_at) WHERE read_at IS NULL;
```

### email_logs
Historial de emails enviados.

```sql
CREATE TABLE email_logs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id             UUID REFERENCES users(id),
    email               VARCHAR(255) NOT NULL,

    -- Tipo
    type                VARCHAR(50) NOT NULL,
    -- Tipos: 'order_confirmation', 'order_shipped', 'order_delivered',
    -- 'abandoned_cart', 'password_reset', 'welcome', 'back_in_stock', 'newsletter'

    subject             VARCHAR(255) NOT NULL,

    -- Template
    template_id         VARCHAR(100),
    template_data       JSONB,

    -- Estado
    status              VARCHAR(20) DEFAULT 'sent',
    -- Estados: 'queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'

    -- Tracking
    opened_at           TIMESTAMPTZ,
    clicked_at          TIMESTAMPTZ,

    -- Proveedor
    provider            VARCHAR(50),                     -- 'resend', 'sendgrid'
    provider_message_id VARCHAR(255),

    -- Referencia
    reference_type      VARCHAR(50),
    reference_id        UUID,

    -- Error
    error_message       TEXT,

    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_logs_user ON email_logs(user_id);
CREATE INDEX idx_email_logs_type ON email_logs(type);
CREATE INDEX idx_email_logs_status ON email_logs(status);
```

---

## 15. ⚙️ CONFIGURACIÓN

### store_settings
Configuración general de la tienda.

```sql
CREATE TABLE store_settings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    key                 VARCHAR(100) UNIQUE NOT NULL,
    value               JSONB NOT NULL,
    description         TEXT,

    -- Categoría
    category            VARCHAR(50),
    -- Categorías: 'general', 'checkout', 'shipping', 'payments', 'emails', 'notifications'

    updated_by          UUID REFERENCES users(id),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Settings predefinidos:
-- general: store_name, store_email, store_phone, store_address, logo_url, favicon_url
-- checkout: guest_checkout_enabled, terms_url, privacy_url
-- shipping: free_shipping_threshold, default_shipping_method
-- payments: stripe_enabled, conekta_enabled, paypal_enabled
-- emails: from_email, from_name, email_templates
-- notifications: low_stock_threshold, new_order_notify_emails
```

### activity_logs
Auditoría de acciones en el sistema.

```sql
CREATE TABLE activity_logs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id             UUID REFERENCES users(id),

    -- Acción
    action              VARCHAR(100) NOT NULL,
    -- Formato: 'entity.action' (order.created, product.updated, user.login)

    -- Entidad afectada
    entity_type         VARCHAR(50),
    entity_id           UUID,

    -- Cambios
    old_values          JSONB,
    new_values          JSONB,

    -- Descripción legible
    description         TEXT,

    -- Contexto
    ip_address          INET,
    user_agent          TEXT,

    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);
```

---

## 📊 RESUMEN DE TABLAS

| Módulo | Cantidad | Tablas |
|--------|:--------:|--------|
| Usuarios & Auth | 3 | users, user_sessions, password_resets |
| Roles & Permisos | 3 | permissions, role_permissions, employee_details |
| Productos | 4 | products, product_images, product_variants, variant_options |
| Categorías & Collections | 3 | categories, collections, collection_products |
| Inventario | 2 | inventory_movements, inventory_reservations |
| Clientes | 3 | customer_profiles, addresses, product_waitlist |
| Carrito & Wishlist | 3 | carts, cart_items, wishlists |
| Pedidos | 3 | orders, order_items, order_status_history |
| Pagos | 4 | payments, refunds, webhook_events, idempotency_keys |
| Envíos | 2 | shipments, shipment_items |
| Devoluciones | 2 | returns, return_items |
| Descuentos | 2 | discounts, discount_usage |
| Analytics | 3 | analytics_events, page_views, conversion_funnel |
| Notificaciones | 2 | notifications, email_logs |
| Configuración | 2 | store_settings, activity_logs |
| **TOTAL** | **37** | |

---

## 🔄 FLUJO COMPLETO DE UN PEDIDO

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              FLUJO DE PEDIDO                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  1. NAVEGACIÓN                                                                   │
│     └── analytics_events (page_view, product_view)                              │
│     └── conversion_funnel (visited_home, viewed_product)                        │
│                                                                                  │
│  2. ADD TO CART                                                                  │
│     └── cart_items (crear/actualizar)                                           │
│     └── inventory_reservations (crear, status='active', expires=15min)          │
│     └── analytics_events (add_to_cart)                                          │
│     └── conversion_funnel (added_to_cart)                                       │
│                                                                                  │
│  3. CHECKOUT INICIADO                                                            │
│     └── inventory_reservations (renovar expires=30min)                          │
│     └── analytics_events (begin_checkout)                                       │
│     └── conversion_funnel (began_checkout)                                      │
│                                                                                  │
│  4. SHIPPING INFO                                                                │
│     └── addresses (crear si es nueva)                                           │
│     └── analytics_events (add_shipping_info)                                    │
│     └── conversion_funnel (added_shipping)                                      │
│                                                                                  │
│  5. PAGO                                                                         │
│     └── idempotency_keys (crear)                                                │
│     └── payments (crear, status='pending')                                      │
│     └── analytics_events (add_payment_info)                                     │
│     └── conversion_funnel (added_payment)                                       │
│                                                                                  │
│  6. WEBHOOK: PAGO EXITOSO                                                        │
│     └── webhook_events (guardar, verificar idempotencia)                        │
│     └── payments (status='completed')                                           │
│     └── orders (crear, status='confirmed')                                      │
│     └── order_items (crear)                                                     │
│     └── inventory_reservations (status='converted')                             │
│     └── inventory_movements (type='sale', quantity negativo)                    │
│     └── product_variants (actualizar stock_quantity)                            │
│     └── carts (status='converted')                                              │
│     └── customer_profiles (actualizar total_spent, order_count)                 │
│     └── analytics_events (purchase)                                             │
│     └── conversion_funnel (completed_purchase, order_id, order_value)           │
│     └── email_logs (order_confirmation)                                         │
│     └── notifications (new_order para staff)                                    │
│                                                                                  │
│  7. FULFILLMENT                                                                  │
│     └── orders (status='processing')                                            │
│     └── order_status_history (registrar cambio)                                 │
│     └── shipments (crear, generar label)                                        │
│     └── shipment_items (crear)                                                  │
│     └── order_items (actualizar quantity_fulfilled)                             │
│                                                                                  │
│  8. ENVÍO                                                                        │
│     └── shipments (status='shipped', tracking_number)                           │
│     └── orders (status='shipped', shipped_at)                                   │
│     └── email_logs (order_shipped)                                              │
│     └── notifications (order_shipped para customer)                             │
│                                                                                  │
│  9. ENTREGA                                                                      │
│     └── shipments (status='delivered', delivered_at)                            │
│     └── orders (status='delivered', delivered_at)                               │
│     └── email_logs (order_delivered)                                            │
│                                                                                  │
│  10. DEVOLUCIÓN (si aplica)                                                      │
│      └── returns (crear, status='requested')                                    │
│      └── return_items (crear)                                                   │
│      └── (si aprobada) refunds (crear)                                          │
│      └── (si devuelto) inventory_movements (type='return', quantity positivo)   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📱 PANEL ADMINISTRATIVO - ESTRUCTURA

```
ADMIN PANEL (Web3 Dark Mode)
│
├── 📊 DASHBOARD
│   ├── Revenue (hoy/semana/mes/año)
│   ├── Orders (pending, processing, shipped)
│   ├── Top Products
│   ├── Low Stock Alerts
│   ├── Conversion Rate
│   └── Real-time Activity Feed
│
├── 🛒 ORDERS
│   ├── List (filtros por status, fecha, cliente)
│   ├── Detail View
│   │   ├── Customer Info
│   │   ├── Items
│   │   ├── Payment Status
│   │   ├── Fulfillment Actions
│   │   └── Timeline/History
│   └── Bulk Actions (fulfill, print labels)
│
├── 📦 PRODUCTS
│   ├── List (filtros, búsqueda)
│   ├── Create/Edit
│   │   ├── Basic Info
│   │   ├── Images
│   │   ├── Variants (tallas, colores)
│   │   ├── Inventory
│   │   └── SEO
│   ├── Categories
│   └── Collections/Drops
│
├── 📊 INVENTORY
│   ├── Stock Levels
│   ├── Low Stock
│   ├── Movements History
│   └── Adjustments
│
├── 👥 CUSTOMERS
│   ├── List (segmentación, búsqueda)
│   ├── Profile View
│   │   ├── Info
│   │   ├── Orders History
│   │   ├── Addresses
│   │   └── Notes/Tags
│   └── Segments (VIP, new, at-risk)
│
├── 📈 ANALYTICS
│   ├── Overview Dashboard
│   ├── Sales Reports
│   ├── Conversion Funnel
│   ├── Product Performance
│   ├── Customer Behavior
│   ├── Traffic Sources
│   └── Export Data
│
├── 💰 FINANCES
│   ├── Revenue
│   ├── Payments
│   ├── Refunds
│   └── Reports
│
├── 🏷️ MARKETING
│   ├── Discount Codes
│   ├── Abandoned Carts
│   └── Waitlists
│
├── 🔄 RETURNS
│   ├── Return Requests
│   ├── Process Return
│   └── History
│
├── 👤 TEAM
│   ├── Employees List
│   ├── Invite/Create
│   ├── Permissions
│   └── Activity Log
│
└── ⚙️ SETTINGS
    ├── Store Info
    ├── Checkout
    ├── Payments
    ├── Shipping
    ├── Emails
    ├── Notifications
    └── Integrations
```

---

## 🛠️ TECNOLOGÍAS

| Componente | Tecnología | Uso |
|------------|------------|-----|
| **Database** | Neon (Postgres) | Base de datos principal |
| **ORM** | Prisma | Type-safe queries, migraciones |
| **Auth** | NextAuth.js | OAuth (Google) + Credentials |
| **Pagos** | Stripe + Conekta | Internacional + México |
| **Email** | Resend | Transaccionales |
| **Storage** | Cloudinary | Imágenes de productos |
| **Analytics** | Custom + GA4 | Tracking completo |
| **Hosting** | Vercel | Frontend |
| **Background Jobs** | Vercel Cron / Inngest | Reservas expiradas, emails |

---

## 🚀 ORDEN DE IMPLEMENTACIÓN

### Fase 1: Fundamentos
- [ ] Setup Neon + Prisma Schema
- [ ] Auth (NextAuth + Google)
- [ ] Users + Roles básicos
- [ ] CRUD Productos

### Fase 2: E-commerce Core
- [ ] Carrito + Reservas
- [ ] Checkout
- [ ] Pagos (Stripe)
- [ ] Orders

### Fase 3: Operations
- [ ] Inventario
- [ ] Envíos
- [ ] Emails transaccionales

### Fase 4: Admin Panel
- [ ] Dashboard
- [ ] Gestión de pedidos
- [ ] Gestión de productos
- [ ] Gestión de clientes

### Fase 5: Analytics
- [ ] Event tracking
- [ ] Conversion funnel
- [ ] Reports

### Fase 6: Advanced
- [ ] Collections/Drops
- [ ] Devoluciones
- [ ] Descuentos avanzados
- [ ] Abandoned cart recovery

---

---

## 16. 🛡️ ADVANCED FEATURES (Polish)

### CHECK CONSTRAINTS (Integridad de datos)
Previenen estados inválidos en la base de datos.

```sql
-- Orders
ALTER TABLE orders
ADD CONSTRAINT orders_status_check
CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded'));

ALTER TABLE orders
ADD CONSTRAINT orders_payment_status_check
CHECK (payment_status IN ('pending','paid','partially_refunded','refunded','failed'));

ALTER TABLE orders
ADD CONSTRAINT orders_fulfillment_status_check
CHECK (fulfillment_status IN ('unfulfilled','partial','fulfilled'));

-- Payments
ALTER TABLE payments
ADD CONSTRAINT payments_status_check
CHECK (status IN ('pending','processing','completed','failed','cancelled','refunded'));

-- Shipments
ALTER TABLE shipments
ADD CONSTRAINT shipments_status_check
CHECK (status IN ('pending','processing','shipped','in_transit','delivered','returned','failed'));

-- Returns
ALTER TABLE returns
ADD CONSTRAINT returns_status_check
CHECK (status IN ('requested','approved','rejected','shipped','received','inspected','refunded','completed'));

-- Inventory Reservations
ALTER TABLE inventory_reservations
ADD CONSTRAINT inventory_reservations_status_check
CHECK (status IN ('active','released','converted'));
```

---

### Soft Deletes (Auditoría y recuperación)
Para entidades sensibles que no deben eliminarse permanentemente.

```sql
-- Agregar deleted_at a tablas críticas
ALTER TABLE products ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE discounts ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE collections ADD COLUMN deleted_at TIMESTAMPTZ;

-- Índices para queries eficientes
CREATE INDEX idx_products_deleted ON products(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_deleted ON users(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_discounts_deleted ON discounts(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_collections_deleted ON collections(deleted_at) WHERE deleted_at IS NULL;
```

**Regla:** Registros con `deleted_at IS NOT NULL` no se muestran en queries normales, pero siguen auditables.

---

### GIN Indexes para Arrays (Performance)
Optimiza filtros por tags y segmentación.

```sql
CREATE INDEX idx_products_tags_gin ON products USING GIN(tags);
CREATE INDEX idx_customer_profiles_tags_gin ON customer_profiles USING GIN(tags);
CREATE INDEX idx_discounts_product_ids_gin ON discounts USING GIN(product_ids);
CREATE INDEX idx_discounts_category_ids_gin ON discounts USING GIN(category_ids);
CREATE INDEX idx_discounts_customer_groups_gin ON discounts USING GIN(customer_groups);
```

---

### background_jobs
Trazabilidad de procesos automáticos (cron, queues).

```sql
CREATE TABLE background_jobs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    job_type            VARCHAR(50) NOT NULL,
    -- Tipos: 'expire_reservations', 'send_email', 'abandoned_cart',
    -- 'back_in_stock', 'sync_inventory', 'generate_report'

    -- Referencia
    reference_type      VARCHAR(50),
    reference_id        UUID,

    -- Estado
    status              VARCHAR(30) DEFAULT 'pending',
    -- Estados: 'pending', 'processing', 'completed', 'failed', 'cancelled'

    -- Ejecución
    attempts            INTEGER DEFAULT 0,
    max_attempts        INTEGER DEFAULT 3,
    last_error          TEXT,

    -- Payload
    payload             JSONB,
    result              JSONB,

    -- Timestamps
    scheduled_at        TIMESTAMPTZ,
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_background_jobs_status ON background_jobs(status);
CREATE INDEX idx_background_jobs_type ON background_jobs(job_type);
CREATE INDEX idx_background_jobs_scheduled ON background_jobs(scheduled_at) WHERE status = 'pending';
```

**Uso típico:**
- Expirar `inventory_reservations` cada minuto
- Enviar emails de carrito abandonado (1h, 24h, 3d)
- Notificaciones de back-in-stock
- Generar reportes diarios

---

### feature_flags
Control de features y experimentos.

```sql
CREATE TABLE feature_flags (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    key                 VARCHAR(100) UNIQUE NOT NULL,
    name                VARCHAR(255),
    description         TEXT,

    -- Estado
    is_enabled          BOOLEAN DEFAULT FALSE,

    -- Targeting rules
    rules               JSONB,
    -- Ejemplo: {
    --   "percentage": 50,
    --   "roles": ["vip", "admin"],
    --   "user_ids": ["uuid1", "uuid2"]
    -- }

    -- Metadata
    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feature_flags_key ON feature_flags(key);
CREATE INDEX idx_feature_flags_enabled ON feature_flags(is_enabled);
```

**Ejemplos de flags:**
- `enable_drop_checkout` - Activar checkout durante drops
- `vip_early_access` - Acceso anticipado para VIPs
- `new_checkout_ui` - A/B testing de nuevo checkout
- `enable_apple_pay` - Habilitar Apple Pay

---

### store_credits
Crédito de tienda para devoluciones y promociones.

```sql
CREATE TABLE store_credits (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Montos
    original_amount     DECIMAL(12,2) NOT NULL,
    balance             DECIMAL(12,2) NOT NULL,
    currency            VARCHAR(3) DEFAULT 'MXN',

    -- Origen
    source              VARCHAR(50) NOT NULL,
    -- Fuentes: 'return', 'promo', 'compensation', 'manual', 'referral'
    source_reference_id UUID,                            -- return_id, etc.

    -- Validez
    expires_at          TIMESTAMPTZ,

    -- Estado
    is_active           BOOLEAN DEFAULT TRUE,

    -- Metadata
    notes               TEXT,
    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_store_credits_user ON store_credits(user_id);
CREATE INDEX idx_store_credits_active ON store_credits(user_id, is_active) WHERE is_active = TRUE;
```

### store_credit_transactions
Historial de uso de créditos.

```sql
CREATE TABLE store_credit_transactions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_credit_id     UUID NOT NULL REFERENCES store_credits(id) ON DELETE CASCADE,

    -- Transacción
    type                VARCHAR(20) NOT NULL,
    -- Tipos: 'credit' (entrada), 'debit' (uso), 'expire', 'refund'

    amount              DECIMAL(12,2) NOT NULL,
    balance_after       DECIMAL(12,2) NOT NULL,

    -- Referencia
    order_id            UUID REFERENCES orders(id),
    notes               TEXT,

    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_store_credit_transactions_credit ON store_credit_transactions(store_credit_id);
```

---

### security_events
Registro de eventos de seguridad.

```sql
CREATE TABLE security_events (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Usuario (si aplica)
    user_id             UUID REFERENCES users(id),
    email               VARCHAR(255),

    -- Evento
    event_type          VARCHAR(50) NOT NULL,
    -- Tipos: 'login_failed', 'login_success', 'password_changed',
    -- 'rate_limited', 'suspicious_payment', 'account_locked',
    -- 'permission_denied', '2fa_enabled', '2fa_disabled'

    -- Contexto
    ip_address          INET,
    user_agent          TEXT,
    country             VARCHAR(2),

    -- Detalles
    metadata            JSONB,
    -- Ejemplo: {attempts: 5, blocked_until: "...", reason: "..."}

    -- Severidad
    severity            VARCHAR(20) DEFAULT 'info',
    -- Niveles: 'info', 'warning', 'critical'

    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_security_events_user ON security_events(user_id);
CREATE INDEX idx_security_events_type ON security_events(event_type);
CREATE INDEX idx_security_events_ip ON security_events(ip_address);
CREATE INDEX idx_security_events_created ON security_events(created_at);
CREATE INDEX idx_security_events_severity ON security_events(severity) WHERE severity IN ('warning', 'critical');
```

---

## 📊 RESUMEN FINAL DE TABLAS

| Módulo | Cantidad | Tablas |
|--------|:--------:|--------|
| Usuarios & Auth | 3 | users, user_sessions, password_resets |
| Roles & Permisos | 3 | permissions, role_permissions, employee_details |
| Productos | 4 | products, product_images, product_variants, variant_options |
| Categorías & Collections | 3 | categories, collections, collection_products |
| Inventario | 2 | inventory_movements, inventory_reservations |
| Clientes | 3 | customer_profiles, addresses, product_waitlist |
| Carrito & Wishlist | 3 | carts, cart_items, wishlists |
| Pedidos | 3 | orders, order_items, order_status_history |
| Pagos | 4 | payments, refunds, webhook_events, idempotency_keys |
| Envíos | 2 | shipments, shipment_items |
| Devoluciones | 2 | returns, return_items |
| Descuentos | 2 | discounts, discount_usage |
| Analytics | 3 | analytics_events, page_views, conversion_funnel |
| Notificaciones | 2 | notifications, email_logs |
| Configuración | 2 | store_settings, activity_logs |
| **Advanced** | **5** | **background_jobs, feature_flags, store_credits, store_credit_transactions, security_events** |
| **TOTAL** | **42** | |

---

## 🎯 MVP vs ESCALA (Roadmap de Implementación)

### MVP (Implementar de inicio)
Funcionalidad core para lanzar la tienda.

| Módulo | Tablas | Prioridad |
|--------|--------|:---------:|
| Auth | users, user_sessions | 🔴 Crítico |
| Productos | products, product_images, product_variants | 🔴 Crítico |
| Carrito | carts, cart_items, inventory_reservations | 🔴 Crítico |
| Pedidos | orders, order_items, payments | 🔴 Crítico |
| Inventario | inventory_movements | 🔴 Crítico |
| Envíos | shipments (básico) | 🟡 Importante |
| Email | email_logs | 🟡 Importante |
| Clientes | customer_profiles, addresses | 🟡 Importante |

### Fase 2 (Con primeras ventas)
Operación más robusta.

| Módulo | Tablas | Prioridad |
|--------|--------|:---------:|
| Devoluciones | returns, return_items, refunds | 🟡 Importante |
| Descuentos | discounts, discount_usage | 🟡 Importante |
| Roles | permissions, role_permissions | 🟡 Importante |
| Webhooks | webhook_events, idempotency_keys | 🟡 Importante |

### Fase 3 (Con tracción)
Escalar y optimizar.

| Módulo | Tablas | Prioridad |
|--------|--------|:---------:|
| Analytics | analytics_events, conversion_funnel | 🟢 Nice to have |
| Collections | collections, collection_products | 🟢 Nice to have |
| Feature Flags | feature_flags | 🟢 Nice to have |
| Background Jobs | background_jobs | 🟢 Nice to have |
| Store Credits | store_credits, store_credit_transactions | 🟢 Nice to have |
| Security | security_events | 🟢 Nice to have |

---

## 🏁 ESTADO FINAL

Con esta arquitectura:

✅ **Blindada contra edge cases** - CHECK constraints, idempotencia, soft deletes

✅ **Soporta drops de alto tráfico** - Reservaciones de inventario, feature flags

✅ **Operación real completa** - Envíos, devoluciones, reembolsos, créditos

✅ **Analytics completo** - Embudo de conversión, comportamiento de usuario

✅ **Seguridad enterprise** - Roles, permisos, eventos de seguridad

✅ **Escalable sin reescribir** - GIN indexes, background jobs, feature flags

---

> **Documento Final v2.0** — MAAL LINE E-commerce Database Architecture (Complete)
