# MAAL LINE - Contexto del Proyecto

**Última actualización:** 2026-02-10

## Descripción General

MAAL LINE es una plataforma e-commerce de streetwear construida con Next.js 14 (App Router), diseñada con un estilo futurista y limpio tipo Web3. El proyecto incluye:

- **Landing page pública** - Catálogo de productos, categorías, colecciones (tema oscuro)
- **Panel de administración** - Gestión de productos, inventario, órdenes, clientes (tema claro moderno)
- **Sistema de autenticación** - NextAuth v5 con credenciales y Google OAuth
- **Logins separados** - `/login` para clientes, `/admin/login` para administradores

---

## Stack Tecnológico

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Next.js | 14.2.0 | Framework principal (App Router) |
| React | 18.x | UI Library |
| TypeScript | 5.x | Tipado estático |
| Tailwind CSS | 3.4.x | Estilos |
| Prisma | 7.3.0 | ORM para PostgreSQL |
| Neon PostgreSQL | - | Base de datos en la nube |
| NextAuth.js | 5.x (Beta) | Autenticación |
| Zustand | 4.x | Estado global (carrito, filtros) |
| Recharts | 2.x | Gráficos en admin |
| Lucide React | - | Iconos |

---

## Variables de Entorno

### Archivo `.env` (Local)

```env
# Database - Neon PostgreSQL
DATABASE_URL="postgresql://neondb_owner:npg_6JozimPaYg4T@ep-solitary-block-ajxblod9-pooler.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Direct connection for migrations (without pooler)
DIRECT_URL="postgresql://neondb_owner:npg_6JozimPaYg4T@ep-solitary-block-ajxblod9.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Auth - NextAuth v5
AUTH_SECRET="maal-line-secret-key-change-in-production-2024"
AUTH_URL="http://localhost:3000"

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### Variables en Vercel (Producción)

| Variable | Descripción | Requerido |
|----------|-------------|-----------|
| `DATABASE_URL` | URL de conexión a Neon PostgreSQL (con pooler) | Sí |
| `AUTH_SECRET` | Secret para NextAuth (min 32 chars). Generar con: `openssl rand -base64 32` | Sí |
| `GOOGLE_CLIENT_ID` | Client ID de Google OAuth | No |
| `GOOGLE_CLIENT_SECRET` | Client Secret de Google OAuth | No |

---

## Estructura del Proyecto

```
MAAL-LINE/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   ├── page.tsx              # Login público (clientes)
│   │   │   └── login-form.tsx        # Formulario con Google
│   │   └── register/page.tsx         # Registro de clientes
│   ├── admin/
│   │   ├── login/
│   │   │   ├── layout.tsx            # Layout sin sidebar
│   │   │   ├── page.tsx              # Login admin (sin registro)
│   │   │   └── admin-login-form.tsx  # Formulario admin
│   │   ├── layout.tsx                # Layout con sidebar + header
│   │   ├── page.tsx                  # Dashboard principal
│   │   ├── products/
│   │   │   ├── page.tsx              # Lista de productos
│   │   │   ├── new/page.tsx          # Crear producto
│   │   │   └── [id]/edit/page.tsx    # Editar producto
│   │   ├── orders/page.tsx           # Gestión de órdenes
│   │   ├── customers/page.tsx        # Gestión de clientes
│   │   ├── inventory/page.tsx        # Control de inventario
│   │   ├── discounts/page.tsx        # Descuentos y cupones
│   │   └── settings/page.tsx         # Configuración
│   ├── producto/[slug]/page.tsx      # Detalle de producto
│   ├── categoria/[slug]/page.tsx     # Productos por categoría
│   ├── coleccion/[slug]/page.tsx     # Productos por colección
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth API
│   │   ├── products/route.ts         # CRUD productos (GET, POST)
│   │   ├── products/[id]/route.ts    # Producto individual (GET, PUT, DELETE)
│   │   └── upload/route.ts           # Upload de imágenes (placeholder)
│   └── page.tsx                      # Landing page
├── components/
│   ├── admin/
│   │   ├── sidebar.tsx               # Sidebar moderno (tema claro)
│   │   ├── header.tsx                # Header con search, notificaciones, user menu
│   │   ├── product-form.tsx          # Formulario de producto
│   │   ├── variant-manager.tsx       # Gestor de variantes/tallas
│   │   └── image-uploader.tsx        # Uploader de imágenes (URLs)
│   ├── navigation/
│   │   ├── navbar.tsx                # Navbar público
│   │   ├── promo-bar.tsx             # Barra de promociones
│   │   └── footer.tsx                # Footer
│   ├── product/
│   │   └── product-card.tsx          # Card de producto
│   └── ui/                           # Componentes UI reutilizables
├── lib/
│   ├── auth.ts                       # Configuración NextAuth completa
│   ├── auth.config.ts                # Config NextAuth para Edge (middleware)
│   ├── auth-utils.ts                 # Utilidades de autenticación
│   ├── db.ts                         # Cliente Prisma
│   ├── queries/
│   │   ├── products.ts               # Queries de productos
│   │   ├── categories.ts             # Queries de categorías
│   │   └── collections.ts            # Queries de colecciones
│   ├── transformers/
│   │   └── product.ts                # Transformadores Prisma → Frontend
│   ├── store/
│   │   ├── cart-store.ts             # Estado del carrito (Zustand)
│   │   └── filter-store.ts           # Estado de filtros
│   └── utils/
│       ├── cn.ts                     # Utility para clases CSS
│       └── formatters.ts             # Formateadores (precios, fechas)
├── prisma/
│   ├── schema.prisma                 # Schema con 42 tablas
│   └── prisma.config.ts              # Configuración Prisma
├── public/
│   └── images/                       # Imágenes estáticas
└── docs/
    └── PROJECT_CONTEXT.md            # Este archivo
