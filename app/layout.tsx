import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import { Toaster } from "@/components/ui/toaster"
import { SessionProvider } from '../lib/session-provider';

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "虚拟歌姬分享平台",
  description: "分享和发现虚拟歌姬、声库、歌曲和教程",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>

          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1 p-16 py-6">{children}</main>
              <footer className="border-t py-6">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                  <p className="text-center text-sm text-muted-foreground md:text-left">
                    &copy; {new Date().getFullYear()} 虚拟歌姬分享平台. 保留所有权利.
                  </p>
                </div>
              </footer>
            </div>
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
