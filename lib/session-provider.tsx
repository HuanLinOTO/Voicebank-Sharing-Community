"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

type User = {
  id: string
  email: string
  name?: string
  role: "USER" | "ADMIN"
}

type Session = {
  user: User
}

type SessionContextType = {
  session: Session | null
  loading: boolean
  signIn: (email: string, verificationCode: string) => Promise<void>
  signOut: () => void
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  loading: true,
  signIn: async () => {},
  signOut: () => {},
})

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // 从localStorage加载会话
    const storedSession = localStorage.getItem("session")
    if (storedSession) {
      try {
        setSession(JSON.parse(storedSession))
      } catch (error) {
        console.error("Failed to parse session:", error)
        localStorage.removeItem("session")
      }
    }
    setLoading(false)
  }, [])

  // 修改 signIn 函数，确保正确处理登录请求
  const signIn = async (email: string, verificationCode: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, verificationCode }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "登录失败")
      }

      const data = await response.json()
      setSession(data.session)
      localStorage.setItem("session", JSON.stringify(data.session))
      toast({
        title: "登录成功",
        description: "欢迎回来！",
      })
      router.push("/dashboard")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "登录失败",
        description: error instanceof Error ? error.message : "请稍后再试",
      })
    }
  }

  const signOut = () => {
    setSession(null)
    localStorage.removeItem("session")
    router.push("/")
    toast({
      title: "已退出登录",
    })
  }

  return <SessionContext.Provider value={{ session, loading, signIn, signOut }}>{children}</SessionContext.Provider>
}

export const useSession = () => useContext(SessionContext)
