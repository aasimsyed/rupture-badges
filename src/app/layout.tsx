import { Inter } from 'next/font/google'
import '../styles/globals.css'

// Prevent Cloudinary's SDK from trying to use Node.js specific features in the browser
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.process = {
    ...window.process,
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

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Punk Rock Badge Gallery',
  description: 'A collection of vintage punk rock badges',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
} 