"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "@/lib/session-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AddWebsitePage() {
  const { session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // 检查用户是否已登录且是管理员
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-bold">请先登录</h1>
        <p className="mt-2 text-muted-foreground">您需要登录才能访问管理员面板</p>
        <Button asChild className="mt-4">
          <a href="/login">前往登录</a>
        </Button>
      </div>
    )
  }

  if (session.user.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-bold">权限不足</h1>
        <p className="mt-2 text-muted-foreground">您没有权限访问管理员面板</p>
        <Button asChild className="mt-4">
          <a href="/">返回首页</a>
        </Button>
      </div>
    )
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const name = formData.get("name") as string
    const url = formData.get("url") as string
    const category = formData.get("category") as string
    const description = formData.get("description") as string

    try {
      // 验证必填项
      if (!name || !url || !category || !description) {
        throw new Error("请填写所有必填项")
      }

      // 验证URL格式
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        throw new Error("请输入有效的URL，以http://或https://开头")
      }

      const response = await fetch("/api/websites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          url,
          category,
          description,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "添加失败")
      }

      toast({
        title: "添加成功",
        description: "网址已成功添加",
      })
      router.push("/admin/websites")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "添加失败",
        description: error instanceof Error ? error.message : "请稍后再试",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>添加网址</CardTitle>
          <CardDescription>添加与虚拟歌姬相关的网址资源</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">网址名称 *</Label>
              <Input id="name" name="name" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="url">URL *</Label>
              <Input id="url" name="url" placeholder="https://example.com" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">分类 *</Label>
              <Select name="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VOICEBANK_DOWNLOAD">声库下载</SelectItem>
                  <SelectItem value="COMMUNITY">社区论坛</SelectItem>
                  <SelectItem value="TOOLS">创作工具</SelectItem>
                  <SelectItem value="OTHER">其他资源</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">描述 *</Label>
              <Textarea id="description" name="description" rows={4} required />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "添加中..." : "添加网址"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
