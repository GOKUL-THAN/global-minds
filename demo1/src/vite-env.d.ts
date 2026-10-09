/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_APP_URL: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_RAZORPAY_KEY: string
  readonly VITE_STRIPE_PUBLIC_KEY: string
  readonly VITE_PAYPAL_CLIENT_ID: string
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_GA_MEASUREMENT_ID: string
  readonly VITE_GTM_ID: string
  readonly VITE_ENABLE_CHAT: string
  readonly VITE_ENABLE_PAYMENTS: string
  readonly VITE_ENABLE_GOOGLE_LOGIN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
