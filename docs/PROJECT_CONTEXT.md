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
| Framer Motion | - | Animaciones |

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
│   │   │   └── login-form.tsx        # Formulario con Google OAuth
│   │   └── register/page.tsx         # Registro de clientes
│   ├── (admin-auth)/
│   │   └── admin/
│   │       └── login/
│   │           ├── page.tsx          # Login admin (aislado del layout admin)
│   │           └── admin-login-form.tsx  # Formulario admin
│   ├── admin/
│   │   ├── layout.tsx                # Layout con sidebar + header (tema claro)
│   │   ├── page.tsx                  # Dashboard principal
│   │   ├── products/
│   │   │   ├── page.tsx              # Lista de productos (tema claro)
│   │   │   ├── new/page.tsx          # Crear producto (tema claro)
│   │   │   └── [id]/edit/page.tsx    # Editar producto (tema claro)
│   │   ├── orders/page.tsx           # Gestión de órdenes (tema claro)
│   │   ├── customers/page.tsx        # Gestión de clientes (tema claro)
│   │   ├── inventory/page.tsx        # Control de inventario (tema claro)
│   │   ├── discounts/page.tsx        # Descuentos y cupones (tema claro)
│   │   ├── users/page.tsx            # Gestión de usuarios del equipo
│   │   └── settings/page.tsx         # Configuración con pestaña Equipo
│   ├── producto/[slug]/page.tsx      # Detalle de producto
│   ├── categoria/[slug]/page.tsx     # Productos por categoría
│   ├── coleccion/[slug]/page.tsx     # Productos por colección
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth API
│   │   ├── products/route.ts         # CRUD productos (GET, POST)
│   │   ├── products/[id]/route.ts    # Producto individual (GET, PUT, DELETE)
│   │   ├── users/route.ts            # Listar y crear usuarios (GET, POST)
│   │   ├── users/[id]/route.ts       # Usuario individual (GET, PUT, DELETE)
│   │   └── upload/route.ts           # Upload de imágenes (placeholder)
│   └── page.tsx                      # Landing page (tema oscuro)
├── components/
│   ├── admin/
│   │   ├── sidebar.tsx               # Sidebar con filtrado por permisos
│   │   ├── header.tsx                # Header con search, notificaciones, user menu
│   │   ├── product-form.tsx          # Formulario de producto (tema claro)
│   │   ├── variant-manager.tsx       # Gestor de variantes/tallas (tema claro)
│   │   ├── image-uploader.tsx        # Uploader de imágenes (tema claro)
│   │   ├── user-form.tsx             # Formulario crear/editar usuario
│   │   └── permission-gate.tsx       # Componente para condicionar UI por permisos
│   ├── navigation/
│   │   ├── navbar.tsx                # Navbar público
│   │   ├── promo-bar.tsx             # Barra de promociones
│   │   └── footer.tsx                # Footer
│   ├── product/
│   │   └── product-card.tsx          # Card de producto
│   └── ui/                           # Componentes UI reutilizables
├── hooks/
│   └── use-permissions.ts            # Hook para verificar permisos en cliente
├── lib/
│   ├── auth.ts                       # Configuración NextAuth completa
│   ├── auth.config.ts                # Config NextAuth para Edge (middleware) con trustHost
│   ├── auth-utils.ts                 # Utilidades de autenticación + getCurrentUserId
│   ├── db.ts                         # Cliente Prisma
│   ├── permissions.ts                # Sistema de permisos por rol
│   ├── queries/
│   │   ├── products.ts               # Queries de productos
│   │   ├── categories.ts             # Queries de categorías
│   │   ├── collections.ts            # Queries de colecciones
│   │   └── users.ts                  # Queries de usuarios del equipo
│   ├── transformers/
│   │   └── product.ts                # Transformadores Prisma → Frontend
│   ├── store/
│   │   ├── cart-store.ts             # Estado del carrito (Zustand)
│   │   └── filter-store.ts           # Estado de filtros
│   └── utils/
│       ├── cn.ts                     # Utility para clases CSS (clsx + twMerge)
│       └── formatters.ts             # Formateadores (precios, fechas)
├── scripts/
│   └── set-owner.ts                  # Script para asignar rol owner
├── prisma/
│   ├── schema.prisma                 # Schema con 42 tablas
│   └── prisma.config.ts              # Configuración Prisma
├── public/
│   └── images/                       # Imágenes estáticas
│       └── logo-maal-negro.png       # Logo para admin
└── docs/
    └── PROJECT_CONTEXT.md            # Este archivo
