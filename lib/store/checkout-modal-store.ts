import { create } from 'zustand'
import type { DiscountRule } from '@/lib/discounts'
import type { PaymentProvider, PaymentSettings, ShippingSettings } from '@/lib/store-settings'

export interface AddressData {
  id: string
  fullName: string
  phone: string | null
  streetLine1: string
  streetLine2: string | null
  neighborhood: string | null
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
  /** Pin saved by the address wizard; null for older addresses */
  latitude?: number | null
  longitude?: number | null
}

/** Address typed in the modal: the Google pick plus who receives it. Guests always use this. */
export interface InlineAddress {
  fullName: string
  /** 10 digits, no spaces */
  phone: string
  streetLine1: string
  neighborhood: string
  city: string
  state: string
  postalCode: string
  latitude: number | null
  longitude: number | null
  formattedAddress: string
}

export const EMPTY_INLINE_ADDRESS: InlineAddress = {
  fullName: '',
  phone: '',
  streetLine1: '',
  neighborhood: '',
  city: '',
  state: '',
  postalCode: '',
  latitude: null,
  longitude: null,
  formattedAddress: '',
}

export type PublicShipping = Pick<ShippingSettings, 'freeShippingThreshold' | 'methods'>

interface CheckoutModalState {
  isOpen: boolean
  currentStep: 0 | 1 | 2
  completedSteps: Set<number>

  // Store settings, loaded once when the modal opens
  shipping: PublicShipping | null
  payments: PaymentSettings | null

  // Data collected across steps
  /** A saved address (signed-in customers), or null to use `inlineAddress` */
  selectedAddressId: string | null
  selectedAddress: AddressData | null
  inlineAddress: InlineAddress
  shippingMethod: string | null
  paymentMethod: PaymentProvider | null
  /** Cart lines (productId:size) left out of this purchase with their checkbox */
  excludedKeys: string[]
  discount: DiscountRule | null
}

interface CheckoutModalActions {
  openCheckoutModal: () => void
  closeCheckoutModal: () => void
  setStep: (step: 0 | 1 | 2) => void
  nextStep: () => void
  prevStep: () => void
  completeStep: (step: number) => void
  setSettings: (shipping: PublicShipping, payments: PaymentSettings) => void
  setSelectedAddress: (id: string | null, address: AddressData | null) => void
  setInlineAddress: (patch: Partial<InlineAddress>) => void
  setShippingMethod: (method: string) => void
  setPaymentMethod: (method: PaymentProvider) => void
  toggleExcluded: (key: string, excluded: boolean) => void
  setDiscount: (discount: DiscountRule | null) => void
  resetCheckout: () => void
}

type CheckoutModalStore = CheckoutModalState & CheckoutModalActions

export const cartLineKey = (productId: string, size: string) => `${productId}:${size}`

const initialState: CheckoutModalState = {
  isOpen: false,
  currentStep: 0,
  completedSteps: new Set<number>(),
  shipping: null,
  payments: null,
  selectedAddressId: null,
  selectedAddress: null,
  inlineAddress: EMPTY_INLINE_ADDRESS,
  shippingMethod: null,
  paymentMethod: null,
  excludedKeys: [],
  discount: null,
}

export const useCheckoutModalStore = create<CheckoutModalStore>((set, get) => ({
  ...initialState,

  openCheckoutModal: () => set({ isOpen: true }),

  // Closing goes back to the first step but keeps what the customer typed (address, coupon)
  closeCheckoutModal: () => set({ isOpen: false, currentStep: 0, completedSteps: new Set<number>() }),

  setStep: (step) => set({ currentStep: step }),

  nextStep: () => {
    const { currentStep } = get()
    if (currentStep < 2) set({ currentStep: (currentStep + 1) as 0 | 1 | 2 })
  },

  prevStep: () => {
    const { currentStep } = get()
    if (currentStep > 0) set({ currentStep: (currentStep - 1) as 0 | 1 | 2 })
  },

  completeStep: (step) => {
    const completedSteps = new Set(get().completedSteps)
    completedSteps.add(step)
    set({ completedSteps })
  },

  setSettings: (shipping, payments) => {
    const { shippingMethod, paymentMethod } = get()
    set({
      shipping,
      payments,
      // Keep earlier choices only while they are still offered
      shippingMethod: shipping.methods.some((m) => m.id === shippingMethod) ? shippingMethod : shipping.methods[0]?.id ?? null,
      paymentMethod: paymentMethod && payments[paymentMethod] ? paymentMethod : payments.stripe ? 'stripe' : payments.mercadopago ? 'mercadopago' : null,
    })
  },

  setSelectedAddress: (id, address) => set({ selectedAddressId: id, selectedAddress: address }),

  setInlineAddress: (patch) => set({ inlineAddress: { ...get().inlineAddress, ...patch } }),

  setShippingMethod: (method) => set({ shippingMethod: method }),

  setPaymentMethod: (method) => set({ paymentMethod: method }),

  toggleExcluded: (key, excluded) => {
    const rest = get().excludedKeys.filter((k) => k !== key)
    set({ excludedKeys: excluded ? [...rest, key] : rest })
  },

  setDiscount: (discount) => set({ discount }),

  resetCheckout: () => set({ ...initialState }),
}))
