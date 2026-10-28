/** Product videos are https URLs (Vercel Blob). Returns null to clear, undefined to leave unchanged, or an error. */
export function parseVideoUrl(input: unknown): { value: string | null | undefined } | { error: string } {
  if (input === undefined) return { value: undefined }
  if (input === null || input === '') return { value: null }
  if (typeof input !== 'string' || input.length > 2000) return { error: 'El link del video no es válido' }
  try {
    const url = new URL(input)
    if (url.protocol !== 'https:') return { error: 'El video debe estar en un link https' }
    return { value: url.toString() }
  } catch {
    return { error: 'El link del video no es válido' }
  }
}
