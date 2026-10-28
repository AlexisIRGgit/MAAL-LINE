import { Mail } from 'lucide-react'
import { Navbar } from '@/components/navigation/navbar'
import { PromoBar } from '@/components/navigation/promo-bar'
import { Footer } from '@/components/navigation/footer'
import { CONTACT_EMAIL } from '@/lib/site'
import { HelpTabs } from '@/components/info/help-tabs'


/** Shared shell for the help and legal pages: header, readable column, help nav and contact card */
export function InfoPage({
  eyebrow,
  title,
  intro,
  updated,
  current,
  children,
}: {
  eyebrow: string
  title: string
  intro?: string
  /** Shown as "Última actualización" on legal pages */
  updated?: string
  /** href of this page, highlighted in the help nav */
  current: string
  children: React.ReactNode
}) {
  return (
    <>
      <PromoBar />
      <Navbar />

      <main className="bg-[#F9FAFB] min-h-screen">
        <section className="border-b border-[#E5E7EB] bg-white">
          <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FF3D00]">{eyebrow}</p>
            <h1 className="mt-3 font-display text-3xl md:text-5xl font-bold tracking-tight text-[#111827]">{title}</h1>
            {intro && <p className="mt-4 text-base md:text-lg leading-relaxed text-[#6B7280]">{intro}</p>}
            {updated && <p className="mt-4 text-xs text-[#9CA3AF]">Última actualización: {updated}</p>}
          </div>
        </section>

        <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
          <div className="mb-10">
            <HelpTabs current={current} />
          </div>

          <div className="space-y-10">{children}</div>

          <aside className="mt-14 rounded-[2rem] border border-[#E5E7EB] bg-white p-6 md:p-8 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-2xl bg-[#111827] text-white">
              <Mail className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-[#111827]">¿Te quedó alguna duda?</p>
              <p className="text-sm text-[#6B7280]">
                Escríbenos y te respondemos en días hábiles. Soporte, pedidos y contacto en general.
              </p>
            </div>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex flex-shrink-0 items-center justify-center rounded-xl bg-[#111827] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1F2937] transition-colors break-all"
            >
              {CONTACT_EMAIL}
            </a>
          </aside>
        </div>
      </main>

      <Footer />
    </>
  )
}

/** A titled block of body copy inside an InfoPage */
export function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-lg md:text-xl font-semibold text-[#111827] mb-3">{title}</h2>
      <div className="space-y-3 text-sm md:text-[15px] leading-relaxed text-[#374151] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:text-[#111827] [&_a]:text-[#111827] [&_a]:underline [&_a]:underline-offset-2 dark:[&_strong]:text-[#F5F5F5] dark:[&_a]:text-[#F5F5F5]">
        {children}
      </div>
    </section>
  )
}
