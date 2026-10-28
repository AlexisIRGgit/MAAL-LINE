import { Navbar } from '@/components/navigation/navbar'
import { PromoBar } from '@/components/navigation/promo-bar'
import { Footer } from '@/components/navigation/footer'
import { HelpShell } from '@/components/info/help-shell'
import { ContactCard } from '@/components/info/info-page'

/** Shared by /envios, /faq, /terminos and /privacidad so switching tabs only swaps the page body */
export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PromoBar />
      <Navbar />
      <main className="bg-[#F9FAFB] min-h-screen">
        <HelpShell>{children}</HelpShell>
        <div className="container mx-auto px-4 pb-12 md:pb-16 max-w-3xl">
          <ContactCard />
        </div>
      </main>
      <Footer />
    </>
  )
}
