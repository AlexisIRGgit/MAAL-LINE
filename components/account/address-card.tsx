'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion, type Transition } from 'framer-motion'
import { Home, Building2, MapPin, Edit2, Trash2, Star, Truck, Plus, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface Address {
  id: string
  type: 'home' | 'work' | 'other'
  label: string
  fullName: string
  phone: string
  street: string
  number: string
  interior?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
  /** Pin chosen on the map, if any */
  latitude?: number | null
  longitude?: number | null
}

const typeIcons: Record<Address['type'], LucideIcon> = {
  home: Home,
  work: Building2,
  other: MapPin,
}

const pressSpring: Transition = { type: 'spring', stiffness: 500, damping: 30, mass: 0.6 }
const easeOut = [0.16, 1, 0.3, 1] as const

function CardAction({
  icon: Icon,
  label,
  onClick,
  tone = 'default',
}: {
  icon: LucideIcon
  label: string
  onClick: () => void
  tone?: 'default' | 'danger'
}) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      whileTap={reduceMotion ? undefined : { scale: 0.94 }}
      transition={pressSpring}
      className={cn(
        'h-7 w-7 flex items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors',
        tone === 'danger'
          ? 'text-white/60 hover:text-red-400 hover:bg-red-500/15 hover:border-red-500/30'
          : 'text-white/60 hover:text-white hover:bg-white/10'
      )}
    >
      <Icon className="w-3.5 h-3.5" />
    </motion.button>
  )
}

