import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NITRON FLOW - Sistema de Gestão Integrado',
  description: 'Cresça. Automatize. Prospere. Sistema de gestão integrado para gestão empresarial e pessoal',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
    ],
    apple: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}


