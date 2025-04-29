"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MicIcon, MenuIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { useSession } from "@/lib/session-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function Header() {
  const pathname = usePathname()
  const { session, signOut } = useSession()
  const [open, setOpen] = useState(false)

  const navigation = [
    { name: "首页", href: "/" },
    { name: "声库分区", href: "/voicebanks" },
    { name: "歌曲分区", href: "/songs" },
    { name: "教程分区", href: "/tutorials" },
    { name: "网址大全", href: "/websites" },
  ]

  // 修改Header组件，确保正确处理会话状态
  // 在Header组件中，添加一个useEffect来检查会话状态
  useEffect(() => {
    // 从localStorage加载会话
    const storedSession = localStorage.getItem("session")
    if (storedSession) {
      try {
        const sessionData = JSON.parse(storedSession)
        // 这里可以添加一些验证逻辑
      } catch (error) {
        console.error("Failed to parse session:", error)
        localStorage.removeItem("session")
      }
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <MicIcon className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">虚拟歌姬分享平台</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  pathname === item.href
                    ? "text-foreground"
                    : "text-foreground/60 transition-colors hover:text-foreground"
                }
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="mr-2 md:hidden" aria-label="菜单">
              <MenuIcon className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <Link href="/" className="flex items-center space-x-2" onClick={() => setOpen(false)}>
              <MicIcon className="h-6 w-6" />
              <span className="font-bold">虚拟歌姬分享平台</span>
            </Link>
            <nav className="mt-6 flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={
                    pathname === item.href
                      ? "text-foreground"
                      : "text-foreground/60 transition-colors hover:text-foreground"
                  }
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <form action="/search" method="GET">
              <div className="relative">
                <input
                  type="search"
                  name="q"
                  placeholder="搜索歌姬..."
                  className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:w-[200px] lg:w-[300px]"
                />
              </div>
            </form>
          </div>
          <div className="flex items-center gap-2">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{session.user.name?.[0] || session.user.email[0]}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user.name || "用户"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">控制面板</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">个人资料</Link>
                  </DropdownMenuItem>
                  {session.user.role === "ADMIN" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">管理员面板</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={() => signOut()}>
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">登录</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">注册</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
