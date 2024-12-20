import '@/app/globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Service Status',
  description: 'Monitor your service uptime and incidents',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark text-black">
      <body className={inter.className}>{children}</body>
    </html>
  )
}