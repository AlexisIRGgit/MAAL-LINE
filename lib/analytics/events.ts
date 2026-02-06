/**
 * MAAL LINE - Analytics Events
 * GA4 + Meta Pixel + Google Ads conversion tracking
 */

import type { Product, CartItem, AnalyticsItem } from '@/types'

// ============================================
// TYPE DECLARATIONS
// ============================================

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    fbq: (...args: any[]) => void
    dataLayer: any[]
  }
}

// ============================================
// CONSTANTS
// ============================================

const GA_ID = process.env.NEXT_PUBLIC_GA_ID
const PIXEL_ID = process.env.NEXT_PUBLIC_PIXEL_ID
const GADS_ID = process.env.NEXT_PUBLIC_GADS_ID
const GADS_CONVERSION_LABEL = process.env.NEXT_PUBLIC_GADS_CONVERSION_LABEL

const CURRENCY = 'MXN'

// ============================================
// HELPERS
// ============================================

/**
 * Check if analytics is available
 */
function isAnalyticsReady(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function'
}

function isPixelReady(): boolean {
  return typeof window !== 'undefined' && typeof window.fbq === 'function'
}

/**
 * Format product for GA4 item schema
 */
function formatItem(product: Product, variant?: string, quantity = 1): AnalyticsItem {
  return {
    item_id: product.id,
    item_name: product.name,
    item_category: product.category,
    item_variant: variant,
    price: product.price,
    quantity,
  }
}

/**
 * Format cart item for GA4
 */
function formatCartItem(item: CartItem): AnalyticsItem {
  return {
    item_id: item.productId,
    item_name: item.product.name,
    item_category: item.product.category,
    item_variant: item.size,
    price: item.product.price,
    quantity: item.quantity,
  }
}

// ============================================
// GA4 EVENTS
// ============================================

/**
 * Track page view
 */
export function trackPageView(url: string, title?: string) {
  if (!isAnalyticsReady()) return

  window.gtag('config', GA_ID, {
    page_path: url,
    page_title: title,
  })

  // Meta Pixel PageView
  if (isPixelReady()) {
    window.fbq('track', 'PageView')
  }
}

/**
 * Track view_item - When user views a product
 */
export function trackViewItem(product: Product) {
  const item = formatItem(product)

  // GA4
  if (isAnalyticsReady()) {
    window.gtag('event', 'view_item', {
      currency: CURRENCY,
      value: product.price,
      items: [item],
    })
  }

  // Meta Pixel
  if (isPixelReady()) {
    window.fbq('track', 'ViewContent', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      value: product.price,
      currency: CURRENCY,
    })
  }
}

/**
 * Track view_item_list - When user views a product grid/collection
 */
export function trackViewItemList(
  products: Product[],
  listId: string,
  listName: string
) {
  if (!isAnalyticsReady()) return

  const items = products.map((product, index) => ({
    ...formatItem(product),
    index,
    item_list_id: listId,
    item_list_name: listName,
  }))

  window.gtag('event', 'view_item_list', {
    item_list_id: listId,
    item_list_name: listName,
    items,
  })
}

/**
 * Track select_item - When user clicks on a product
 */
export function trackSelectItem(product: Product, listName?: string) {
  if (!isAnalyticsReady()) return

  window.gtag('event', 'select_item', {
    item_list_name: listName,
    items: [formatItem(product)],
  })
}

/**
 * Track add_to_cart
 */
export function trackAddToCart(product: Product, size: string, quantity = 1) {
  const item = formatItem(product, size, quantity)
  const value = product.price * quantity

  // GA4
  if (isAnalyticsReady()) {
    window.gtag('event', 'add_to_cart', {
      currency: CURRENCY,
      value,
      items: [item],
    })
  }

  // Meta Pixel
  if (isPixelReady()) {
    window.fbq('track', 'AddToCart', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      value,
      currency: CURRENCY,
    })
  }

  // Google Ads (if configured for add_to_cart)
  // Uncomment if tracking ATC as conversion
  // if (isAnalyticsReady() && GADS_ID) {
  //   window.gtag('event', 'conversion', {
  //     send_to: `${GADS_ID}/${GADS_ATC_LABEL}`,
  //     value,
  //     currency: CURRENCY,
  //   })
  // }
}

/**
 * Track remove_from_cart
 */
export function trackRemoveFromCart(item: CartItem) {
  if (!isAnalyticsReady()) return

  window.gtag('event', 'remove_from_cart', {
    currency: CURRENCY,
    value: item.product.price * item.quantity,
    items: [formatCartItem(item)],
  })
}

/**
 * Track view_cart
 */
export function trackViewCart(items: CartItem[], value: number) {
  if (!isAnalyticsReady()) return

  window.gtag('event', 'view_cart', {
    currency: CURRENCY,
    value,
    items: items.map(formatCartItem),
  })
}

