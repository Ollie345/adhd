import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ADHD Assessment',
  description: 'This screening tool can help identify potential developmental concerns in behavioral, cognitive, motor, and language areas.',
  generator: 'LifeLine',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
