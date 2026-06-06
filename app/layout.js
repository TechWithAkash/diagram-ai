import { Poppins, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  weight: ['400', '500'],
})

export const metadata = {
  title: 'DiagramAI — AI-Powered Technical Diagram Generator',
  description: 'Generate clean, professional technical diagrams for any engineering subject instantly. Powered by Groq AI and Mermaid.js.',
  keywords: 'diagram generator, AI diagrams, technical diagrams, flowchart, ER diagram, MCC, engineering',
  openGraph: {
    title: 'DiagramAI',
    description: 'AI-powered technical diagram generator for engineering students',
    type: 'website',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.variable} ${jetbrains.variable}`}>
      <body className="font-display antialiased">{children}</body>
    </html>
  )
}
