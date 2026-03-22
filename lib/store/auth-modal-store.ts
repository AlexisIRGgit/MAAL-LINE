import { create } from 'zustand'

type AuthModalView = 'login' | 'register'

interface AuthModalState {
  isOpen: boolean
  view: AuthModalView
}

interface AuthModalActions {
  openAuthModal: (view?: AuthModalView) => void
  closeAuthModal: () => void
  switchView: (view: AuthModalView) => void
}

type AuthModalStore = AuthModalState & AuthModalActions

export const useAuthModalStore = create<AuthModalStore>((set) => ({
  isOpen: false,
  view: 'login',

  openAuthModal: (view = 'login') => {
    set({ isOpen: true, view })
  },

  closeAuthModal: () => {
    set({ isOpen: false })
  },

  switchView: (view) => {
    set({ view })
  },
}))
