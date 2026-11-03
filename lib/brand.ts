// El Mercadito by MAAL: a sub-store with its own look, sharing products, cart, checkout and accounts with MAAL LINE.

export type Brand = 'maal' | 'mercadito'

export const MERCADITO_PATH = '/elmercadito'
/** Product tag that places a product in El Mercadito instead of MAAL LINE */
export const MERCADITO_TAG = 'mercadito'
export const BRAND_STORAGE_KEY = 'maal-brand'

/** What a Mercadito product is; stored as a tag and used by the store's menu and filters */
export const MERCADITO_TYPES = [
  { tag: 'ropa', label: 'Ropa' },
  { tag: 'camisa', label: 'Camisas' },
  { tag: 'hoodie', label: 'Hoodies' },
] as const

// These pages belong to both stores, so they keep the look of the store the visitor came from
const SHARED_PATHS = ['/cuenta', '/rastrear', '/checkout', '/login', '/register', '/wishlist', '/envios', '/faq', '/terminos', '/privacidad']

const matches = (pathname: string, base: string) => pathname === base || pathname.startsWith(`${base}/`)

export const isMercaditoPath = (pathname: string) => matches(pathname, MERCADITO_PATH)
export const isSharedPath = (pathname: string) => SHARED_PATHS.some((base) => matches(pathname, base))

export function brandForPath(pathname: string, stored: Brand): Brand {
  if (isMercaditoPath(pathname)) return 'mercadito'
  return isSharedPath(pathname) ? stored : 'maal'
}

export const isMercaditoProduct = (tags: string[] | null | undefined) => !!tags?.includes(MERCADITO_TAG)

export const brandHome = (brand: Brand) => (brand === 'mercadito' ? MERCADITO_PATH : '/')
export const productPath = (slug: string, brand: Brand) => (brand === 'mercadito' ? `${MERCADITO_PATH}/producto/${slug}` : `/producto/${slug}`)

/**
 * Runs before the first paint so a reload never flashes the wrong store. Mirrors brandForPath and
 * also forces the light theme, because El Mercadito is always white.
 */
export const BRAND_INIT_SCRIPT = `(function(){try{
var p=location.pathname,m=function(b){return p===b||p.indexOf(b+'/')===0},s=${JSON.stringify(SHARED_PATHS)};
var k=${JSON.stringify(BRAND_STORAGE_KEY)},mc=${JSON.stringify(MERCADITO_PATH)},b;
if(m(mc)){b='mercadito';localStorage.setItem(k,b)}
else if(s.some(m)){b=localStorage.getItem(k)==='mercadito'?'mercadito':'maal'}
else{b='maal';if(!m('/admin'))localStorage.removeItem(k)}
var r=document.documentElement;
if(b==='mercadito'){r.dataset.brand=b;r.classList.remove('dark');r.classList.add('light');r.style.colorScheme='light'}
}catch(e){}})()`