```

---

## Sistema de Autenticación

### Logins Separados (Route Groups)

| Ruta | Route Group | Propósito | Características |
|------|-------------|-----------|-----------------|
| `/login` | `(auth)` | Clientes | Formulario + Google OAuth colorido + Registro |
| `/admin/login` | `(admin-auth)` | Administradores | Solo formulario, sin registro, tema claro |

**Nota importante:** El login de admin usa el route group `(admin-auth)` para evitar heredar el layout del panel admin (sidebar/header). Esto permite mostrar solo el formulario de login sin navegación.

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

### Roles y Sistema de Permisos

#### Jerarquía de Roles (Mayor a Menor)

| Rol | Nivel | Descripción |
|-----|-------|-------------|
| `owner` | 5 | Dueño - Acceso total sin restricciones |
| `admin` | 4 | Administrador - Gestión completa excepto config crítica |
| `manager` | 3 | Gerente - Operaciones diarias de la tienda |
| `employee` | 2 | Empleado - Tareas operativas básicas |
| `viewer` | 1 | Visor - Solo lectura (ideal para contadores) |
| `customer` | 0 | Cliente - Solo tienda pública |

#### Permisos por Módulo

| Módulo | Owner | Admin | Manager | Employee | Viewer |
|--------|:-----:|:-----:|:-------:|:--------:|:------:|
| Dashboard | ✅ Todo | ✅ Todo | ✅ Todo | ⚡ Limitado | 👁️ Ver |
| Productos | ✅ CRUD | ✅ CRUD | ✅ CRUD | ⚡ Ver/Editar | 👁️ Ver |
| Pedidos | ✅ Todo | ✅ Todo | ✅ Todo | ⚡ Procesar | 👁️ Ver |
| Clientes | ✅ Todo | ✅ Todo | ✅ Ver/Editar | ⚡ Ver | 👁️ Ver |
| Inventario | ✅ Todo | ✅ Todo | ✅ Ajustar | ⚡ Actualizar | ❌ No |
| Descuentos | ✅ CRUD | ✅ CRUD | ⚡ Ver/Usar | ❌ No | 👁️ Ver |
| **Usuarios** | ✅ CRUD | ✅ Crear ≤admin | ❌ No | ❌ No | ❌ No |
| **Configuración** | ✅ Todo | ⚡ Parcial | ❌ No | ❌ No | ❌ No |

#### Reglas de Gestión de Usuarios

- Solo puedes crear usuarios con rol **menor** al tuyo
- `owner` puede crear: admin, manager, employee, viewer
- `admin` puede crear: manager, employee, viewer
- Puedes editar tu propio perfil (pero no tu rol)
- No puedes eliminarte a ti mismo

### Configuración NextAuth para Vercel

En `lib/auth.config.ts` se requiere `trustHost: true` para que funcione en Vercel:

```typescript
export default {
  trustHost: true,
  // ... resto de la configuración
} satisfies NextAuthConfig
```

---

## Diseño del Panel Admin (Tema Claro)

### Paleta de Colores Completa

```css
/* Fondos */
--background: #F5F5F7        /* Fondo general del layout */
--surface: #FFFFFF           /* Cards, tablas, formularios */
--surface-hover: #F9FAFB     /* Hover en filas de tabla */
--surface-secondary: #F3F4F6 /* Inputs deshabilitados, badges neutros */

/* Bordes */
--border: #E5E7EB            /* Bordes de cards, inputs, tablas */
--border-light: #D1D5DB      /* Bordes más sutiles */

/* Texto */
--text-primary: #111827      /* Títulos, texto principal */
--text-secondary: #374151    /* Labels, texto secundario */
--text-muted: #6B7280        /* Texto terciario, hints */
--text-placeholder: #9CA3AF  /* Placeholders */

/* Botones Principales */
--button-primary: #111827    /* Botones de acción principal */
--button-primary-hover: #1F2937

/* Estados */
--success: #10B981           /* Verde - Activo, completado */
--success-bg: #ECFDF5
--warning: #F59E0B           /* Amarillo - Pendiente, stock bajo */
--warning-bg: #FFFBEB
--error: #EF4444             /* Rojo - Error, sin stock */
--error-bg: #FEF2F2
--info: #3B82F6              /* Azul - Info, procesando */
--info-bg: #EFF6FF

