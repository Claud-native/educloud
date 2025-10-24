/// <reference types="vite/client" />

interface ImportMetaEnv {
  // API Configuration
  readonly VITE_API_BASE_URL: string;

  // Security - RSA Public Key
  readonly VITE_RSA_PUBLIC_KEY: string;

  // Security - AES Encryption
  readonly VITE_AES_SECRET_KEY: string;

  // Application Configuration
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production';

  // Features Flags
  readonly VITE_ENABLE_HEALTH_CHECK: string;
  readonly VITE_DEBUG_MODE: string;
  readonly VITE_ENABLE_GOOGLE_AUTH: string;
  readonly VITE_ENABLE_GITHUB_AUTH: string;

  // Analytics & Monitoring
  readonly VITE_GA_TRACKING_ID: string;
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_LOGROCKET_APP_ID: string;

  // CDN & Assets
  readonly VITE_CDN_URL: string;
  readonly VITE_IMAGES_BASE_URL: string;

  // Timeouts & Limits
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_HEALTH_CHECK_TIMEOUT: string;
  readonly VITE_TOKEN_REFRESH_INTERVAL: string;

  // Build Configuration
  readonly VITE_PORT: string;
  readonly VITE_HOST: string;
  readonly VITE_SOURCEMAP: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
