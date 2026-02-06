# MAAL LINE — Design System & Implementation Guide
## E-commerce Streetwear Oversize

**Version:** 1.0
**Fecha:** Febrero 2026
**Stack:** Next.js 14 (App Router) + Tailwind CSS + Neon (Postgres) + Railway

---

# TABLA DE CONTENIDOS

1. [Visión del Producto](#1-visión-del-producto)
2. [Sistema Visual](#2-sistema-visual)
3. [Arquitectura de Carpetas](#3-arquitectura-de-carpetas)
4. [UI Kit - Componentes Base](#4-ui-kit---componentes-base)
5. [Páginas - Especificaciones Completas](#5-páginas---especificaciones-completas)
6. [Analytics & Tracking](#6-analytics--tracking)
7. [SEO & Meta Tags](#7-seo--meta-tags)
8. [Performance & Optimización](#8-performance--optimización)
9. [Responsive Breakpoints](#9-responsive-breakpoints)
10. [Estados & Microinteracciones](#10-estados--microinteracciones)

---

# 1. VISIÓN DEL PRODUCTO

## 1.1 Posicionamiento
MAAL Line es streetwear oversize con actitud. No es minimal aburrido, es **fiero pero limpio**. La marca habla a una audiencia joven (18-30) que busca piezas statement que comuniquen identidad.

## 1.2 Referencias Clave (DNA del diseño)

| Referencia | Qué tomar |
|------------|-----------|
| **CRIMELIFE** | Grid producto directo, filtros funcionales, quick-add inmediato |
| **F4T3** | Promo bar efectivo, categorías claras, storytelling de marca |
| **Gymshark** | Arquitectura ecom sólida, UX de checkout, categorización |
| **YoungLA** | Drops/restocks como navegación, lookbook, urgencia |

## 1.3 Principios de Diseño

1. **Producto es protagonista** — Fotos grandes, fondos limpios
2. **Urgencia sin spam** — Badges estratégicos, no decorativos
3. **Mobile-first agresivo** — El 70%+ vendrá de móvil
4. **Fricción mínima** — Quick add, tallas visibles, checkout rápido
5. **Street pero pro** — Tipografía bold, pero espaciado respirado

---

# 2. SISTEMA VISUAL

## 2.1 Paletas Propuestas

### RUTA A: STREET DARK (Recomendada)
```
Background Primary:    #0A0A0A (Negro profundo)
Background Secondary:  #141414 (Negro elevado)
Background Tertiary:   #1F1F1F (Cards/surfaces)
Text Primary:          #FFFFFF
Text Secondary:        #A3A3A3
Text Muted:            #525252
Accent Primary:        #FF3D00 (Naranja fuego) — CTA principal
Accent Secondary:      #FF6B35 (Naranja claro) — Hovers
Success:               #22C55E
Warning:               #FBBF24
Error:                 #EF4444
Border:                #262626
Border Hover:          #404040
```

### RUTA B: STREET LIGHT
```
Background Primary:    #FAFAFA
Background Secondary:  #FFFFFF
Background Tertiary:   #F5F5F5
Text Primary:          #0A0A0A
Text Secondary:        #525252
Text Muted:            #A3A3A3
Accent Primary:        #0A0A0A (Negro statement)
Accent Secondary:      #262626
Highlight:             #FF3D00 (Naranja para badges/promos)
Success:               #16A34A
Warning:               #D97706
Error:                 #DC2626
Border:                #E5E5E5
Border Hover:          #D4D4D4
```

> **Decisión requerida:** Confirmar ruta visual antes de implementar.

## 2.2 Tipografía

### Font Stack
```css
/* Headings - Impacto street */
--font-display: 'Space Grotesk', 'Inter', system-ui, sans-serif;

/* Body - Legibilidad */
--font-body: 'Inter', system-ui, -apple-system, sans-serif;

/* Mono - Precios, códigos */
--font-mono: 'JetBrains Mono', 'SF Mono', monospace;
```

### Escala Tipográfica
```css
/* Mobile First */
--text-xs:    0.75rem;    /* 12px - Badges, meta */
--text-sm:    0.875rem;   /* 14px - Captions, helpers */
--text-base:  1rem;       /* 16px - Body */
--text-lg:    1.125rem;   /* 18px - Body large */
--text-xl:    1.25rem;    /* 20px - Subheadings */
--text-2xl:   1.5rem;     /* 24px - Section titles mobile */
--text-3xl:   1.875rem;   /* 30px - Page titles mobile */
--text-4xl:   2.25rem;    /* 36px - Hero mobile */
--text-5xl:   3rem;       /* 48px - Hero desktop */
--text-6xl:   3.75rem;    /* 60px - Statement desktop */
--text-7xl:   4.5rem;     /* 72px - Hero max */
```

### Pesos
```css
--font-normal:    400;
--font-medium:    500;
--font-semibold:  600;
--font-bold:      700;
--font-black:     900;  /* Solo headings statement */
```

## 2.3 Espaciado (8px base grid)

```css
--space-0:   0;
--space-1:   0.25rem;   /* 4px */
--space-2:   0.5rem;    /* 8px */
--space-3:   0.75rem;   /* 12px */
--space-4:   1rem;      /* 16px */
--space-5:   1.25rem;   /* 20px */
--space-6:   1.5rem;    /* 24px */
--space-8:   2rem;      /* 32px */
--space-10:  2.5rem;    /* 40px */
--space-12:  3rem;      /* 48px */
--space-16:  4rem;      /* 64px */
--space-20:  5rem;      /* 80px */
--space-24:  6rem;      /* 96px */
```

## 2.4 Border Radius

```css
--radius-none:  0;
--radius-sm:    0.125rem;  /* 2px - Badges tight */
--radius-base:  0.25rem;   /* 4px - Buttons, inputs */
--radius-md:    0.375rem;  /* 6px - Cards */
--radius-lg:    0.5rem;    /* 8px - Modals */
--radius-full:  9999px;    /* Pills */
```

> **Nota Street:** Mantener radios pequeños. El streetwear es angular, no burbuja.

## 2.5 Shadows (Modo Dark)

```css
--shadow-sm:    0 1px 2px rgba(0,0,0,0.5);
--shadow-base:  0 4px 6px rgba(0,0,0,0.4);
--shadow-md:    0 8px 16px rgba(0,0,0,0.4);
--shadow-lg:    0 16px 32px rgba(0,0,0,0.5);
--shadow-glow:  0 0 20px rgba(255,61,0,0.3);  /* Accent glow */
```

## 2.6 Z-Index Scale

```css
--z-base:       0;
--z-dropdown:   100;
--z-sticky:     200;
--z-drawer:     300;
--z-modal:      400;
--z-toast:      500;
--z-tooltip:    600;
```

---

# 3. ARQUITECTURA DE CARPETAS

```
maal-line/
├── app/
│   ├── layout.tsx                 # Root layout (fonts, analytics, providers)
│   ├── page.tsx                   # Home
│   ├── globals.css                # Tailwind + custom properties
│   ├── loading.tsx                # Global loading state
│   ├── error.tsx                  # Global error boundary
│   ├── not-found.tsx              # 404 page
│   │
│   ├── (shop)/                    # Route group - shop pages
│   │   ├── layout.tsx             # Shop layout (header, footer, cart)
│   │   ├── coleccion/
│   │   │   ├── page.tsx           # /coleccion - Catálogo principal
│   │   │   └── [category]/
│   │   │       └── page.tsx       # /coleccion/hoodies, /coleccion/tees
│   │   ├── producto/
│   │   │   └── [slug]/
│   │   │       └── page.tsx       # /producto/hoodie-maal-oversized
│   │   ├── drops/
│   │   │   └── page.tsx           # /drops - New arrivals
│   │   ├── restocks/
│   │   │   └── page.tsx           # /restocks
│   │   └── best-sellers/
│   │       └── page.tsx           # /best-sellers
│   │
│   ├── (checkout)/                # Route group - checkout flow
│   │   ├── layout.tsx             # Minimal layout (no nav)
│   │   ├── cart/
│   │   │   └── page.tsx           # /cart
│   │   └── checkout/
│   │       └── page.tsx           # /checkout
│   │
│   ├── (content)/                 # Route group - content pages
│   │   ├── layout.tsx
│   │   ├── lookbook/
│   │   │   └── page.tsx           # /lookbook
│   │   ├── about/
│   │   │   └── page.tsx           # /about
│   │   ├── guia-tallas/
│   │   │   └── page.tsx           # /guia-tallas
│   │   └── contacto/
│   │       └── page.tsx           # /contacto
│   │
│   ├── (legal)/                   # Route group - legal
│   │   ├── terminos/
│   │   │   └── page.tsx
│   │   ├── privacidad/
│   │   │   └── page.tsx
│   │   └── envios-devoluciones/
│   │       └── page.tsx
│   │
│   └── api/                       # API routes
│       ├── products/
│       │   └── route.ts
│       ├── cart/
│       │   └── route.ts
│       ├── checkout/
│       │   └── route.ts
│       └── analytics/
│           └── route.ts
│
├── components/
│   ├── ui/                        # UI Kit primitivos
│   │   ├── button.tsx
│   │   ├── badge.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── drawer.tsx
│   │   ├── modal.tsx
│   │   ├── toast.tsx
│   │   ├── skeleton.tsx
│   │   ├── accordion.tsx
│   │   └── index.ts               # Barrel export
│   │
│   ├── product/                   # Componentes de producto
│   │   ├── product-card.tsx
│   │   ├── product-grid.tsx
│   │   ├── product-gallery.tsx
│   │   ├── product-info.tsx
│   │   ├── size-selector.tsx
│   │   ├── size-guide-modal.tsx
│   │   ├── quick-add.tsx
│   │   ├── stock-indicator.tsx
│   │   └── product-recommendations.tsx
│   │
│   ├── cart/                      # Componentes de carrito
│   │   ├── cart-drawer.tsx
│   │   ├── cart-item.tsx
│   │   ├── cart-summary.tsx
│   │   └── cart-empty.tsx
│   │
│   ├── checkout/                  # Componentes de checkout
│   │   ├── checkout-form.tsx
│   │   ├── shipping-form.tsx
│   │   ├── payment-form.tsx
│   │   ├── order-summary.tsx
│   │   └── checkout-steps.tsx
│   │
│   ├── filters/                   # Sistema de filtros
│   │   ├── filter-drawer.tsx
│   │   ├── filter-size.tsx
│   │   ├── filter-category.tsx
│   │   ├── filter-availability.tsx
│   │   ├── filter-price.tsx
│   │   ├── sort-dropdown.tsx
│   │   └── active-filters.tsx
│   │
│   ├── navigation/                # Navegación
│   │   ├── navbar.tsx
│   │   ├── navbar-mobile.tsx
│   │   ├── mega-menu.tsx
│   │   ├── promo-bar.tsx
│   │   ├── footer.tsx
│   │   ├── breadcrumbs.tsx
│   │   └── mobile-menu.tsx
│   │
│   ├── home/                      # Componentes específicos home
│   │   ├── hero-section.tsx
│   │   ├── drops-section.tsx
│   │   ├── best-sellers-section.tsx
│   │   ├── categories-grid.tsx
│   │   ├── instagram-feed.tsx
│   │   └── newsletter-section.tsx
│   │
│   ├── lookbook/                  # Componentes lookbook
│   │   ├── lookbook-grid.tsx
│   │   ├── lookbook-image.tsx
│   │   └── lookbook-modal.tsx
│   │
│   └── common/                    # Componentes compartidos
│       ├── logo.tsx
│       ├── icon.tsx
│       ├── image-with-fallback.tsx
│       ├── price.tsx
│       ├── countdown.tsx
│       ├── marquee.tsx
│       └── loading-spinner.tsx
│
├── lib/
│   ├── db/
│   │   ├── index.ts               # Neon connection
│   │   ├── schema.ts              # Drizzle schema
│   │   └── queries/
│   │       ├── products.ts
│   │       ├── orders.ts
│   │       └── cart.ts
│   │
│   ├── utils/
│   │   ├── cn.ts                  # clsx + tailwind-merge
│   │   ├── formatters.ts          # Precio, fechas, etc
│   │   └── validators.ts
│   │
│   ├── hooks/
│   │   ├── use-cart.ts
│   │   ├── use-filters.ts
│   │   ├── use-media-query.ts
│   │   ├── use-intersection.ts
│   │   └── use-local-storage.ts
│   │
│   ├── store/
│   │   ├── cart-store.ts          # Zustand cart
│   │   ├── filter-store.ts
│   │   └── ui-store.ts
│   │
│   └── analytics/
│       ├── gtag.ts                # GA4 helpers
│       ├── pixel.ts               # Meta Pixel helpers
│       ├── google-ads.ts          # Google Ads conversion
│       └── events.ts              # Event definitions
│
├── types/
│   ├── product.ts
│   ├── cart.ts
│   ├── order.ts
│   └── api.ts
│
├── public/
│   ├── fonts/
│   │   ├── SpaceGrotesk-Variable.woff2
│   │   └── Inter-Variable.woff2
│   ├── images/
│   │   ├── logo/
│   │   ├── placeholders/
│   │   └── og/
│   └── icons/
│
├── styles/
│   └── fonts.css                  # @font-face definitions
│
├── tailwind.config.ts
├── next.config.js
├── drizzle.config.ts
└── package.json
```

---

# 4. UI KIT - COMPONENTES BASE

## 4.1 Button

### Variantes
```tsx
// components/ui/button.tsx

import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'
import { forwardRef } from 'react'

const buttonVariants = cva(
  // Base styles
  `inline-flex items-center justify-center font-semibold
   transition-all duration-200 ease-out
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
   disabled:opacity-50 disabled:pointer-events-none
   active:scale-[0.98]`,
  {
    variants: {
      variant: {
        // Primary - CTA principal (naranja)
        primary: `
          bg-accent-primary text-white
          hover:bg-accent-secondary hover:shadow-glow
          focus-visible:ring-accent-primary
        `,
        // Secondary - Outlined
        secondary: `
          bg-transparent border-2 border-white text-white
          hover:bg-white hover:text-black
          focus-visible:ring-white
        `,
        // Ghost - Sin fondo
        ghost: `
          bg-transparent text-white
          hover:bg-white/10
          focus-visible:ring-white/50
        `,
        // Dark - Para fondos claros
        dark: `
          bg-black text-white
          hover:bg-neutral-800
          focus-visible:ring-black
        `,
        // Destructive
        destructive: `
          bg-red-600 text-white
          hover:bg-red-700
          focus-visible:ring-red-600
        `,
      },
      size: {
        sm: 'h-9 px-4 text-sm rounded',
        md: 'h-11 px-6 text-base rounded',
        lg: 'h-13 px-8 text-lg rounded',
        xl: 'h-14 px-10 text-lg rounded',
        icon: 'h-10 w-10 rounded',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : leftIcon ? (
          <span className="mr-2">{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'
```

### Uso
```tsx
<Button variant="primary" size="lg">COMPRAR AHORA</Button>
<Button variant="secondary">VER COLECCIÓN</Button>
<Button variant="ghost" size="icon"><CartIcon /></Button>
<Button variant="primary" fullWidth isLoading>PROCESANDO...</Button>
```

---

## 4.2 Badge

```tsx
// components/ui/badge.tsx

import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const badgeVariants = cva(
  `inline-flex items-center font-bold uppercase tracking-wider`,
  {
    variants: {
      variant: {
        // New Drop - Verde vibrante
        new: 'bg-green-500 text-black',
        // Restock - Naranja accent
        restock: 'bg-accent-primary text-white',
        // Best Seller - Dorado
        bestseller: 'bg-amber-400 text-black',
        // Sold Out - Gris
        soldout: 'bg-neutral-600 text-white',
        // Sale - Rojo
        sale: 'bg-red-600 text-white',
        // Limited - Negro con borde
        limited: 'bg-black text-white border border-white',
        // Default outline
        outline: 'bg-transparent border border-current',
      },
      size: {
        xs: 'px-1.5 py-0.5 text-[10px]',
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
      },
    },
    defaultVariants: {
      variant: 'new',
      size: 'sm',
    },
  }
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}
```

### Uso
```tsx
<Badge variant="new">NEW DROP</Badge>
<Badge variant="restock">RESTOCK</Badge>
<Badge variant="soldout" size="xs">AGOTADO</Badge>
<Badge variant="sale">-20%</Badge>
```

---

## 4.3 ProductCard

```tsx
// components/product/product-card.tsx

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { QuickAdd } from './quick-add'
import { cn } from '@/lib/utils/cn'
import { formatPrice } from '@/lib/utils/formatters'
import { trackViewItem } from '@/lib/analytics/events'
import type { Product } from '@/types/product'

interface ProductCardProps {
  product: Product
  priority?: boolean
  showQuickAdd?: boolean
  className?: string
}

export function ProductCard({
  product,
  priority = false,
  showQuickAdd = true,
  className,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showSizes, setShowSizes] = useState(false)

  const {
    slug,
    name,
    price,
    compareAtPrice,
    images,
    badge,
    availableSizes,
    isNew,
    isRestock,
    isBestSeller,
    isSoldOut,
  } = product

  const hasDiscount = compareAtPrice && compareAtPrice > price
  const discountPercent = hasDiscount
    ? Math.round((1 - price / compareAtPrice) * 100)
    : 0

  const handleMouseEnter = () => {
    setIsHovered(true)
    trackViewItem(product) // GA4: view_item en hover
  }

  return (
    <article
      className={cn(
        'group relative flex flex-col',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => {
        setIsHovered(false)
        setShowSizes(false)
      }}
    >
      {/* Image Container */}
      <Link
        href={`/producto/${slug}`}
        className="relative aspect-[3/4] overflow-hidden bg-neutral-900"
      >
        {/* Primary Image */}
        <Image
          src={images[0]}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={cn(
            'object-cover transition-all duration-500',
            isHovered && images[1] ? 'opacity-0 scale-105' : 'opacity-100'
          )}
          priority={priority}
        />

        {/* Secondary Image (hover) */}
        {images[1] && (
          <Image
            src={images[1]}
            alt={`${name} - Vista alternativa`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              'object-cover transition-all duration-500',
              isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            )}
          />
        )}

        {/* Badges - Top Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isNew && <Badge variant="new">NEW</Badge>}
          {isRestock && <Badge variant="restock">RESTOCK</Badge>}
          {isBestSeller && <Badge variant="bestseller">BEST SELLER</Badge>}
          {hasDiscount && <Badge variant="sale">-{discountPercent}%</Badge>}
        </div>

        {/* Sold Out Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
            <span className="text-white font-bold text-lg tracking-wider">
              AGOTADO
            </span>
          </div>
        )}

        {/* Quick Add Button (Desktop) - Bottom */}
        {showQuickAdd && !isSoldOut && (
          <div
            className={cn(
              'absolute bottom-0 left-0 right-0 p-3',
              'translate-y-full opacity-0 transition-all duration-300',
              'group-hover:translate-y-0 group-hover:opacity-100',
              'hidden md:block'
            )}
          >
            <Button
              variant="primary"
              fullWidth
              onClick={(e) => {
                e.preventDefault()
                setShowSizes(true)
              }}
            >
              AÑADIR
            </Button>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="mt-3 space-y-1">
        <Link href={`/producto/${slug}`}>
          <h3 className="font-semibold text-white text-sm md:text-base truncate hover:text-accent-primary transition-colors">
            {name}
          </h3>
        </Link>

        <div className="flex items-center gap-2">
          <span className="font-bold text-white">
            {formatPrice(price)}
          </span>
          {hasDiscount && (
            <span className="text-neutral-500 line-through text-sm">
              {formatPrice(compareAtPrice)}
            </span>
          )}
        </div>

        {/* Available Sizes - Mobile always visible */}
        <div className="flex gap-1 mt-2 md:hidden">
          {availableSizes.slice(0, 5).map((size) => (
            <span
              key={size}
              className="text-[10px] text-neutral-400 border border-neutral-700 px-1.5 py-0.5"
            >
              {size}
            </span>
          ))}
        </div>
      </div>

      {/* Quick Add Drawer */}
      {showSizes && (
        <QuickAdd
          product={product}
          onClose={() => setShowSizes(false)}
        />
      )}
    </article>
  )
}
```

### Especificaciones Visuales ProductCard

| Elemento | Especificación |
|----------|----------------|
| **Aspect ratio** | 3:4 (vertical, streetwear standard) |
| **Image hover** | Crossfade 500ms + scale 1.05 |
| **Badge position** | Top-left, 12px padding |
| **Badge stack** | Vertical, 6px gap |
| **Price font** | font-bold, white |
| **Name truncate** | Single line con ellipsis |
| **Quick add button** | Slide up 300ms en hover |
| **Sold out overlay** | bg-black/60, centered text |

---

## 4.4 SizeSelector

```tsx
// components/product/size-selector.tsx

'use client'

import { cn } from '@/lib/utils/cn'

interface Size {
  value: string
  available: boolean
  stock?: number // Para mostrar "últimas X"
}

interface SizeSelectorProps {
  sizes: Size[]
  selectedSize: string | null
  onSelect: (size: string) => void
  showStock?: boolean
}

export function SizeSelector({
  sizes,
  selectedSize,
  onSelect,
  showStock = false,
}: SizeSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white">
          TALLA: <span className="text-accent-primary">{selectedSize || 'Selecciona'}</span>
        </span>
        <button className="text-xs text-neutral-400 underline hover:text-white transition-colors">
          Guía de tallas
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {sizes.map(({ value, available, stock }) => (
          <button
            key={value}
            disabled={!available}
            onClick={() => available && onSelect(value)}
            className={cn(
              'relative min-w-[48px] h-12 px-3',
              'border-2 font-semibold text-sm',
              'transition-all duration-200',
              // Estados
              available
                ? selectedSize === value
                  ? 'border-accent-primary bg-accent-primary text-white'
                  : 'border-neutral-600 text-white hover:border-white'
                : 'border-neutral-800 text-neutral-600 cursor-not-allowed line-through'
            )}
          >
            {value}

            {/* Low stock indicator */}
            {showStock && available && stock && stock <= 3 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Low stock warning */}
      {showStock && selectedSize && (
        <LowStockWarning
          stock={sizes.find((s) => s.value === selectedSize)?.stock}
        />
      )}
    </div>
  )
}

function LowStockWarning({ stock }: { stock?: number }) {
  if (!stock || stock > 5) return null

  return (
    <p className="text-sm text-amber-400 flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
      {stock === 1 ? '¡Última pieza!' : `Solo quedan ${stock}`}
    </p>
  )
}
```

### Especificaciones Visuales SizeSelector

| Estado | Estilo |
|--------|--------|
| **Default** | border-neutral-600, text-white |
| **Hover** | border-white |
| **Selected** | border-accent + bg-accent, text-white |
| **Disabled** | border-neutral-800, text-neutral-600, line-through |
| **Low stock** | Red dot indicator (top-right) |

---

## 4.5 FilterDrawer

```tsx
// components/filters/filter-drawer.tsx

'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { FilterSize } from './filter-size'
import { FilterCategory } from './filter-category'
import { FilterAvailability } from './filter-availability'
import { FilterPrice } from './filter-price'
import { useFilterStore } from '@/lib/store/filter-store'
import { cn } from '@/lib/utils/cn'
import { XIcon } from '@/components/common/icon'

interface FilterDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function FilterDrawer({ isOpen, onClose }: FilterDrawerProps) {
  const { filters, clearAllFilters, activeFilterCount } = useFilterStore()

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (typeof window === 'undefined') return null

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/70 z-drawer transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={cn(
          'fixed top-0 right-0 h-full w-full max-w-md',
          'bg-neutral-950 border-l border-neutral-800',
          'z-drawer transform transition-transform duration-300 ease-out',
          'flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Filtros"
      >
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <h2 className="text-lg font-bold text-white">
            FILTROS
            {activeFilterCount > 0 && (
              <span className="ml-2 text-accent-primary">
                ({activeFilterCount})
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white transition-colors"
            aria-label="Cerrar filtros"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </header>

        {/* Filter Sections */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          <FilterCategory />
          <FilterSize />
          <FilterAvailability />
          <FilterPrice />
        </div>

        {/* Footer Actions */}
        <footer className="px-6 py-4 border-t border-neutral-800 space-y-3">
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              fullWidth
              onClick={clearAllFilters}
            >
              Limpiar filtros ({activeFilterCount})
            </Button>
          )}
          <Button
            variant="primary"
            fullWidth
            onClick={onClose}
          >
            VER RESULTADOS
          </Button>
        </footer>
      </aside>
    </>,
    document.body
  )
}
```

### Filter Components Individuales

```tsx
// components/filters/filter-size.tsx

'use client'

import { useFilterStore } from '@/lib/store/filter-store'
import { cn } from '@/lib/utils/cn'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']

export function FilterSize() {
  const { filters, toggleSize } = useFilterStore()
  const selectedSizes = filters.sizes

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
        Talla
      </h3>
      <div className="flex flex-wrap gap-2">
        {SIZES.map((size) => {
          const isSelected = selectedSizes.includes(size)
          return (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={cn(
                'px-4 py-2 text-sm font-medium border transition-all',
                isSelected
                  ? 'border-accent-primary bg-accent-primary/20 text-white'
                  : 'border-neutral-700 text-neutral-300 hover:border-white hover:text-white'
              )}
            >
              {size}
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

```tsx
// components/filters/filter-availability.tsx

'use client'

import { useFilterStore } from '@/lib/store/filter-store'
import { cn } from '@/lib/utils/cn'

export function FilterAvailability() {
  const { filters, setAvailability } = useFilterStore()

  const options = [
    { value: 'all', label: 'Todos' },
    { value: 'available', label: 'Disponibles' },
    { value: 'soldout', label: 'Agotados' },
  ]

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
        Disponibilidad
      </h3>
      <div className="space-y-2">
        {options.map(({ value, label }) => (
          <label
            key={value}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <span
              className={cn(
                'w-5 h-5 border-2 rounded-sm flex items-center justify-center transition-all',
                filters.availability === value
                  ? 'border-accent-primary bg-accent-primary'
                  : 'border-neutral-600 group-hover:border-white'
              )}
            >
              {filters.availability === value && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            <span className="text-neutral-300 group-hover:text-white transition-colors">
              {label}
            </span>
            <input
              type="radio"
              name="availability"
              value={value}
              checked={filters.availability === value}
              onChange={() => setAvailability(value)}
              className="sr-only"
            />
          </label>
        ))}
      </div>
    </div>
  )
}
```

---

## 4.6 Navbar

```tsx
// components/navigation/navbar.tsx

'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Logo } from '@/components/common/logo'
import { Button } from '@/components/ui/button'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { MobileMenu } from './mobile-menu'
import { useCartStore } from '@/lib/store/cart-store'
import { cn } from '@/lib/utils/cn'
import { MenuIcon, SearchIcon, UserIcon, CartIcon } from '@/components/common/icon'

const NAV_LINKS = [
  { href: '/drops', label: 'NEW DROPS', highlight: true },
  { href: '/restocks', label: 'RESTOCKS' },
  { href: '/best-sellers', label: 'BEST SELLERS' },
  { href: '/coleccion', label: 'SHOP ALL' },
  { href: '/lookbook', label: 'LOOKBOOK' },
]

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const cartItemCount = useCartStore((state) => state.itemCount)

  return (
    <>
      <header className="sticky top-0 z-sticky bg-black/95 backdrop-blur-md border-b border-neutral-800">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left - Mobile Menu + Logo */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 -ml-2 text-white"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Abrir menú"
            >
              <MenuIcon className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Logo className="h-8 w-auto" />
            </Link>
          </div>

          {/* Center - Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map(({ href, label, highlight }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'text-sm font-semibold tracking-wide transition-colors',
                  highlight
                    ? 'text-accent-primary hover:text-accent-secondary'
                    : 'text-white hover:text-accent-primary'
                )}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              className="p-2 text-white hover:text-accent-primary transition-colors"
              aria-label="Buscar"
            >
              <SearchIcon className="w-5 h-5" />
            </button>

            {/* Account - Hidden on mobile */}
            <Link
              href="/cuenta"
              className="hidden md:block p-2 text-white hover:text-accent-primary transition-colors"
              aria-label="Mi cuenta"
            >
              <UserIcon className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <button
              className="relative p-2 text-white hover:text-accent-primary transition-colors"
              onClick={() => setIsCartOpen(true)}
              aria-label={`Carrito (${cartItemCount} productos)`}
            >
              <CartIcon className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Drawer */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        links={NAV_LINKS}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  )
}
```

---

## 4.7 PromoBar

```tsx
// components/navigation/promo-bar.tsx

'use client'

import { useState } from 'react'
import { XIcon } from '@/components/common/icon'
import { cn } from '@/lib/utils/cn'

interface PromoBarProps {
  messages: string[]
  link?: {
    href: string
    label: string
  }
}

export function PromoBar({ messages, link }: PromoBarProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Rotate messages every 4 seconds
  useEffect(() => {
    if (messages.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [messages.length])

  if (!isVisible) return null

  return (
    <div className="bg-accent-primary text-white">
      <div className="container mx-auto px-4 py-2 flex items-center justify-center relative">
        {/* Message */}
        <p className="text-xs md:text-sm font-semibold text-center">
          {messages[currentIndex]}
          {link && (
            <a
              href={link.href}
              className="ml-2 underline hover:no-underline"
            >
              {link.label}
            </a>
          )}
        </p>

        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 p-1 hover:opacity-70 transition-opacity"
          aria-label="Cerrar"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Uso:
// <PromoBar
//   messages={[
//     "ENVÍO GRATIS en pedidos +$999",
//     "🔥 NEW DROP: OVERSIZED COLLECTION",
//     "PAGO EN 3 MSI con tarjetas participantes"
//   ]}
// />
```

---

## 4.8 Footer

```tsx
// components/navigation/footer.tsx

import Link from 'next/link'
import { Logo } from '@/components/common/logo'
import { InstagramIcon, TikTokIcon, TwitterIcon } from '@/components/common/icon'

const FOOTER_LINKS = {
  shop: {
    title: 'SHOP',
    links: [
      { href: '/drops', label: 'New Drops' },
      { href: '/best-sellers', label: 'Best Sellers' },
      { href: '/coleccion/hoodies', label: 'Hoodies' },
      { href: '/coleccion/tees', label: 'Tees' },
      { href: '/coleccion/bottoms', label: 'Bottoms' },
      { href: '/coleccion/accesorios', label: 'Accesorios' },
    ],
  },
  info: {
    title: 'INFO',
    links: [
      { href: '/about', label: 'Nuestra Historia' },
      { href: '/lookbook', label: 'Lookbook' },
      { href: '/guia-tallas', label: 'Guía de Tallas' },
      { href: '/contacto', label: 'Contacto' },
    ],
  },
  help: {
    title: 'AYUDA',
    links: [
      { href: '/envios-devoluciones', label: 'Envíos y Devoluciones' },
      { href: '/faq', label: 'FAQ' },
      { href: '/terminos', label: 'Términos y Condiciones' },
      { href: '/privacidad', label: 'Privacidad' },
    ],
  },
}

const SOCIAL_LINKS = [
  { href: 'https://instagram.com/maalline', icon: InstagramIcon, label: 'Instagram' },
  { href: 'https://tiktok.com/@maalline', icon: TikTokIcon, label: 'TikTok' },
  { href: 'https://twitter.com/maalline', icon: TwitterIcon, label: 'Twitter' },
]

export function Footer() {
  return (
    <footer className="bg-black border-t border-neutral-800">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Logo className="h-8 w-auto mb-4" />
            <p className="text-neutral-400 text-sm mb-6 max-w-xs">
              Streetwear oversize con actitud. Para los que no piden permiso.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-white transition-colors"
                  aria-label={label}
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.values(FOOTER_LINKS).map(({ title, links }) => (
            <div key={title}>
              <h3 className="text-white font-bold text-sm mb-4 tracking-wider">
                {title}
              </h3>
              <ul className="space-y-2">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-neutral-400 text-sm hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-800">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-neutral-500 text-xs">
            © {new Date().getFullYear()} MAAL Line. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            {/* Payment Icons Placeholder */}
            <div className="flex gap-2">
              <span className="text-neutral-500 text-xs">Visa</span>
              <span className="text-neutral-500 text-xs">Mastercard</span>
              <span className="text-neutral-500 text-xs">AMEX</span>
              <span className="text-neutral-500 text-xs">PayPal</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
```

---

# 5. PÁGINAS - ESPECIFICACIONES COMPLETAS

## 5.1 HOME PAGE

### Estructura

```tsx
// app/page.tsx

import { Suspense } from 'react'
import { HeroSection } from '@/components/home/hero-section'
import { DropsSection } from '@/components/home/drops-section'
import { BestSellersSection } from '@/components/home/best-sellers-section'
import { CategoriesGrid } from '@/components/home/categories-grid'
import { LookbookPreview } from '@/components/home/lookbook-preview'
import { InstagramFeed } from '@/components/home/instagram-feed'
import { NewsletterSection } from '@/components/home/newsletter-section'
import { ProductGridSkeleton } from '@/components/product/product-grid-skeleton'

export default function HomePage() {
  return (
    <main>
      {/* Hero - Full viewport, video/imagen editorial */}
      <HeroSection />

      {/* New Drops - Carrousel o grid 4 productos */}
      <Suspense fallback={<ProductGridSkeleton count={4} />}>
        <DropsSection />
      </Suspense>

      {/* Categories Grid - Visual navigation */}
      <CategoriesGrid />

      {/* Best Sellers */}
      <Suspense fallback={<ProductGridSkeleton count={8} />}>
        <BestSellersSection />
      </Suspense>

      {/* Lookbook Preview - Editorial teaser */}
      <LookbookPreview />

      {/* Instagram Feed */}
      <InstagramFeed />

      {/* Newsletter */}
      <NewsletterSection />
    </main>
  )
}
```

### Hero Section

```tsx
// components/home/hero-section.tsx

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

export function HeroSection() {
  // Opcional: video background
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)

  return (
    <section className="relative h-[100svh] min-h-[600px] flex items-end">
      {/* Background Media */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Video (si aplica) */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          onLoadedData={() => setIsVideoLoaded(true)}
        >
          <source src="/videos/hero-drop.mp4" type="video/mp4" />
        </video>

        {/* Fallback Image */}
        <Image
          src="/images/hero/hero-fallback.jpg"
          alt="MAAL Line Streetwear"
          fill
          priority
          className={cn(
            'object-cover transition-opacity duration-500',
            isVideoLoaded ? 'opacity-0' : 'opacity-100'
          )}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 pb-16 md:pb-24">
        <div className="max-w-2xl">
          {/* Badge */}
          <span className="inline-block bg-accent-primary text-white text-xs font-bold px-3 py-1 mb-4 tracking-wider">
            NEW DROP
          </span>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[0.95] mb-4">
            OVERSIZED
            <br />
            COLLECTION
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-neutral-300 mb-8 max-w-md">
            Piezas statement para los que no piden permiso. Cortes amplios, actitud fiera.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="primary" size="xl" asChild>
              <Link href="/drops">VER COLECCIÓN</Link>
            </Button>
            <Button variant="secondary" size="xl" asChild>
              <Link href="/lookbook">LOOKBOOK</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1.5 h-3 bg-white rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  )
}
```

### Drops Section

```tsx
// components/home/drops-section.tsx

import Link from 'next/link'
import { ProductCard } from '@/components/product/product-card'
import { Button } from '@/components/ui/button'
import { getNewDrops } from '@/lib/db/queries/products'

export async function DropsSection() {
  const products = await getNewDrops({ limit: 4 })

  return (
    <section className="py-16 md:py-24 bg-black">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-8 md:mb-12">
          <div>
            <span className="text-accent-primary text-sm font-bold tracking-wider">
              JUST DROPPED
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white mt-1">
              NEW ARRIVALS
            </h2>
          </div>
          <Button variant="secondary" size="sm" asChild className="hidden md:inline-flex">
            <Link href="/drops">VER TODO</Link>
          </Button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={index < 2}
            />
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 md:hidden">
          <Button variant="secondary" fullWidth asChild>
            <Link href="/drops">VER TODOS LOS DROPS</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
```

### Categories Grid

```tsx
// components/home/categories-grid.tsx

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

const CATEGORIES = [
  {
    slug: 'hoodies',
    name: 'HOODIES',
    image: '/images/categories/hoodies.jpg',
    span: 'md:col-span-2 md:row-span-2', // Feature size
  },
  {
    slug: 'tees',
    name: 'TEES',
    image: '/images/categories/tees.jpg',
    span: '',
  },
  {
    slug: 'bottoms',
    name: 'BOTTOMS',
    image: '/images/categories/bottoms.jpg',
    span: '',
  },
  {
    slug: 'accesorios',
    name: 'ACCESORIOS',
    image: '/images/categories/accesorios.jpg',
    span: 'md:col-span-2',
  },
]

export function CategoriesGrid() {
  return (
    <section className="py-16 md:py-24 bg-neutral-950">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-8 md:mb-12 text-center">
          SHOP BY CATEGORY
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {CATEGORIES.map(({ slug, name, image, span }) => (
            <Link
              key={slug}
              href={`/coleccion/${slug}`}
              className={cn(
                'group relative aspect-square overflow-hidden bg-neutral-900',
                span
              )}
            >
              <Image
                src={image}
                alt={name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />

              {/* Label */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-black text-xl md:text-2xl tracking-wider group-hover:scale-110 transition-transform duration-300">
                  {name}
                </span>
              </div>

              {/* Border accent on hover */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-accent-primary transition-colors duration-300" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
```

### Newsletter Section

```tsx
// components/home/newsletter-section.tsx

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    // TODO: Implementar integración con Klaviyo/Mailchimp
    await new Promise((r) => setTimeout(r, 1000))
    setStatus('success')
  }

  return (
    <section className="py-16 md:py-24 bg-accent-primary">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
          ÚNETE AL CREW
        </h2>
        <p className="text-white/80 mb-8 max-w-md mx-auto">
          Acceso anticipado a drops, restocks y contenido exclusivo. Sin spam, solo lo bueno.
        </p>

        {status === 'success' ? (
          <div className="bg-white/10 text-white px-6 py-4 rounded inline-block">
            <p className="font-semibold">¡Estás dentro! 🔥</p>
            <p className="text-sm text-white/80">Revisa tu email para confirmar.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="flex-1 h-12 px-4 bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-white"
              />
              <Button
                type="submit"
                variant="dark"
                size="lg"
                isLoading={status === 'loading'}
              >
                SUSCRIBIR
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
```

---

## 5.2 COLECCIÓN / CATÁLOGO

### Estructura

```tsx
// app/(shop)/coleccion/page.tsx

import { Suspense } from 'react'
import { ProductGrid } from '@/components/product/product-grid'
import { FilterBar } from '@/components/filters/filter-bar'
import { ActiveFilters } from '@/components/filters/active-filters'
import { ProductGridSkeleton } from '@/components/product/product-grid-skeleton'
import { getProducts } from '@/lib/db/queries/products'

interface ColeccionPageProps {
  searchParams: {
    sizes?: string
    availability?: string
    sort?: string
    page?: string
  }
}

export default async function ColeccionPage({ searchParams }: ColeccionPageProps) {
  return (
    <main className="min-h-screen bg-black">
      {/* Page Header */}
      <header className="border-b border-neutral-800">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <h1 className="text-3xl md:text-5xl font-black text-white">
            SHOP ALL
          </h1>
          <p className="text-neutral-400 mt-2">
            Toda la colección MAAL Line en un solo lugar
          </p>
        </div>
      </header>

      {/* Filter Bar - Sticky */}
      <FilterBar />

      {/* Active Filters */}
      <ActiveFilters />

      {/* Product Grid */}
      <section className="container mx-auto px-4 py-8">
        <Suspense
          fallback={<ProductGridSkeleton count={12} />}
          key={JSON.stringify(searchParams)}
        >
          <ProductGridAsync searchParams={searchParams} />
        </Suspense>
      </section>
    </main>
  )
}

async function ProductGridAsync({ searchParams }: { searchParams: ColeccionPageProps['searchParams'] }) {
  const products = await getProducts({
    sizes: searchParams.sizes?.split(','),
    availability: searchParams.availability,
    sort: searchParams.sort,
    page: Number(searchParams.page) || 1,
    limit: 12,
  })

  return (
    <>
      <ProductGrid products={products.items} />
      {/* Pagination */}
      {products.hasMore && (
        <LoadMoreButton currentPage={products.page} />
      )}
    </>
  )
}
```

### Filter Bar

```tsx
// components/filters/filter-bar.tsx

'use client'

import { useState } from 'react'
import { FilterDrawer } from './filter-drawer'
import { SortDropdown } from './sort-dropdown'
import { Button } from '@/components/ui/button'
import { useFilterStore } from '@/lib/store/filter-store'
import { FilterIcon, GridIcon } from '@/components/common/icon'

export function FilterBar() {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const activeFilterCount = useFilterStore((s) => s.activeFilterCount)

  return (
    <>
      <div className="sticky top-16 z-sticky bg-black/95 backdrop-blur-md border-b border-neutral-800">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left - Filter Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFilterOpen(true)}
            className="gap-2"
          >
            <FilterIcon className="w-4 h-4" />
            FILTROS
            {activeFilterCount > 0 && (
              <span className="bg-accent-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {/* Center - Results count */}
          <span className="hidden md:block text-sm text-neutral-400">
            24 productos
          </span>

          {/* Right - Sort + View toggle */}
          <div className="flex items-center gap-4">
            <SortDropdown />

            {/* Grid toggle - Desktop only */}
            <div className="hidden md:flex gap-1">
              <button className="p-2 text-white" aria-label="Grid 4 columnas">
                <GridIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
    </>
  )
}
```

### Product Grid

```tsx
// components/product/product-grid.tsx

import { ProductCard } from './product-card'
import { cn } from '@/lib/utils/cn'
import type { Product } from '@/types/product'

interface ProductGridProps {
  products: Product[]
  columns?: 2 | 3 | 4
  className?: string
}

export function ProductGrid({
  products,
  columns = 4,
  className
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-neutral-400 text-lg">
          No encontramos productos con esos filtros.
        </p>
        <p className="text-neutral-500 mt-2">
          Intenta ajustar tus filtros o explora toda la colección.
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'grid gap-4 md:gap-6',
        {
          'grid-cols-2': true,
          'md:grid-cols-3': columns >= 3,
          'lg:grid-cols-4': columns >= 4,
        },
        className
      )}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < 4}
        />
      ))}
    </div>
  )
}
```

---

## 5.3 PRODUCTO (PDP)

### Estructura

```tsx
// app/(shop)/producto/[slug]/page.tsx

import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { ProductGallery } from '@/components/product/product-gallery'
import { ProductInfo } from '@/components/product/product-info'
import { ProductRecommendations } from '@/components/product/product-recommendations'
import { Breadcrumbs } from '@/components/navigation/breadcrumbs'
import { getProductBySlug } from '@/lib/db/queries/products'
import { ProductViewTracker } from '@/components/product/product-view-tracker'
import type { Metadata } from 'next'

interface ProductPageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug)
  if (!product) return {}

  return {
    title: `${product.name} | MAAL Line`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.images[0]],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug)

  if (!product) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-black">
      {/* Analytics Tracker */}
      <ProductViewTracker product={product} />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Shop', href: '/coleccion' },
          { label: product.category, href: `/coleccion/${product.categorySlug}` },
          { label: product.name },
        ]}
      />

      {/* Product Section */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
          {/* Gallery - Left */}
          <ProductGallery images={product.images} name={product.name} />

          {/* Info - Right */}
          <ProductInfo product={product} />
        </div>
      </section>

      {/* Recommendations */}
      <Suspense fallback={null}>
        <ProductRecommendations
          productId={product.id}
          category={product.category}
        />
      </Suspense>
    </main>
  )
}
```

### Product Gallery

```tsx
// components/product/product-gallery.tsx

'use client'

import Image from 'next/image'
import { useState, useRef } from 'react'
import { cn } from '@/lib/utils/cn'
import { useSwipe } from '@/lib/hooks/use-swipe'

interface ProductGalleryProps {
  images: string[]
  name: string
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Swipe support for mobile
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => setActiveIndex((i) => Math.min(i + 1, images.length - 1)),
    onSwipeRight: () => setActiveIndex((i) => Math.max(i - 1, 0)),
  })

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails - Desktop */}
      <div className="hidden md:flex flex-col gap-3 w-20">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={cn(
              'relative aspect-[3/4] border-2 transition-colors',
              activeIndex === index
                ? 'border-accent-primary'
                : 'border-transparent hover:border-neutral-600'
            )}
          >
            <Image
              src={image}
              alt={`${name} - Vista ${index + 1}`}
              fill
              sizes="80px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div
        ref={containerRef}
        className="flex-1 relative"
        {...swipeHandlers}
      >
        <div className="relative aspect-[3/4] md:aspect-auto md:h-[80vh] md:max-h-[800px] bg-neutral-900 overflow-hidden">
          <Image
            src={images[activeIndex]}
            alt={`${name} - Imagen principal`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className={cn(
              'object-cover transition-transform duration-300',
              isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
            )}
            onClick={() => setIsZoomed(!isZoomed)}
            priority
          />
        </div>

        {/* Mobile Dots */}
        <div className="flex justify-center gap-2 mt-4 md:hidden">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                activeIndex === index
                  ? 'bg-accent-primary'
                  : 'bg-neutral-600'
              )}
              aria-label={`Ver imagen ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
```

### Product Info

```tsx
// components/product/product-info.tsx

'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SizeSelector } from './size-selector'
import { SizeGuideModal } from './size-guide-modal'
import { StockIndicator } from './stock-indicator'
import { Accordion } from '@/components/ui/accordion'
import { useCartStore } from '@/lib/store/cart-store'
import { trackAddToCart } from '@/lib/analytics/events'
import { formatPrice } from '@/lib/utils/formatters'
import type { Product } from '@/types/product'

interface ProductInfoProps {
  product: Product
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  const {
    name,
    price,
    compareAtPrice,
    description,
    sizes,
    isNew,
    isRestock,
    isSoldOut,
    features,
    care,
  } = product

  const hasDiscount = compareAtPrice && compareAtPrice > price
  const discountPercent = hasDiscount
    ? Math.round((1 - price / compareAtPrice) * 100)
    : 0

  const handleAddToCart = () => {
    if (!selectedSize) return

    addItem({
      productId: product.id,
      size: selectedSize,
      quantity: 1,
    })

    trackAddToCart(product, selectedSize)
  }

  return (
    <div className="flex flex-col md:sticky md:top-24 md:self-start">
      {/* Badges */}
      <div className="flex gap-2 mb-3">
        {isNew && <Badge variant="new">NEW DROP</Badge>}
        {isRestock && <Badge variant="restock">RESTOCK</Badge>}
        {hasDiscount && <Badge variant="sale">-{discountPercent}%</Badge>}
      </div>

      {/* Name */}
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white">
        {name}
      </h1>

      {/* Price */}
      <div className="flex items-center gap-3 mt-3">
        <span className="text-2xl font-bold text-white">
          {formatPrice(price)}
        </span>
        {hasDiscount && (
          <span className="text-lg text-neutral-500 line-through">
            {formatPrice(compareAtPrice)}
          </span>
        )}
      </div>

      {/* Stock Indicator */}
      <StockIndicator sizes={sizes} className="mt-4" />

      {/* Divider */}
      <hr className="border-neutral-800 my-6" />

      {/* Size Selector */}
      <SizeSelector
        sizes={sizes}
        selectedSize={selectedSize}
        onSelect={setSelectedSize}
        onOpenGuide={() => setIsGuideOpen(true)}
        showStock
      />

      {/* Add to Cart */}
      <div className="mt-6 space-y-3">
        <Button
          variant="primary"
          size="xl"
          fullWidth
          disabled={isSoldOut || !selectedSize}
          onClick={handleAddToCart}
        >
          {isSoldOut
            ? 'AGOTADO'
            : !selectedSize
            ? 'SELECCIONA TALLA'
            : 'AGREGAR AL CARRITO'}
        </Button>

        {/* Shipping info */}
        <p className="text-center text-sm text-neutral-400">
          Envío gratis en pedidos +$999 • 30 días para devoluciones
        </p>
      </div>

      {/* Divider */}
      <hr className="border-neutral-800 my-6" />

      {/* Product Details Accordion */}
      <div className="space-y-0">
        <Accordion title="DESCRIPCIÓN" defaultOpen>
          <p className="text-neutral-300 text-sm leading-relaxed">
            {description}
          </p>
        </Accordion>

        <Accordion title="CARACTERÍSTICAS">
          <ul className="space-y-2 text-neutral-300 text-sm">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-accent-primary">•</span>
                {feature}
              </li>
            ))}
          </ul>
        </Accordion>

        <Accordion title="CUIDADOS">
          <ul className="space-y-2 text-neutral-300 text-sm">
            {care.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-accent-primary">•</span>
                {item}
              </li>
            ))}
          </ul>
        </Accordion>

        <Accordion title="ENVÍO Y DEVOLUCIONES">
          <div className="text-neutral-300 text-sm space-y-3">
            <p>
              <strong className="text-white">Envío estándar:</strong> 3-5 días hábiles.
              Gratis en pedidos mayores a $999.
            </p>
            <p>
              <strong className="text-white">Devoluciones:</strong> 30 días para cambios
              o devoluciones. Producto sin usar, con etiquetas.
            </p>
          </div>
        </Accordion>
      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        category={product.category}
      />
    </div>
  )
}
```

---

## 5.4 CART + CHECKOUT

### Cart Drawer

```tsx
// components/cart/cart-drawer.tsx

'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CartItem } from './cart-item'
import { CartEmpty } from './cart-empty'
import { CartSummary } from './cart-summary'
import { useCartStore } from '@/lib/store/cart-store'
import { cn } from '@/lib/utils/cn'
import { XIcon } from '@/components/common/icon'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, itemCount, subtotal } = useCartStore()

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (typeof window === 'undefined') return null

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/70 z-drawer transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={cn(
          'fixed top-0 right-0 h-full w-full max-w-md',
          'bg-neutral-950 border-l border-neutral-800',
          'z-drawer transform transition-transform duration-300',
          'flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <h2 className="text-lg font-bold text-white">
            TU CARRITO ({itemCount})
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white"
            aria-label="Cerrar carrito"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <CartEmpty onClose={onClose} />
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item) => (
                <CartItem key={`${item.productId}-${item.size}`} item={item} />
              ))}
            </div>

            {/* Footer */}
            <footer className="px-6 py-4 border-t border-neutral-800 space-y-4">
              <CartSummary subtotal={subtotal} />

              <Button
                variant="primary"
                size="xl"
                fullWidth
                asChild
                onClick={onClose}
              >
                <Link href="/checkout">
                  CHECKOUT • {formatPrice(subtotal)}
                </Link>
              </Button>

              <p className="text-center text-xs text-neutral-500">
                Envío calculado al checkout
              </p>
            </footer>
          </>
        )}
      </aside>
    </>,
    document.body
  )
}
```

### Checkout Page

```tsx
// app/(checkout)/checkout/page.tsx

'use client'

import { useState } from 'react'
import { Logo } from '@/components/common/logo'
import { CheckoutSteps } from '@/components/checkout/checkout-steps'
import { ShippingForm } from '@/components/checkout/shipping-form'
import { PaymentForm } from '@/components/checkout/payment-form'
import { OrderSummary } from '@/components/checkout/order-summary'
import Link from 'next/link'

type Step = 'shipping' | 'payment' | 'confirmation'

export default function CheckoutPage() {
  const [step, setStep] = useState<Step>('shipping')
  const [shippingData, setShippingData] = useState(null)

  return (
    <main className="min-h-screen bg-black">
      {/* Minimal Header */}
      <header className="border-b border-neutral-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Logo className="h-6" />
          </Link>
          <Link
            href="/cart"
            className="text-sm text-neutral-400 hover:text-white"
          >
            Volver al carrito
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Steps Indicator */}
        <CheckoutSteps currentStep={step} />

        <div className="grid lg:grid-cols-2 gap-12 mt-8">
          {/* Left - Forms */}
          <div>
            {step === 'shipping' && (
              <ShippingForm
                onComplete={(data) => {
                  setShippingData(data)
                  setStep('payment')
                }}
              />
            )}

            {step === 'payment' && (
              <PaymentForm
                shippingData={shippingData}
                onBack={() => setStep('shipping')}
                onComplete={() => setStep('confirmation')}
              />
            )}

            {step === 'confirmation' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  ¡Orden confirmada!
                </h1>
                <p className="text-neutral-400">
                  Te enviamos un email con los detalles de tu pedido.
                </p>
              </div>
            )}
          </div>

          {/* Right - Order Summary */}
          <div className="lg:pl-12 lg:border-l lg:border-neutral-800">
            <OrderSummary />
          </div>
        </div>
      </div>
    </main>
  )
}
```

---

## 5.5 LOOKBOOK

```tsx
// app/(content)/lookbook/page.tsx

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lookbook | MAAL Line',
  description: 'Explora el lookbook de MAAL Line. Editorial streetwear con actitud.',
}

const LOOKBOOK_IMAGES = [
  {
    src: '/images/lookbook/look-1.jpg',
    alt: 'Look 1 - Hoodie Oversized',
    products: ['/producto/hoodie-maal-01'],
    span: 'md:col-span-2 md:row-span-2',
    aspect: 'aspect-[4/5]',
  },
  {
    src: '/images/lookbook/look-2.jpg',
    alt: 'Look 2 - Tee Essential',
    products: ['/producto/tee-essential-01'],
    span: '',
    aspect: 'aspect-square',
  },
  // ... más imágenes
]

export default function LookbookPage() {
  return (
    <main className="min-h-screen bg-black">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center">
        <Image
          src="/images/lookbook/hero.jpg"
          alt="MAAL Line Lookbook"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative text-center">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
            LOOKBOOK
          </h1>
          <p className="text-neutral-300 mt-4 text-lg">
            FALL/WINTER 2026
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {LOOKBOOK_IMAGES.map((image, index) => (
            <div
              key={index}
              className={cn(
                'group relative overflow-hidden bg-neutral-900',
                image.span,
                image.aspect
              )}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end p-6 opacity-0 group-hover:opacity-100">
                <Button variant="primary" size="sm" asChild>
                  <Link href={image.products[0]}>
                    VER PRODUCTO
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-16 border-t border-neutral-800">
        <h2 className="text-2xl font-bold text-white mb-4">
          EXPLORA LA COLECCIÓN COMPLETA
        </h2>
        <Button variant="primary" size="xl" asChild>
          <Link href="/coleccion">SHOP ALL</Link>
        </Button>
      </section>
    </main>
  )
}
```

---

## 5.6 ABOUT

```tsx
// app/(content)/about/page.tsx

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nuestra Historia | MAAL Line',
  description: 'Conoce la historia detrás de MAAL Line. Streetwear oversize con actitud, creado en México.',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black">
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center">
        <Image
          src="/images/about/hero.jpg"
          alt="MAAL Line Team"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="relative container mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-black text-white max-w-xl leading-[0.95]">
            NUESTRA
            <br />
            HISTORIA
          </h1>
        </div>
      </section>

      {/* Story Section 1 */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-accent-primary text-sm font-bold tracking-wider">
                EL ORIGEN
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white mt-2 mb-6">
                NACIDOS PARA
                <br />
                ROMPER REGLAS
              </h2>
              <div className="space-y-4 text-neutral-300 leading-relaxed">
                <p>
                  MAAL Line nació de una obsesión: crear piezas que hablen sin
                  necesidad de gritar. Streetwear que no pide permiso, que no
                  sigue tendencias—las crea.
                </p>
                <p>
                  Empezamos en [CIUDAD], con una máquina de coser y una idea
                  clara: ropa oversized con calidad que no escatima, diseños
                  que cuentan historias, y una comunidad que entiende que el
                  estilo es actitud.
                </p>
                <p>
                  Cada pieza que creamos es un statement. No hacemos ropa para
                  encajar—hacemos ropa para destacar.
                </p>
              </div>
            </div>
            <div className="relative aspect-[4/5] bg-neutral-900">
              <Image
                src="/images/about/story-1.jpg"
                alt="Proceso de creación"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-neutral-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-black text-white text-center mb-12">
            LO QUE NOS DEFINE
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'CALIDAD SIN EXCUSAS',
                description:
                  'Materiales premium, costuras reforzadas, acabados que duran. No cortamos esquinas.',
              },
              {
                title: 'DISEÑO CON PROPÓSITO',
                description:
                  'Cada pieza tiene una razón de ser. Funcionalidad y estética en equilibrio perfecto.',
              },
              {
                title: 'COMUNIDAD PRIMERO',
                description:
                  'Escuchamos, respondemos, creamos para ustedes. MAAL es de quien lo vive.',
              },
            ].map(({ title, description }) => (
              <div key={title} className="text-center">
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-neutral-400">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">
          ¿LISTO PARA UNIRTE?
        </h2>
        <Button variant="primary" size="xl" asChild>
          <Link href="/coleccion">EXPLORAR COLECCIÓN</Link>
        </Button>
      </section>
    </main>
  )
}
```

---

# 6. ANALYTICS & TRACKING

## 6.1 Eventos E-commerce (GA4)

| Evento | Trigger | Parámetros |
|--------|---------|------------|
| `view_item` | Usuario ve PDP o hover en ProductCard | `item_id`, `item_name`, `item_category`, `price`, `currency` |
| `view_item_list` | Carga de grid de productos | `item_list_id`, `item_list_name`, `items[]` |
| `select_item` | Click en ProductCard | `item_id`, `item_name`, `item_list_name` |
| `add_to_cart` | Click en "Añadir al carrito" | `item_id`, `item_name`, `item_category`, `price`, `quantity`, `item_variant` (talla) |
| `remove_from_cart` | Eliminar item del carrito | `item_id`, `item_name`, `price`, `quantity` |
| `view_cart` | Abrir cart drawer | `items[]`, `value`, `currency` |
| `begin_checkout` | Entrar a /checkout | `items[]`, `value`, `currency`, `coupon` |
| `add_shipping_info` | Completar shipping form | `shipping_tier`, `value`, `currency` |
| `add_payment_info` | Seleccionar método de pago | `payment_type`, `value`, `currency` |
| `purchase` | Orden completada | `transaction_id`, `value`, `tax`, `shipping`, `currency`, `coupon`, `items[]` |

## 6.2 Implementación GA4

```tsx
// lib/analytics/gtag.ts

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID

// Page view
export const pageview = (url: string) => {
  if (typeof window.gtag === 'undefined') return
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  })
}

// Custom event
export const event = (
  action: string,
  params: Record<string, any>
) => {
  if (typeof window.gtag === 'undefined') return
  window.gtag('event', action, params)
}
```

```tsx
// lib/analytics/events.ts

import { event } from './gtag'
import { fbq } from './pixel'
import type { Product, CartItem } from '@/types'

// View Item
export const trackViewItem = (product: Product) => {
  const item = formatItem(product)

  // GA4
  event('view_item', {
    currency: 'MXN',
    value: product.price,
    items: [item],
  })

  // Meta Pixel
  fbq('track', 'ViewContent', {
    content_ids: [product.id],
    content_type: 'product',
    value: product.price,
    currency: 'MXN',
  })
}

// Add to Cart
export const trackAddToCart = (product: Product, size: string) => {
  const item = formatItem(product, size)

  // GA4
  event('add_to_cart', {
    currency: 'MXN',
    value: product.price,
    items: [item],
  })

  // Meta Pixel
  fbq('track', 'AddToCart', {
    content_ids: [product.id],
    content_type: 'product',
    value: product.price,
    currency: 'MXN',
  })

  // Google Ads
  gtag('event', 'conversion', {
    send_to: 'AW-XXXXXXXXX/YYYYYYY',
    value: product.price,
    currency: 'MXN',
  })
}

// Begin Checkout
export const trackBeginCheckout = (items: CartItem[], value: number) => {
  // GA4
  event('begin_checkout', {
    currency: 'MXN',
    value,
    items: items.map(formatCartItem),
  })

  // Meta Pixel
  fbq('track', 'InitiateCheckout', {
    content_ids: items.map((i) => i.productId),
    value,
    currency: 'MXN',
    num_items: items.length,
  })
}

// Purchase
export const trackPurchase = (order: {
  id: string
  items: CartItem[]
  value: number
  shipping: number
  tax: number
}) => {
  // GA4
  event('purchase', {
    transaction_id: order.id,
    value: order.value,
    tax: order.tax,
    shipping: order.shipping,
    currency: 'MXN',
    items: order.items.map(formatCartItem),
  })

  // Meta Pixel
  fbq('track', 'Purchase', {
    content_ids: order.items.map((i) => i.productId),
    value: order.value,
    currency: 'MXN',
    num_items: order.items.length,
  })

  // Google Ads Conversion
  gtag('event', 'conversion', {
    send_to: 'AW-XXXXXXXXX/ZZZZZZZ',
    value: order.value,
    currency: 'MXN',
    transaction_id: order.id,
  })
}

// Helper
function formatItem(product: Product, variant?: string) {
  return {
    item_id: product.id,
    item_name: product.name,
    item_category: product.category,
    item_variant: variant,
    price: product.price,
    quantity: 1,
  }
}
```

## 6.3 Scripts en Layout

```tsx
// app/layout.tsx

import Script from 'next/script'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID
const PIXEL_ID = process.env.NEXT_PUBLIC_PIXEL_ID
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GADS_ID

export default function RootLayout({ children }) {
  return (
    <html lang="es-MX">
      <head>
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
            gtag('config', '${GOOGLE_ADS_ID}');
          `}
        </Script>

        {/* Meta Pixel */}
        <Script id="fb-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  )
}
```

---

# 7. SEO & META TAGS

## 7.1 Meta Tags por Página

### Home
```tsx
// app/page.tsx
export const metadata: Metadata = {
  title: 'MAAL Line | Streetwear Oversize con Actitud',
  description: 'Tienda oficial de MAAL Line. Hoodies, tees y bottoms oversized. Streetwear mexicano premium. Envío gratis +$999.',
  keywords: ['streetwear', 'oversize', 'hoodies', 'ropa urbana', 'mexico', 'maal line'],
  openGraph: {
    title: 'MAAL Line | Streetwear Oversize',
    description: 'Streetwear con actitud. No pedimos permiso.',
    images: ['/images/og/home.jpg'],
    type: 'website',
    locale: 'es_MX',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MAAL Line | Streetwear Oversize',
    description: 'Streetwear con actitud. No pedimos permiso.',
    images: ['/images/og/home.jpg'],
  },
}
```

### Colección
```tsx
// app/(shop)/coleccion/page.tsx
export const metadata: Metadata = {
  title: 'Shop All | MAAL Line',
  description: 'Explora toda la colección MAAL Line. Hoodies, tees y bottoms oversized. Filtros por talla y categoría.',
  openGraph: {
    title: 'Colección Completa | MAAL Line',
    description: 'Toda la colección MAAL Line en un solo lugar.',
    images: ['/images/og/coleccion.jpg'],
  },
}
```

### Producto (dinámico)
```tsx
// app/(shop)/producto/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug)
  if (!product) return {}

  return {
    title: `${product.name} | MAAL Line`,
    description: `Compra ${product.name}. ${product.description.slice(0, 120)}...`,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images,
      type: 'og:product',
    },
    other: {
      'product:price:amount': String(product.price),
      'product:price:currency': 'MXN',
      'product:availability': product.isSoldOut ? 'oos' : 'instock',
    },
  }
}
```

### Lookbook
```tsx
export const metadata: Metadata = {
  title: 'Lookbook Fall/Winter 2026 | MAAL Line',
  description: 'Editorial fotográfico de MAAL Line. Descubre las piezas de la temporada en acción.',
}
```

### About
```tsx
export const metadata: Metadata = {
  title: 'Nuestra Historia | MAAL Line',
  description: 'Conoce la historia detrás de MAAL Line. Streetwear oversize con actitud, creado en México.',
}
```

## 7.2 Headings Structure

| Página | H1 | H2s |
|--------|-----|-----|
| Home | (Hero implícito o visually hidden) "MAAL Line Streetwear" | NEW ARRIVALS, SHOP BY CATEGORY, BEST SELLERS, ÚNETE AL CREW |
| Colección | "SHOP ALL" | (Filtros no usan H2) |
| Producto | `{product.name}` | DESCRIPCIÓN, CARACTERÍSTICAS, CUIDADOS, ENVÍO |
| Lookbook | "LOOKBOOK" | FALL/WINTER 2026 |
| About | "NUESTRA HISTORIA" | EL ORIGEN, LO QUE NOS DEFINE |
| Cart | "TU CARRITO" | – |
| Checkout | "CHECKOUT" | ENVÍO, PAGO, RESUMEN |

## 7.3 Structured Data (JSON-LD)

```tsx
// components/product/product-json-ld.tsx

import type { Product } from '@/types'

export function ProductJsonLd({ product }: { product: Product }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'MAAL Line',
    },
    offers: {
      '@type': 'Offer',
      url: `https://maalline.com/producto/${product.slug}`,
      priceCurrency: 'MXN',
      price: product.price,
      availability: product.isSoldOut
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'MAAL Line',
      },
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
```

---

# 8. PERFORMANCE & OPTIMIZACIÓN

## 8.1 Imágenes

```tsx
// next.config.js

module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    domains: ['cdn.maalline.com'], // CDN domain
  },
}
```

### Uso de next/image

```tsx
// Siempre especificar sizes para responsive
<Image
  src={product.images[0]}
  alt={product.name}
  fill
  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
  priority={index < 4} // Solo above-the-fold
  className="object-cover"
/>
```

### Placeholders

```tsx
// Blur placeholder para LCP images
<Image
  src={heroImage}
  alt="Hero"
  fill
  priority
  placeholder="blur"
  blurDataURL={heroBlurDataUrl} // Base64 generado en build
/>
```

## 8.2 Fonts

```tsx
// app/layout.tsx

import { Space_Grotesk, Inter } from 'next/font/google'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
})

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
})

export default function RootLayout({ children }) {
  return (
    <html className={`${spaceGrotesk.variable} ${inter.variable}`}>
      ...
    </html>
  )
}
```

## 8.3 Code Splitting

```tsx
// Lazy load componentes heavy
import dynamic from 'next/dynamic'

// Cart Drawer - no SSR needed
const CartDrawer = dynamic(() => import('@/components/cart/cart-drawer'), {
  ssr: false,
})

// Size Guide Modal - load on demand
const SizeGuideModal = dynamic(
  () => import('@/components/product/size-guide-modal')
)

// Instagram Feed - below fold
const InstagramFeed = dynamic(
  () => import('@/components/home/instagram-feed'),
  { loading: () => <div className="h-96 bg-neutral-900 animate-pulse" /> }
)
```

## 8.4 Caching Strategy

```tsx
// lib/db/queries/products.ts

import { unstable_cache } from 'next/cache'

export const getProducts = unstable_cache(
  async (params: ProductQueryParams) => {
    // Query logic
  },
  ['products'],
  {
    revalidate: 60, // 1 minuto
    tags: ['products'],
  }
)

export const getProductBySlug = unstable_cache(
  async (slug: string) => {
    // Query logic
  },
  ['product'],
  {
    revalidate: 300, // 5 minutos
    tags: ['products', `product-${slug}`],
  }
)
```

## 8.5 Preloading

```tsx
// app/(shop)/layout.tsx

import { preload } from 'react-dom'

export default function ShopLayout({ children }) {
  // Preload critical fonts
  preload('/fonts/SpaceGrotesk-Variable.woff2', {
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  })

  return <>{children}</>
}
```

## 8.6 Route Prefetching

```tsx
// Prefetch on hover
<Link href="/producto/hoodie-maal" prefetch={true}>
  Ver producto
</Link>

// Disable prefetch for less critical links
<Link href="/terminos" prefetch={false}>
  Términos
</Link>
```

## 8.7 Checklist Core Web Vitals

| Métrica | Target | Estrategia |
|---------|--------|------------|
| **LCP** | < 2.5s | Hero image con priority, fonts preload, SSR |
| **FID** | < 100ms | Minimal JS bundle, code splitting |
| **CLS** | < 0.1 | Aspect ratios en imágenes, font display swap, skeleton loaders |
| **INP** | < 200ms | Debounce inputs, optimistic UI updates |

---

# 9. RESPONSIVE BREAKPOINTS

```tsx
// tailwind.config.ts

module.exports = {
  theme: {
    screens: {
      'sm': '640px',   // Mobile landscape
      'md': '768px',   // Tablet
      'lg': '1024px',  // Desktop
      'xl': '1280px',  // Large desktop
      '2xl': '1536px', // Ultra wide
    },
  },
}
```

## Grid Columns por Breakpoint

| Componente | Mobile (< 640px) | Tablet (768px) | Desktop (1024px+) |
|------------|------------------|----------------|-------------------|
| Product Grid | 2 cols | 3 cols | 4 cols |
| Category Grid | 2 cols | 4 cols | 4 cols |
| Footer Links | 2 cols | 4 cols | 4 cols |
| Checkout | Stack | Stack | 2 cols |

## Comportamiento Mobile-First

- **Navbar:** Hamburger menu, cart icon siempre visible
- **Filtros:** Drawer desde derecha (no sidebar)
- **Product cards:** Sin quick-add overlay, tallas visibles abajo
- **Gallery:** Swipe gestures, dots navigation
- **Promo bar:** Single line, text rotativo

---

# 10. ESTADOS & MICROINTERACCIONES

## 10.1 Estados de Botones

```css
/* Default → Hover → Active → Disabled */
.btn-primary {
  /* Default */
  background: var(--accent-primary);

  /* Hover */
  &:hover {
    background: var(--accent-secondary);
    box-shadow: var(--shadow-glow);
  }

  /* Active/Pressed */
  &:active {
    transform: scale(0.98);
  }

  /* Disabled */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
```

## 10.2 Estados de Product Card

| Estado | Visual |
|--------|--------|
| Default | Imagen estática |
| Hover | Secondary image crossfade, scale 1.05, quick-add slide up |
| Sold Out | Overlay oscuro, texto "AGOTADO" |
| Loading | Skeleton con pulse |

## 10.3 Animaciones

```css
/* Fade in para elementos que entran */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Slide para drawers */
@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

/* Pulse para loading */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

## 10.4 Transitions Globales

```css
/* Durations */
--duration-fast: 150ms;
--duration-base: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;

/* Easings */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
```

## 10.5 Toast Notifications

```tsx
// Feedback inmediato post-acción
<Toast variant="success" message="Agregado al carrito" />
<Toast variant="error" message="Error al procesar" />
<Toast variant="info" message="Stock limitado" />
```

---

# ANEXO: COPY PLACEHOLDERS

## Promo Bar Messages
```
"ENVÍO GRATIS en pedidos +$999 🚚"
"🔥 NEW DROP: OVERSIZED COLLECTION — SHOP NOW"
"PAGO EN 3 MSI con tarjetas participantes"
"⚡ RESTOCK ALERT: Hoodies disponibles"
```

## Hero Headlines
```
"OVERSIZED COLLECTION"
"NO PEDIMOS PERMISO"
"STREETWEAR CON ACTITUD"
"DROP [SEASON] YA DISPONIBLE"
```

## CTAs
```
Primary: "COMPRAR AHORA", "VER COLECCIÓN", "AGREGAR AL CARRITO"
Secondary: "VER TODO", "LOOKBOOK", "NUESTRA HISTORIA"
Urgency: "ÚLTIMAS PIEZAS", "CASI AGOTADO"
```

## Product Copy Template
```
Descripción: [Tipo de prenda] oversized con [característica principal].
Corte [tipo], ideal para [ocasión/estilo].
[Material] de [peso/calidad] que [beneficio].

Features:
- Material: 100% algodón premium [peso]gsm
- Corte: Oversized / Relaxed fit
- Detalles: [bordado/estampado/etc]
- Fabricación: Hecho en México

Cuidados:
- Lavar a máquina en frío
- No usar blanqueador
- Secar en sombra
- Planchar a temperatura media
```

---

# CHECKLIST PRE-LANZAMIENTO

- [ ] Todas las páginas cargan < 3s
- [ ] Core Web Vitals en verde
- [ ] Mobile responsive 100%
- [ ] Filtros funcionando correctamente
- [ ] Cart persistente (localStorage)
- [ ] Analytics trackeando todos los eventos
- [ ] Meta tags y OG images en todas las páginas
- [ ] 404 y error pages estilizadas
- [ ] Favicon y touch icons
- [ ] robots.txt y sitemap.xml
- [ ] SSL activo
- [ ] Imágenes optimizadas (WebP/AVIF)
- [ ] Fonts preloaded
- [ ] Accesibilidad básica (a11y)
- [ ] Cross-browser testing (Chrome, Safari, Firefox)

---

**Documento preparado para implementación.**
**Stack: Next.js 14 + Tailwind + Neon + Railway + Vercel**

---