```

---

## Sistema de Autenticación

### Logins Separados

| Ruta | Propósito | Características |
|------|-----------|-----------------|
| `/login` | Clientes | Formulario + Google OAuth + Registro |
| `/admin/login` | Administradores | Solo formulario, sin registro |

### Flujo de Redirección

```
Usuario no autenticado intenta acceder a /admin/*
  ↓
Redirige a /admin/login
  ↓
Login exitoso con rol admin (employee/manager/admin/owner)
  ↓
Redirige a /admin

Usuario autenticado (cualquier rol) intenta acceder a /login
  ↓
Si es admin → Redirige a /admin
Si es customer → Redirige a /
```

### Credenciales de Admin (Desarrollo)

```
Email: admin@maalline.com
Password: Admin123!
```

### Roles con Acceso Admin

Los siguientes roles pueden acceder a `/admin/*`:
- `employee`
- `manager`
- `admin`
- `owner`

---

## Diseño del Panel Admin

### Tema Claro Moderno

El panel de administración usa un diseño moderno y limpio inspirado en dashboards tipo Web3/SaaS:

```css
/* Paleta de Colores - Admin */
--background: #F5F5F7
--surface: #FFFFFF
--border: #E5E7EB
--text-primary: #111827
--text-secondary: #6B7280
--text-muted: #9CA3AF
--accent-success: #10B981
--accent-warning: #F59E0B
--accent-error: #EF4444
--accent-info: #3B82F6
```

### Componentes Principales

1. **Sidebar** (`components/admin/sidebar.tsx`)
   - Fondo blanco con borde sutil
   - Iconos Lucide minimalistas
   - Item activo con fondo oscuro (#111827)
   - Colapsable en desktop
   - Drawer en mobile

2. **Header** (`components/admin/header.tsx`)
   - Barra de búsqueda
   - Notificaciones con badge
   - Menú de usuario con dropdown
   - Sticky al top

3. **Dashboard** (`app/admin/page.tsx`)
   - Cards de estadísticas con indicadores
   - Gráfico de ventas (AreaChart)
   - Gráfico de categorías (PieChart donut)
   - Tabla de órdenes recientes
   - Quick actions grid

---

## Diseño del Login Público

### Tema Oscuro

```css
/* Paleta de Colores - Login Público */
--background: #0A0A0A
--surface: #111111
--border: #222222
--text-primary: #E8E4D9
--text-secondary: #888888
--accent: #C9A962
```

### Características

- Botón de Google con logo colorido
- Formulario con iconos
- Toggle de visibilidad de contraseña
- Link a registro
- Términos y privacidad

---

## Base de Datos (Prisma Schema)

### Tablas Principales (42 total)

**Usuarios y Autenticación:**
- `User` - Usuarios del sistema
- `UserSession` - Sesiones activas
- `PasswordReset` - Tokens de reseteo
- `EmployeeDetails` - Detalles de empleados
- `CustomerProfile` - Perfiles de clientes

**Productos:**
- `Product` - Productos
- `ProductImage` - Imágenes de productos
- `ProductVariant` - Variantes (tallas, colores)
- `Category` - Categorías
- `Collection` - Colecciones
- `CollectionProduct` - Relación N:M colección-producto

**Órdenes y Pagos:**
- `Order` - Órdenes
- `OrderItem` - Items de orden
- `Payment` - Pagos
- `Shipment` - Envíos
- `Return` - Devoluciones
- `Refund` - Reembolsos

**Inventario:**
- `InventoryMovement` - Movimientos de inventario
- `InventoryReservation` - Reservas de stock
- `ProductWaitlist` - Lista de espera

**Marketing:**
- `Discount` - Descuentos
- `DiscountCode` - Códigos de descuento
- `StoreCredit` - Crédito de tienda

### Roles de Usuario

```typescript
enum UserRole {
  customer   // Cliente regular
  employee   // Empleado (acceso admin limitado)
  manager    // Gerente (más permisos)
  admin      // Administrador
  owner      // Dueño (todos los permisos)
}
```

---

## Configuración de Vercel

### Build Settings

- **Framework Preset:** Next.js
- **Build Command:** `prisma generate && next build`
- **Output Directory:** `.next`

### Páginas Dinámicas

Las siguientes páginas tienen `export const dynamic = 'force-dynamic'` porque hacen queries a la DB:

- `/` (landing)
- `/producto/[slug]`
- `/categoria/[slug]`
- `/coleccion/[slug]`
- `/admin/products/new`
- `/admin/products/[id]/edit`

---

## Deployment URLs

- **Producción:** https://maal-line-liard.vercel.app
- **GitHub:** https://github.com/AlexisIRGgit/MAAL-LINE

---

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Generar Prisma Client
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Ver base de datos
npx prisma studio

# Generar AUTH_SECRET seguro
openssl rand -base64 32
```

