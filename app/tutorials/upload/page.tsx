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
import { Checkbox } from "@/components/ui/checkbox"

const engines = [
  { id: "utau", label: "UTAU" },
  { id: "deepfusion", label: "DeeFusion" },
  { id: "niaoniao", label: "袅袅" },
  { id: "vogen", label: "Vogen" },
  { id: "deepvocal", label: "DeepVocal" },
  { id: "vocalsharp", label: "VocalSharp" },
]

export default function UploadTutorialPage() {
  const { session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedEngines, setSelectedEngines] = useState<string[]>([])
  const [otherEngine, setOtherEngine] = useState("")
  const [tutorialFile, setTutorialFile] = useState<File | null>(null)

  // 检查用户是否已登录
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-bold">请先登录</h1>
        <p className="mt-2 text-muted-foreground">您需要登录才能上传教程</p>
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

    // 添加引擎
    const finalEngines = [...selectedEngines]
    if (otherEngine && !selectedEngines.includes(otherEngine)) {
      finalEngines.push(otherEngine)
    }

    formData.set("engineType", JSON.stringify(finalEngines))

    // 添加文件
    if (tutorialFile) formData.set("tutorialFile", tutorialFile)

    // 添加用户ID
    if (session?.user?.id) {
      formData.set("userId", session.user.id)
    }

    try {
      // 验证必填项
      if (
        !formData.get("title") ||
        !formData.get("description") ||
        !formData.get("type") ||
        !formData.get("difficulty") ||
        !tutorialFile
      ) {
        throw new Error("请填写所有必填项")
      }

      const response = await fetch("/api/tutorials", {
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
        description: "您的教程已提交，等待审核",
      })
      router.push("/dashboard")
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
          <CardTitle>上传教程</CardTitle>
          <CardDescription>分享您的知识和经验，帮助其他用户学习</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-8">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">教程标题 *</Label>
                <Input id="title" name="title" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">教程简介 *</Label>
                <Textarea id="description" name="description" rows={4} required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">教程类型 *</Label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="选择教程类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VOICEBANK_CREATION">声库制作</SelectItem>
                    <SelectItem value="SONG_CREATION">歌曲创作</SelectItem>
                    <SelectItem value="TUNING">调教技巧</SelectItem>
                    <SelectItem value="OTHER">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="difficulty">难度级别 *</Label>
                <Select name="difficulty" required>
                  <SelectTrigger>
                    <SelectValue placeholder="选择难度级别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">入门</SelectItem>
                    <SelectItem value="INTERMEDIATE">进阶</SelectItem>
                    <SelectItem value="ADVANCED">高阶</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>适用声库类型</Label>
                <div className="grid grid-cols-2 gap-2">
                  {engines.map((engine) => (
                    <div key={engine.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`engine-${engine.id}`}
                        checked={selectedEngines.includes(engine.label)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedEngines([...selectedEngines, engine.label])
                          } else {
                            setSelectedEngines(selectedEngines.filter((e) => e !== engine.label))
                          }
                        }}
                      />
                      <Label htmlFor={`engine-${engine.id}`}>{engine.label}</Label>
                    </div>
                  ))}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox
                    id="engine-other"
                    checked={!!otherEngine}
                    onCheckedChange={(checked) => {
                      if (!checked) setOtherEngine("")
                    }}
                  />
                  <Label htmlFor="engine-other">其他</Label>
                  <Input
                    value={otherEngine}
                    onChange={(e) => setOtherEngine(e.target.value)}
                    placeholder="请输入其他引擎"
                    disabled={!otherEngine && otherEngine !== ""}
                    className="max-w-[200px]"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tutorialFile">教程文件 * (支持PDF、视频等格式)</Label>
                <Input
                  id="tutorialFile"
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.zip"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setTutorialFile(e.target.files[0])
                    }
                  }}
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "上传中..." : "提交教程"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
