import { sileo } from 'sileo'

// Dark fill color for the toast background
const DARK_FILL = '#1F2937'

export const toast = {
  /** `duration` in ms; omit for Sileo's default */
  success: (title: string, description?: string, duration?: number) => {
    sileo.success({ title, description, fill: DARK_FILL, ...(duration ? { duration } : {}) })
  },

  error: (title: string, description?: string, duration?: number) => {
    sileo.error({ title, description, fill: DARK_FILL, ...(duration ? { duration } : {}) })
  },

  warning: (title: string, description?: string) => {
    sileo.warning({ title, description, fill: DARK_FILL })
  },

  info: (title: string, description?: string) => {
    sileo.info({ title, description, fill: DARK_FILL })
  },

  action: (title: string, buttonText: string, onClick: () => void, description?: string) => {
    sileo.action({
      title,
      description,
      fill: DARK_FILL,
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
      success: { title: messages.success, fill: DARK_FILL },
      error: { title: messages.error, fill: DARK_FILL },
    })
  },
}

// Also export sileo directly for advanced usage
export { sileo }