/* Acentos Especiales */
--purple: #8B5CF6            /* VIP, premium */
--purple-bg: #F5F3FF
```

### Componentes del Panel Admin

#### 1. Sidebar (`components/admin/sidebar.tsx`)
- Fondo blanco `#FFFFFF` con borde derecho `#E5E7EB`
- Logo MAAL LINE en negro
- Iconos Lucide minimalistas en gris `#6B7280`
- Item activo: fondo `#111827`, texto blanco
- Item hover: fondo `#F9FAFB`
- Colapsable en desktop con botón toggle
- Drawer con overlay en mobile
- Botón de logout en la parte inferior

#### 2. Header (`components/admin/header.tsx`)
- Fondo blanco `#FFFFFF` con borde inferior
- Barra de búsqueda con icono
- Botón de notificaciones con badge rojo
- Avatar de usuario con dropdown menu
- Sticky al top del viewport

#### 3. Dashboard (`app/admin/page.tsx`)
- Grid de 4 cards de estadísticas con iconos coloridos
- Gráfico de ventas (Recharts AreaChart)
- Gráfico de categorías (Recharts PieChart donut)
- Tabla de órdenes recientes con badges de estado
- Quick actions grid

#### 4. Páginas de Listado (products, orders, customers, inventory)
- Header con título y botón de acción principal
- Cards de estadísticas relevantes
- Barra de filtros (búsqueda, dropdowns, botones)
- Tabla con:
  - Header en `#F9FAFB`
  - Filas con hover en `#F9FAFB`
  - Bordes `#E5E7EB`
  - Acciones en dropdown
- Paginación en footer de tabla

#### 5. Formularios (product-form, settings)
- Cards blancas con sombra sutil
- Labels en `#374151`
- Inputs con borde `#E5E7EB`
- Focus: ring `#111827`
- Botones de acción en `#111827`

#### 6. Badges de Estado

```tsx
// Activo/Completado
<span className="bg-green-50 text-green-700">
  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
  Activo
</span>

// Pendiente/Warning
<span className="bg-amber-50 text-amber-700">
  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
  Pendiente
</span>

// Error/Cancelado
<span className="bg-red-50 text-red-700">
  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
  Sin stock
</span>

// Info/Procesando
<span className="bg-blue-50 text-blue-700">
  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
  Procesando
</span>

// VIP/Premium
<span className="bg-purple-50 text-purple-700">
  <Crown className="w-3 h-3" />
  VIP
</span>
```

---

## Diseño del Login Público (Tema Oscuro)

### Paleta de Colores

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

- Botón de Google con logo colorido oficial
- Formulario con iconos (Mail, Lock)
- Toggle de visibilidad de contraseña (Eye/EyeOff)
- Link a registro
- Términos y privacidad
- Checkbox "Recordar sesión"

---

## Diseño del Login Admin (Tema Claro)

### Características

- Layout split: formulario a la izquierda, decorativo a la derecha
- Logo MAAL LINE en negro
- Formulario minimalista con iconos
- Panel decorativo con stats (24/7, SSL, 2FA)
- Sin opción de registro (solo admins existentes)
- Sin Google OAuth (solo credenciales)

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
  customer   // Cliente regular (sin acceso admin)
  viewer     // Visor (solo lectura)
  employee   // Empleado (acceso admin limitado)
  manager    // Gerente (más permisos)
  admin      // Administrador
  owner      // Dueño (todos los permisos)
}
```

---

## Sistema de Gestión de Usuarios

### Acceso

| Ruta | Descripción |
|------|-------------|
| `/admin/users` | Página completa de gestión de usuarios |
| `/admin/settings` → Equipo | Acceso rápido + info de roles |

### Funcionalidades

```
✓ Ver lista de usuarios del equipo (no clientes)
✓ Crear nuevos usuarios con rol ≤ tu rol
✓ Editar información, rol y estado de usuarios
✓ Cambiar contraseñas
✓ Desactivar/eliminar usuarios (soft delete)
✓ Filtrar por rol y buscar por nombre/email
✓ Editar tu propio perfil (sin cambiar rol)
```

### Hook usePermissions

```tsx
import { usePermissions } from '@/hooks/use-permissions'

function MyComponent() {
  const {
    can,              // (permission) => boolean
    canCreateProducts,
    canEditProducts,
    canDeleteProducts,
    canViewUsers,
    canCreateUsers,
    userRole,
    isLoading
  } = usePermissions()

  if (can('products:create')) {
    // mostrar botón crear
  }
}
```

### PermissionGate Component

```tsx
import { PermissionGate } from '@/components/admin/permission-gate'

