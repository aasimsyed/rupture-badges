import '@/styles/globals.css'
import type { AppProps } from 'next/app'

// Prevent Cloudinary's SDK from trying to use Node.js specific features in the browser
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.process = {
    ...window.process,
    // Provide all potentially required Node.js properties
    node: false,
    version: '',
    versions: {},
    env: { 
      BROWSER: true,
      NODE_ENV: process.env.NODE_ENV 
    },
    platform: 'browser',
    release: undefined,
  }
}

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
} 