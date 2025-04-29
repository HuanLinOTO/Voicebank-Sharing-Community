"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSession } from "@/lib/session-provider"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useSession()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const verificationCode = formData.get("verification-code") as string

    try {
      await signIn(email, verificationCode)
    } catch (error) {
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">登录</CardTitle>
          <CardDescription>输入您的电子邮箱和验证码登录</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={onSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">电子邮箱</Label>
                <Input
                  id="email"
                  name="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="verification-code">验证码</Label>
                <Input
                  id="verification-code"
                  name="verification-code"
                  placeholder="请输入验证码"
                  autoCapitalize="none"
                  autoCorrect="off"
                  disabled={isLoading}
                  required
                />
                <p className="text-xs text-muted-foreground">验证码: 114514</p>
              </div>
              <Button disabled={isLoading}>{isLoading ? "登录中..." : "登录"}</Button>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-muted-foreground">
            没有账号?{" "}
            <Link href="/register" className="underline underline-offset-4 hover:text-primary">
              注册
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
