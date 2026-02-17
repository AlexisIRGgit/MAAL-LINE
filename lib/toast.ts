import { sileo } from 'sileo'

export const toast = {
  success: (title: string, description?: string) => {
    sileo.success({ title, description })
  },

  error: (title: string, description?: string) => {
    sileo.error({ title, description })
  },

  warning: (title: string, description?: string) => {
    sileo.warning({ title, description })
  },

  info: (title: string, description?: string) => {
    sileo.info({ title, description })
  },

  action: (title: string, buttonText: string, onClick: () => void, description?: string) => {
    sileo.action({
      title,
      description,
      button: {
        title: buttonText,
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
    return sileo.promise(promise, {
      loading: { title: messages.loading },
      success: { title: messages.success },
      error: { title: messages.error },
    })
  },
}

// Also export sileo directly for advanced usage
export { sileo }