---

## Changelog de Implementación

### Fase 1: Setup Inicial
- [x] Configuración Next.js 14 con App Router
- [x] Schema Prisma con 42 tablas
- [x] Integración con Neon PostgreSQL
- [x] NextAuth v5 con credenciales y Google

### Fase 2: Landing Page
- [x] Diseño de landing con productos
- [x] Navbar con carrito y menú
- [x] ProductCard component
- [x] Conexión con base de datos

### Fase 3: Panel Admin (v1 - Dark)
- [x] Layout con sidebar y header
- [x] Dashboard con estadísticas
- [x] Gestión de productos (CRUD)
- [x] Formulario de producto con variantes
- [x] Image uploader (URLs)

### Fase 4: Páginas Públicas
- [x] Página de producto individual
- [x] Página de categoría
- [x] Página de colección
- [x] Transformadores de datos

### Fase 5: Fixes para Vercel
- [x] `trustHost: true` para NextAuth
- [x] Páginas dinámicas (`force-dynamic`)
- [x] Remover uso de filesystem
- [x] Fix prisma.config.ts

### Fase 6: Separación de Logins y Rediseño Admin
- [x] Login separado para admin (`/admin/login`)
- [x] Login público mejorado con Google colorido
- [x] Rediseño completo del panel admin (tema claro moderno)
- [x] Nuevo header con búsqueda, notificaciones y user menu
- [x] Nuevo sidebar minimalista colapsable
- [x] Dashboard moderno con gráficos y tabla de órdenes
- [x] Middleware actualizado para manejar ambos logins

---

## Próximos Pasos (Pendientes)

### Corto Plazo
- [ ] Actualizar páginas secundarias de admin (products, orders, etc.) al nuevo tema
- [ ] Integrar Cloudinary/Vercel Blob para imágenes
- [ ] Implementar checkout con Stripe

### Mediano Plazo
- [ ] Sistema de notificaciones real
- [ ] Dashboard con métricas reales de la DB
- [ ] Sistema de envíos
- [ ] Emails transaccionales

### Largo Plazo
- [ ] App móvil (React Native)
- [ ] Sistema de puntos/rewards
- [ ] Integración con marketplaces

---

## Contacto y Soporte

- **Repositorio:** https://github.com/AlexisIRGgit/MAAL-LINE
- **Vercel Dashboard:** https://vercel.com/dashboard
