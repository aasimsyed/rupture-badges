import '@/styles/globals.css'
import type { AppProps } from 'next/app'

// Prevent Cloudinary's SDK from trying to use Node.js specific features in the browser
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.process = {
    ...window.process,
    // Provide all potentially required Node.js properties
    versions: {
      node: '0.0.0',
      http_parser: '0.0.0',
      v8: '0.0.0',
      ares: '0.0.0',
      uv: '0.0.0',
      zlib: '0.0.0',
      modules: '0.0.0',
      openssl: '0.0.0'
    },
    env: { 
      BROWSER: 'true',
      NODE_ENV: process.env.NODE_ENV 
    },
    platform: 'browser' as NodeJS.Platform,
    release: {
      name: 'node',
      sourceUrl: '',
      headersUrl: '',
      libUrl: '',
      lts: 'false',
    },
  }
}

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
} 