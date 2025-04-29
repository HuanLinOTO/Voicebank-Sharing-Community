"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const name = formData.get("name") as string
    const password = formData.get("password") as string
    const verificationCode = formData.get("verification-code") as string

    try {
      // 验证必填项
      if (!email || !name || !password || !verificationCode) {
        throw new Error("请填写所有必填项")
      }

      // 验证验证码
      if (verificationCode !== "114514") {
        throw new Error("验证码错误")
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name,
          password,
          verificationCode,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "注册失败")
      }

      toast({
        title: "注册成功",
        description: "请登录您的账号",
      })
      router.push("/login")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "注册失败",
        description: error instanceof Error ? error.message : "请稍后再试",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">注册账号</CardTitle>
          <CardDescription>创建一个新账号以使用所有功能</CardDescription>
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
                <Label htmlFor="name">用户名</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="您的用户名"
                  autoCapitalize="none"
                  autoCorrect="off"
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  name="password"
                  placeholder="您的密码"
                  type="password"
                  autoCapitalize="none"
                  autoComplete="new-password"
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
              <Button disabled={isLoading}>{isLoading ? "注册中..." : "注册"}</Button>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-muted-foreground">
            已有账号?{" "}
            <Link href="/login" className="underline underline-offset-4 hover:text-primary">
              登录
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
