import { revalidatePath } from 'next/cache'

/**
 * The homepage is a cached copy (app/page.tsx), so anything that changes its products or stock
 * must call this. Never throws: a payment webhook that fails here would be retried and
 * discount the stock again.
 */
export function refreshHome() {
  try {
    revalidatePath('/')
  } catch (error) {
    console.error('Could not refresh the homepage:', error)
  }
}
