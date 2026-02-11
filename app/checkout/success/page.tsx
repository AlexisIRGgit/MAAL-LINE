'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle, Package, ArrowRight, Mail, Loader2 } from 'lucide-react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order')

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-[#E8E4D9] mb-2"
        >
          ¡Pedido Confirmado!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-[#E8E4D9]/60 mb-6"
        >
          Gracias por tu compra. Tu pedido ha sido recibido.
        </motion.p>

        {/* Order Number */}
        {orderNumber && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-4 bg-[#E8E4D9]/5 border border-[#E8E4D9]/20 rounded-xl mb-6"
          >
            <p className="text-xs text-[#E8E4D9]/50 mb-1">Número de Pedido</p>
            <p className="text-lg font-mono font-bold text-[#E8E4D9]">{orderNumber}</p>
          </motion.div>
        )}

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4 mb-8"
        >
          <div className="flex items-center gap-3 p-3 bg-[#E8E4D9]/5 rounded-lg text-left">
            <Mail className="w-5 h-5 text-[#C9A962]" />
            <p className="text-sm text-[#E8E4D9]/60">
              Recibirás un correo de confirmación con los detalles de tu pedido.
            </p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-[#E8E4D9]/5 rounded-lg text-left">
            <Package className="w-5 h-5 text-[#C9A962]" />
            <p className="text-sm text-[#E8E4D9]/60">
              Te notificaremos cuando tu pedido sea enviado.
            </p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-3"
        >
          <Link
            href="/cuenta/pedidos"
            className="w-full py-4 bg-[#E8E4D9] text-[#0A0A0A] font-bold tracking-wider hover:bg-[#C9A962] transition-colors flex items-center justify-center gap-2"
          >
            VER MIS PEDIDOS
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="block w-full py-4 border border-[#E8E4D9]/30 text-[#E8E4D9] font-bold tracking-wider hover:bg-[#E8E4D9]/10 transition-colors"
          >
            SEGUIR COMPRANDO
          </Link>
        </motion.div>

        {/* Support */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-xs text-[#E8E4D9]/40 mt-8"
        >
          ¿Tienes preguntas?{' '}
          <Link href="/contacto" className="text-[#C9A962] hover:underline">
            Contáctanos
          </Link>
        </motion.p>
      </motion.div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#E8E4D9]" />
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuccessContent />
    </Suspense>
  )
}
