export default function Loading() {
  return (
    <div role="status" aria-label="Cargando El Mercadito" className="min-h-screen bg-white">
      <div className="h-20 border-b border-[#E5E7EB]" />
      <div className="container mx-auto grid grid-cols-2 gap-4 px-4 py-12 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {[0, 1, 2, 3].map((card) => (
          <div key={card} className="aspect-[3/4] animate-pulse rounded-[1.5rem] bg-[#FFF1F7]" />
        ))}
      </div>
    </div>
  )
}
