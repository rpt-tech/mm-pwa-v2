/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAGENTO_URL: string;
  readonly VITE_FACEBOOK_APP_ID: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_RECAPTCHA_SITE_KEY: string;
  readonly VITE_GA4_ID: string;
  readonly VITE_GTM_ID: string;
  readonly VITE_GOONG_KEY: string;
  readonly VITE_AI_SEARCH_URL: string;
  readonly VITE_AI_SEARCH_KEY: string;
  readonly VITE_ANTSOMI_SDK_KEY: string;
  readonly VITE_FRESHCHAT_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