<PermissionGate permission="products:delete">
  <button>Eliminar</button>
</PermissionGate>

// Con múltiples permisos
<PermissionGate permission={['products:edit', 'products:create']} requireAll={false}>
  <button>Editar o Crear</button>
</PermissionGate>
```

### Cambiar Usuario a Owner

Si necesitas cambiar tu cuenta a owner, ejecuta en la consola SQL de Neon:

```sql
UPDATE users SET role = 'owner' WHERE email = 'tu@email.com';
```

O usa el script:

```bash
npx tsx scripts/set-owner.ts
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
- [x] Diseño de landing con productos (tema oscuro)
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
- [x] Login separado para admin (`/admin/login`) con route group `(admin-auth)`
- [x] Login público mejorado con Google colorido
- [x] Rediseño completo del panel admin (tema claro moderno)
- [x] Nuevo header con búsqueda, notificaciones y user menu
- [x] Nuevo sidebar minimalista colapsable
- [x] Dashboard moderno con gráficos (Recharts) y tabla de órdenes
- [x] Middleware actualizado para manejar ambos logins

### Fase 7: Actualización Completa del Panel Admin (Tema Claro)
- [x] `/admin/products` - Lista de productos con tabla clara, filtros, paginación
- [x] `/admin/orders` - Pedidos con stats, badges de estado, modal de detalle
- [x] `/admin/customers` - Clientes con grupos VIP, métricas
- [x] `/admin/inventory` - Inventario con indicadores de stock (OK/bajo/sin stock)
- [x] `/admin/discounts` - Descuentos en grid de cards con progress bars
- [x] `/admin/settings` - Configuración con tabs (General, Pagos, Envíos, Notificaciones, Seguridad)
- [x] `/admin/products/new` - Formulario crear producto (tema claro)
- [x] `/admin/products/[id]/edit` - Formulario editar producto (tema claro)
- [x] `components/admin/product-form.tsx` - Formulario completo con tema claro
- [x] `components/admin/image-uploader.tsx` - Uploader con drag & drop
- [x] `components/admin/variant-manager.tsx` - Gestor de tallas con quick-add

### Fase 8: Sistema de Gestión de Usuarios y Permisos
- [x] `lib/permissions.ts` - Sistema completo de permisos por rol
- [x] `lib/queries/users.ts` - CRUD de usuarios del equipo
- [x] `lib/auth-utils.ts` - Funciones `getCurrentUserId`, `requirePermission`
- [x] `hooks/use-permissions.ts` - Hook para verificar permisos en cliente
- [x] `app/api/users/route.ts` - API GET (listar) y POST (crear) usuarios
- [x] `app/api/users/[id]/route.ts` - API GET, PUT, DELETE usuario individual
- [x] `app/admin/users/page.tsx` - Página de gestión de usuarios con:
  - Lista de usuarios con avatar, rol, estado
  - Filtros por rol y búsqueda
  - Modal para crear/editar usuarios
  - Confirmación para eliminar
- [x] `components/admin/user-form.tsx` - Formulario de usuario con:
  - Campos: nombre, email, teléfono, contraseña
  - Selector de rol con descripción de permisos
  - Campos opcionales: departamento, puesto
- [x] `components/admin/permission-gate.tsx` - Componente para condicionar UI
- [x] `components/admin/sidebar.tsx` - Filtrado de menú por permisos del rol
- [x] `app/admin/products/page.tsx` - Botones condicionales (crear/editar/eliminar)
- [x] `app/admin/settings/page.tsx` - Nueva pestaña "Equipo" con:
  - Acceso directo a gestión de usuarios
  - Explicación de roles y permisos
- [x] Rol `viewer` agregado al schema Prisma
- [x] Usuarios pueden editar su propio perfil
- [x] Protección: no puedes cambiar tu propio rol ni eliminarte

### Fase 9: Mejoras al Image Uploader
- [x] `components/admin/image-uploader.tsx` - Reescrito completamente con:
  - Zona de arrastrar y soltar (drag & drop) para archivos
  - Click para abrir selector de archivos
  - Conversión de imágenes a Base64 (funciona sin servidor de archivos)
  - Validación de tipo (JPG, PNG, WebP, GIF) y tamaño (máx 5MB)
  - Indicador visual de carga con spinner
  - Badge "LOCAL" para imágenes en Base64
  - Mantiene funcionalidad de agregar por URL
  - Reordenamiento de imágenes con drag & drop
  - Badge "PRINCIPAL" en la primera imagen

