import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Logo } from '@/components/common/logo'
import { CONTACT_EMAIL, SOCIAL_LINKS } from '@/lib/site'

// Minimal footer (after uiarc's site-footer "Minimal"): one card, links on top, status and socials below
const FOOTER_LINKS = [
  { href: '/coleccion', label: 'Equipo' },
  { href: '/drop', label: 'Drop 001' },
  { href: '/about', label: 'Nosotros' },
  { href: '/envios', label: 'Envíos' },
  { href: '/faq', label: 'FAQ' },
  { href: '/terminos', label: 'Términos' },
  { href: '/privacidad', label: 'Privacidad' },
]

const EXTERNAL_LINKS = [
  { href: SOCIAL_LINKS.instagram, label: 'Instagram' },
  { href: SOCIAL_LINKS.tiktok, label: 'TikTok' },
]

export function Footer() {
  return (
    <footer className="bg-[#F9FAFB] px-4 pb-6 pt-10">
      <div className="container mx-auto rounded-[1.75rem] border border-[#E5E7EB] bg-white px-6 py-6 md:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <Link href="/" aria-label="MAAL LINE, inicio" className="inline-flex w-fit">
            <Logo size="xs" />
          </Link>
          <nav aria-label="Pie de página" className="flex flex-wrap gap-x-5 gap-y-2">
            {FOOTER_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} className="text-sm text-[#6B7280] transition-colors hover:text-[#111827]">
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-5 flex flex-col gap-4 border-t border-[#E5E7EB] pt-5 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-[#9CA3AF]">
            © {new Date().getFullYear()} MAAL LINE. Performance gear desde Guadalajara.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-2 text-[#374151]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Envíos activos
            </span>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#6B7280] transition-colors hover:text-[#111827]">
              {CONTACT_EMAIL}
            </a>
            {EXTERNAL_LINKS.map(({ href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-0.5 text-[#6B7280] transition-colors hover:text-[#111827]"
              >
                {label}
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