export function AddressCard({
  address,
  isDeleteConfirmOpen,
  deleteMessage,
  onEdit,
  onSetDefault,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: {
  address: Address
  isDeleteConfirmOpen: boolean
  deleteMessage: string
  onEdit: () => void
  onSetDefault: () => void
  onRequestDelete: () => void
  onCancelDelete: () => void
  onConfirmDelete: () => void
}) {
  const reduceMotion = useReducedMotion()
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const TypeIcon = typeIcons[address.type] ?? MapPin

  // Spotlight follows the cursor through CSS variables, no re-renders
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    cardRef.current?.style.setProperty('--x', `${event.clientX - rect.left}px`)
    cardRef.current?.style.setProperty('--y', `${event.clientY - rect.top}px`)
  }

  return (
    <motion.div
      ref={cardRef}
      layout={!reduceMotion}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.4, ease: easeOut }}
      onMouseMove={handleMouseMove}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        'group relative flex flex-col min-w-0 overflow-hidden rounded-[20px] bg-gradient-to-br from-[#16181D] via-[#0E0F13] to-[#0A0A0A] p-4 text-white',
        'min-h-[180px] sm:min-h-0 sm:aspect-[1.75/1] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.45)]',
        address.isDefault ? 'ring-1 ring-[#FF3D00]/40' : 'dark:ring-1 dark:ring-white/10'
      )}
    >
      {/* Cursor spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'radial-gradient(200px circle at var(--x, 50%) var(--y, 50%), rgba(255,61,0,0.12), transparent 65%)' }}
      />
      {/* Inner dashed frame */}
      <div aria-hidden className="pointer-events-none absolute inset-1.5 rounded-[15px] border border-dashed border-white/[0.08]" />

      {/* Header */}
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={cn(
              'h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-xl border',
              address.isDefault
                ? 'bg-[#FF3D00]/15 border-[#FF3D00]/30 text-[#FF6B35] shadow-[0_0_16px_-4px_rgba(255,61,0,0.45)]'
                : 'bg-white/5 border-white/10 text-white/70'
            )}
          >
            <TypeIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-sm font-semibold leading-tight truncate">{address.label}</p>
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">Envío a</p>
          </div>
        </div>

        {address.isDefault ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FF3D00] text-[10px] font-bold">
            <Star className="w-2.5 h-2.5 fill-current" />
            Principal
          </span>
        ) : (
          <button
            type="button"
            onClick={onSetDefault}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-white/10 text-[10px] font-semibold text-white/60 hover:text-white hover:border-white/25 transition-colors"
          >
            <Star className="w-2.5 h-2.5" />
            Hacer principal
          </button>
        )}
      </div>

      {/* Street, displayed like the card number */}
      <div className="relative flex-1 flex flex-col justify-center py-2">
        <p className="font-display text-base font-semibold tracking-wide leading-tight truncate">
          {address.street} {address.number}
          {address.interior && <span className="text-white/50">, {address.interior}</span>}
        </p>
        <p className="text-xs text-white/50 truncate">
          {address.neighborhood && `${address.neighborhood} · `}
          {address.city}, {address.state}
        </p>
      </div>

      {/* Shipping route */}
      <div aria-hidden className="relative flex items-center gap-1.5 mb-2.5">
        <span className="h-1 w-1 rounded-full bg-white/40" />
        <div className="relative flex-1 h-3 flex items-center">
          <span className="w-full border-t border-dashed border-white/15" />
          <motion.span
            className="absolute top-1/2 -translate-y-1/2 text-[#FF6B35]"
            initial={false}
            animate={{ left: isHovered && !reduceMotion ? 'calc(100% - 12px)' : '0%' }}
            transition={{ duration: 0.9, ease: easeOut }}
          >
            <Truck className="w-3 h-3" />
          </motion.span>
        </div>
        <MapPin className={cn('w-3 h-3', address.isDefault ? 'text-[#FF6B35]' : 'text-white/40')} />
      </div>

      {/* Footer */}
      <div className="relative flex items-end justify-between gap-3">
        <div className="flex gap-4 min-w-0">
          <div className="min-w-0">
            <p className="text-[8px] uppercase tracking-[0.2em] text-white/40">Destinatario</p>
            <p className="text-xs font-medium truncate">{address.fullName}</p>
            {address.phone && <p className="text-[10px] text-white/50 tabular-nums truncate">{address.phone}</p>}
          </div>
          <div className="flex-shrink-0">
            <p className="text-[8px] uppercase tracking-[0.2em] text-white/40">C.P.</p>
            <p className="text-xs font-medium font-mono tabular-nums">{address.zipCode}</p>
          </div>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <CardAction icon={Edit2} label="Editar" onClick={onEdit} />
          <CardAction icon={Trash2} label="Eliminar" onClick={onRequestDelete} tone="danger" />
        </div>
      </div>

      {/* Delete confirmation */}
      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: easeOut }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2.5 p-4 bg-[#0A0A0A]/85 backdrop-blur-md text-center"
          >
            <motion.div
              initial={reduceMotion ? false : { y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.25, delay: 0.05, ease: easeOut }}
              className="flex flex-col items-center gap-2.5"
            >
              <div className="h-8 w-8 flex items-center justify-center rounded-xl bg-red-500/15 border border-red-500/30 text-red-400">
                <Trash2 className="w-4 h-4" />
              </div>
              <p className="text-xs text-white/80 max-w-[220px]">{deleteMessage}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onCancelDelete}
                  className="px-3 py-1.5 text-xs text-white/70 hover:text-white rounded-full border border-white/10 hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={onConfirmDelete}
                  className="px-3 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function AddAddressCard({ onClick, isFirst = false }: { onClick: () => void; isFirst?: boolean }) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.button
      type="button"
      layout={!reduceMotion}
      onClick={onClick}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.4, ease: easeOut }}
      className="group relative flex flex-col min-w-0 text-left rounded-[20px] border border-dashed border-[#D1D5DB] hover:border-[#9CA3AF] bg-white/60 hover:bg-white p-4 min-h-[180px] sm:min-h-0 sm:aspect-[1.75/1] transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 flex items-center justify-center rounded-xl bg-[#FF3D00]/10 border border-[#FF3D00]/20 text-[#FF3D00] transition-shadow group-hover:shadow-[0_0_16px_-4px_rgba(255,61,0,0.45)]">
          <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
        </div>
        <div>
          <p className="font-display text-sm font-semibold leading-tight text-[#111827]">
            {isFirst ? 'Agrega tu primera dirección' : 'Nueva dirección'}
          </p>
          <p className="text-[11px] text-[#6B7280]">
            {isFirst ? 'La usaremos para tus envíos' : 'Envía a otro lugar'}
          </p>
        </div>
      </div>

      {/* Skeleton placeholder, echoing a filled card */}
      <div aria-hidden className="flex-1 flex flex-col justify-center gap-2 py-2">
        <span className="h-2 w-2/5 rounded-full bg-[#E5E7EB] transition-colors group-hover:bg-[#D1D5DB]" />
        <span className="text-[#D1D5DB] tracking-[0.35em] text-xs leading-none">••• •••</span>
      </div>
      <div aria-hidden className="flex gap-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className="h-4 w-4 rounded-full bg-[#F3F4F6] transition-colors duration-300 group-hover:bg-[#E5E7EB]"
            style={{ transitionDelay: `${i * 40}ms` }}
          />
        ))}
      </div>
    </motion.button>
  )
}