### Fase 10: Diseño Responsivo del Panel Admin
- [x] **Layout General:**
  - Header con padding izquierdo para botón menú hamburguesa
  - Búsqueda oculta en móvil
  - Sidebar con logo "M" cuando está colapsado

- [x] **Dashboard (Overview):**
  - Header con botones que se ajustan al ancho en móvil
  - Botón "Add Product" → "Nuevo" en móvil
  - Tabla Recent Orders: columnas Customer, Product, Actions ocultas en móvil
  - Gráficos con altura reducida (200px vs 280px)
  - Quick actions grid 2x2

- [x] **Tablas responsivas** (columnas ocultas según breakpoint):
  - Productos: checkbox (sm), estado (sm), inventario (md), categoría (lg)
  - Órdenes: cliente (sm), fecha (md), pago (lg)
  - Clientes: grupo (sm), pedidos (md), fecha registro (lg)
  - Inventario: SKU (md), variante (sm), reservado/disponible (lg), en camino (xl)
  - Usuarios: estado (sm), teléfono (md), puesto (sm)

- [x] **Modales:**
  - Modal de órdenes: full-screen en móvil (inset-4)
  - Modal de usuarios: full-screen en móvil (h-full)
  - Padding reducido en headers y contenido

- [x] **Settings (Configuración):**
  - Tabs con solo iconos en móvil (texto oculto)
  - Scroll horizontal en tabs (-mx-4 px-4)
  - Cards de roles más compactas (p-3 vs p-4)
  - Toggle switches más pequeños (w-10 h-5)
  - Botones "Guardar" full-width en móvil
  - Todas las secciones optimizadas (General, Equipo, Pagos, Envíos, Notificaciones, Seguridad)

- [x] **Otras mejoras:**
  - Botones de acción siempre visibles en móvil (no solo hover)
  - Información secundaria inline en celdas compactas
  - Badges con solo dot de color en pantallas pequeñas
  - Textos truncados con `truncate` y `line-clamp`

---

## Commits Recientes

```
d18c01e fix: Allow users to edit their own profile
e2eb54d feat: Add user management system with role-based permissions
30d0d6c docs: Update PROJECT_CONTEXT.md with complete implementation details
4406cc7 feat: Update admin panel to light theme
520cd13 fix: Separate admin login from admin layout
8414894 feat: Separate logins and redesign admin panel
63d25be Add trustHost for Vercel NextAuth deployment
```

---

## Próximos Pasos (Pendientes)

### Corto Plazo
- [ ] Integrar Cloudinary/Vercel Blob para imágenes reales
- [ ] Implementar checkout con Stripe
- [ ] Dashboard con métricas reales de la DB
- [ ] Funcionalidad real en páginas de órdenes, clientes, inventario

### Mediano Plazo
- [ ] Sistema de notificaciones real (push/email)
- [ ] Sistema de envíos (integración con carriers)
- [ ] Emails transaccionales (confirmación, envío, etc.)
- [ ] Panel de analytics
- [ ] Invitación de usuarios por email con link temporal

### Largo Plazo
- [ ] App móvil (React Native)
- [ ] Sistema de puntos/rewards
- [ ] Integración con marketplaces (MercadoLibre, Amazon)
- [ ] Multi-idioma (i18n)
- [ ] Auditoría de acciones (activity log por usuario)

---

## Patrones de Código

### Clases CSS Consistentes (Tailwind)

```tsx
// Input estándar
"w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"

// Botón primario
"px-4 py-2.5 bg-[#111827] text-white text-sm font-semibold rounded-xl hover:bg-[#1F2937] transition-colors"

// Botón secundario
"px-4 py-2.5 bg-white border border-[#E5E7EB] text-[#374151] text-sm rounded-xl hover:bg-[#F9FAFB] transition-colors"

// Card
"bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm"

// Tabla header
"border-b border-[#E5E7EB] bg-[#F9FAFB]"

// Tabla row
"hover:bg-[#F9FAFB] transition-colors"
```

### Animaciones con Framer Motion

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}
```

---

## Contacto y Soporte

- **Repositorio:** https://github.com/AlexisIRGgit/MAAL-LINE
- **Vercel Dashboard:** https://vercel.com/dashboard
