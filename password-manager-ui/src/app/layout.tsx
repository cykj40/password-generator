'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-900">
      <body className="h-full">
        <ClerkProvider
          appearance={{
            baseTheme: dark,
            variables: {
              colorPrimary: '#3b82f6',
              colorBackground: '#111827',
              colorInputBackground: '#1f2937',
              colorText: '#f3f4f6',
              colorTextSecondary: '#9ca3af',
            },
            elements: {
              card: 'bg-gray-800 border border-gray-700',
              navbar: 'bg-gray-800',
              headerTitle: 'text-white',
              headerSubtitle: 'text-gray-400',
              socialButtonsBlockButton: 'bg-gray-700 hover:bg-gray-600',
              socialButtonsBlockButtonText: 'text-white',
              dividerLine: 'bg-gray-700',
              dividerText: 'text-gray-400',
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-500',
              formButtonReset: 'hover:bg-gray-700',
              footerActionLink: 'text-blue-400 hover:text-blue-300',
              identityPreviewText: 'text-white',
              identityPreviewEditButton: 'text-blue-400 hover:text-blue-300',
            },
          }}
        >
          <div className="min-h-screen bg-gray-900">
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: '#1f2937',
                  color: '#f3f4f6',
                  borderRadius: '0.5rem',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#f3f4f6',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#f3f4f6',
                  },
                },
              }}
            />
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}