/**
 * Track begin_checkout
 */
export function trackBeginCheckout(items: CartItem[], value: number, coupon?: string) {
  const formattedItems = items.map(formatCartItem)

  // GA4
  if (isAnalyticsReady()) {
    window.gtag('event', 'begin_checkout', {
      currency: CURRENCY,
      value,
      coupon,
      items: formattedItems,
    })
  }

  // Meta Pixel
  if (isPixelReady()) {
    window.fbq('track', 'InitiateCheckout', {
      content_ids: items.map((i) => i.productId),
      value,
      currency: CURRENCY,
      num_items: items.reduce((sum, i) => sum + i.quantity, 0),
    })
  }
}

/**
 * Track add_shipping_info
 */
export function trackAddShippingInfo(
  items: CartItem[],
  value: number,
  shippingTier: string
) {
  if (!isAnalyticsReady()) return

  window.gtag('event', 'add_shipping_info', {
    currency: CURRENCY,
    value,
    shipping_tier: shippingTier,
    items: items.map(formatCartItem),
  })
}

/**
 * Track add_payment_info
 */
export function trackAddPaymentInfo(
  items: CartItem[],
  value: number,
  paymentType: string
) {
  // GA4
  if (isAnalyticsReady()) {
    window.gtag('event', 'add_payment_info', {
      currency: CURRENCY,
      value,
      payment_type: paymentType,
      items: items.map(formatCartItem),
    })
  }

  // Meta Pixel
  if (isPixelReady()) {
    window.fbq('track', 'AddPaymentInfo', {
      value,
      currency: CURRENCY,
    })
  }
}

/**
 * Track purchase - MOST IMPORTANT EVENT
 */
export function trackPurchase(order: {
  id: string
  items: CartItem[]
  value: number
  tax: number
  shipping: number
  coupon?: string
}) {
  const { id, items, value, tax, shipping, coupon } = order
  const formattedItems = items.map(formatCartItem)

  // GA4
  if (isAnalyticsReady()) {
    window.gtag('event', 'purchase', {
      transaction_id: id,
      value,
      tax,
      shipping,
      currency: CURRENCY,
      coupon,
      items: formattedItems,
    })
  }

  // Meta Pixel
  if (isPixelReady()) {
    window.fbq('track', 'Purchase', {
      content_ids: items.map((i) => i.productId),
      content_type: 'product',
      value,
      currency: CURRENCY,
      num_items: items.reduce((sum, i) => sum + i.quantity, 0),
    })
  }

  // Google Ads Conversion
  if (isAnalyticsReady() && GADS_ID && GADS_CONVERSION_LABEL) {
    window.gtag('event', 'conversion', {
      send_to: `${GADS_ID}/${GADS_CONVERSION_LABEL}`,
      value,
      currency: CURRENCY,
      transaction_id: id,
    })
  }
}

// ============================================
// CUSTOM EVENTS
// ============================================

/**
 * Track newsletter signup
 */
export function trackNewsletterSignup(source: string) {
  // GA4
  if (isAnalyticsReady()) {
    window.gtag('event', 'newsletter_signup', {
      source,
    })
  }

  // Meta Pixel
  if (isPixelReady()) {
    window.fbq('track', 'Lead', {
      content_name: 'Newsletter',
      content_category: source,
    })
  }
}

/**
 * Track size guide view
 */
export function trackSizeGuideView(productId: string, category: string) {
  if (!isAnalyticsReady()) return

  window.gtag('event', 'view_size_guide', {
    product_id: productId,
    category,
  })
}

/**
 * Track search
 */
export function trackSearch(searchTerm: string, resultsCount: number) {
  if (!isAnalyticsReady()) return

  window.gtag('event', 'search', {
    search_term: searchTerm,
    results_count: resultsCount,
  })
}

/**
 * Track filter usage
 */
export function trackFilterApply(filterType: string, filterValue: string) {
  if (!isAnalyticsReady()) return

  window.gtag('event', 'filter_apply', {
    filter_type: filterType,
    filter_value: filterValue,
  })
}

/**
 * Track lookbook interaction
 */
export function trackLookbookClick(imageId: string, productSlug: string) {
  if (!isAnalyticsReady()) return

  window.gtag('event', 'lookbook_click', {
    image_id: imageId,
    product_slug: productSlug,
  })
}

// ============================================
// DEBUG MODE
// ============================================

/**
 * Enable debug mode in development
 */
export function enableDebugMode() {
  if (process.env.NODE_ENV === 'development' && isAnalyticsReady()) {
    window.gtag('config', GA_ID, { debug_mode: true })
    console.log('[Analytics] Debug mode enabled')
  }
}
