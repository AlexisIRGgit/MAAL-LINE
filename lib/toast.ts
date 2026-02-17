import { toast as sonnerToast } from 'sonner'

export const toast = {
  success: (title: string, description?: string) => {
    sonnerToast.success(title, { description })
  },

  error: (title: string, description?: string) => {
    sonnerToast.error(title, { description })
  },

  warning: (title: string, description?: string) => {
    sonnerToast.warning(title, { description })
  },

  info: (title: string, description?: string) => {
    sonnerToast.info(title, { description })
  },

  action: (title: string, buttonText: string, onClick: () => void, description?: string) => {
    sonnerToast(title, {
      description,
      action: {
        label: buttonText,
        onClick,
      },
    })
  },

  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    })
  },
}

// Also export sonner directly for advanced usage
export { sonnerToast }
