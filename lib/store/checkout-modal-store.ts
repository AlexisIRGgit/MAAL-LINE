import { create } from 'zustand'

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
}

interface CheckoutModalState {
  isOpen: boolean
  currentStep: 0 | 1 | 2
  completedSteps: Set<number>

  // Data collected across steps
  selectedAddressId: string | null
  selectedAddress: AddressData | null
  shippingMethod: string | null
  shippingCost: number
}

interface CheckoutModalActions {
  openCheckoutModal: () => void
  closeCheckoutModal: () => void
  setStep: (step: 0 | 1 | 2) => void
  nextStep: () => void
  prevStep: () => void
  completeStep: (step: number) => void
  setSelectedAddress: (id: string, address: AddressData) => void
  setShippingMethod: (method: string, cost: number) => void
  resetCheckout: () => void
}

type CheckoutModalStore = CheckoutModalState & CheckoutModalActions

const initialState: CheckoutModalState = {
  isOpen: false,
  currentStep: 0,
  completedSteps: new Set<number>(),
  selectedAddressId: null,
  selectedAddress: null,
  shippingMethod: null,
  shippingCost: 0,
}

export const useCheckoutModalStore = create<CheckoutModalStore>((set, get) => ({
  ...initialState,

  openCheckoutModal: () => {
    set({ isOpen: true })
  },

  closeCheckoutModal: () => {
    // Reset all state when modal closes
    set({ ...initialState })
  },

  setStep: (step) => {
    set({ currentStep: step })
  },

  nextStep: () => {
    const { currentStep } = get()
    if (currentStep < 2) {
      set({ currentStep: (currentStep + 1) as 0 | 1 | 2 })
    }
  },

  prevStep: () => {
    const { currentStep } = get()
    if (currentStep > 0) {
      set({ currentStep: (currentStep - 1) as 0 | 1 | 2 })
    }
  },

  completeStep: (step) => {
    const { completedSteps } = get()
    const newCompleted = new Set(completedSteps)
    newCompleted.add(step)
    set({ completedSteps: newCompleted })
  },

  setSelectedAddress: (id, address) => {
    set({ selectedAddressId: id, selectedAddress: address })
  },

  setShippingMethod: (method, cost) => {
    set({ shippingMethod: method, shippingCost: cost })
  },

  resetCheckout: () => {
    set({ ...initialState })
  },
}))
