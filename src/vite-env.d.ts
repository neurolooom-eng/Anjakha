/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHEETS_API_URL?: string
  readonly VITE_SHEETS_SPREADSHEET_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const __BUILD_ID__: string
declare const __BUILD_DATE__: string
