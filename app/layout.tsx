import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NITRON FLOW - Sistema de Gestão Integrado',
  description: 'Sistema de gestão integrado para gestão empresarial e pessoal',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  )
}

