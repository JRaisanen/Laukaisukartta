/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string;
  readonly TESTI_BASE: string;
  // Lisää muut ympäristömuuttujat tähän
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}