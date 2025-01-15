import React from 'react';
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Password Generator',
  description: 'A secure password generator with strength meter',
  manifest: '/manifest.json',
  icons: {
    apple: '/icon-512x512.png',
  },
}

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="h-full bg-gray-900">
      <body className={`${inter.className} min-h-screen bg-gray-900 text-white`}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1f2937',
              color: '#f3f4f6',
              borderRadius: '0.5rem',
            },
          }}
        />
      </body>
    </html>
  )
}
