"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "@/lib/session-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Vocaloid = {
  id: string
  name: string
}

export default function UploadSongPage() {
  const { session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [vocaloids, setVocaloids] = useState<Vocaloid[]>([])
  const [songFile, setSongFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)

  // 获取歌姬列表
  useEffect(() => {
    async function fetchVocaloids() {
      try {
        const response = await fetch("/api/vocaloids")
        if (response.ok) {
          const data = await response.json()
          setVocaloids(data)
        }
      } catch (error) {
        console.error("获取歌姬列表失败:", error)
      }
    }

    fetchVocaloids()
  }, [])

  // 检查用户是否已登录
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-bold">请先登录</h1>
        <p className="mt-2 text-muted-foreground">您需要登录才能上传歌曲</p>
        <Button asChild className="mt-4">
          <a href="/login">前往登录</a>
        </Button>
      </div>
    )
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)

    // 添加文件
    if (songFile) formData.set("songFile", songFile)
    if (coverFile) formData.set("coverFile", coverFile)

    // 添加用户ID
    if (session?.user?.id) {
      formData.set("userId", session.user.id)
    }

    try {
      // 验证必填项
      if (!formData.get("title") || !formData.get("vocaloidId") || !songFile) {
        throw new Error("请填写所有必填项")
      }

      // 验证B站链接格式
      const bilibiliUrl = formData.get("bilibiliUrl") as string
      if (bilibiliUrl && !bilibiliUrl.includes("bilibili.com")) {
        throw new Error("请输入有效的B站链接")
      }

      const response = await fetch("/api/songs", {
        method: "POST",
        body: formData,
        headers: session
          ? {
              Authorization: `Bearer ${JSON.stringify(session)}`,
            }
          : undefined,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "上传失败")
      }

      toast({
        title: "上传成功",
        description: "您的歌曲已上传成功",
      })
      router.push("/songs")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "上传失败",
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
          <CardTitle>上传歌曲</CardTitle>
          <CardDescription>填写歌曲信息并上传相关文件</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-8">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">歌曲名称 *</Label>
                <Input id="title" name="title" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="vocaloidId">关联歌姬 *</Label>
                <Select name="vocaloidId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="选择歌姬" />
                  </SelectTrigger>
                  <SelectContent>
                    {vocaloids.map((vocaloid) => (
                      <SelectItem key={vocaloid.id} value={vocaloid.id}>
                        {vocaloid.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {vocaloids.length === 0 && <p className="text-sm text-muted-foreground">暂无可用歌姬，请先上传歌姬</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="creator">创作者</Label>
                <Input id="creator" name="creator" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bilibiliUrl">Bilibili链接</Label>
                <Input id="bilibiliUrl" name="bilibiliUrl" placeholder="https://www.bilibili.com/video/..." />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="lyrics">歌词</Label>
                <Textarea id="lyrics" name="lyrics" rows={6} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="songFile">歌曲文件 * (支持MP3、WAV格式，最大150MB)</Label>
                <Input
                  id="songFile"
                  type="file"
                  accept=".mp3,.wav"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSongFile(e.target.files[0])
                    }
                  }}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="coverFile">封面图</Label>
                <Input
                  id="coverFile"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setCoverFile(e.target.files[0])
                    }
                  }}
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "上传中..." : "上传歌曲"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
