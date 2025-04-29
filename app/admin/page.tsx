"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSession } from "@/lib/session-provider"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

type Voicebank = {
  id: string
  vocaloidId: string
  userId: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
  vocaloid: {
    name: string
  }
  user: {
    name: string | null
    email: string
  }
}

type Tutorial = {
  id: string
  title: string
  type: string
  userId: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
  user: {
    name: string | null
    email: string
  }
}

export default function AdminPage() {
  const { session } = useSession()
  const { toast } = useToast()
  const [pendingVoicebanks, setPendingVoicebanks] = useState<Voicebank[]>([])
  const [pendingTutorials, setPendingTutorials] = useState<Tutorial[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchPendingItems() {
      if (!session || session.user.role !== "ADMIN") return

      try {
        // 获取待审核的声库
        const voicebanksResponse = await fetch("/api/voicebanks?status=PENDING")
        if (voicebanksResponse.ok) {
          const voicebanksData = await voicebanksResponse.json()
          setPendingVoicebanks(voicebanksData)
        }

        // 获取待审核的教程
        const tutorialsResponse = await fetch("/api/tutorials?status=PENDING")
        if (tutorialsResponse.ok) {
          const tutorialsData = await tutorialsResponse.json()
          setPendingTutorials(tutorialsData)
        }
      } catch (error) {
        console.error("获取待审核项目失败:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPendingItems()
  }, [session])

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
        <p className="mt-2 text-muted-foreground">您没有权限访问管理员面板 {session.user.role}</p>
        <Button asChild className="mt-4">
          <a href="/">返回首页</a>
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-bold">加载中...</h1>
      </div>
    )
  }

  async function approveVoicebank(id: string) {
    try {
      const response = await fetch(`/api/admin/voicebanks/${id}/approve`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("审核失败")
      }

      // 更新列表
      setPendingVoicebanks(pendingVoicebanks.filter((vb) => vb.id !== id))

      toast({
        title: "审核成功",
        description: "声库已通过审核",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "操作失败",
        description: "请稍后再试",
      })
    }
  }

  async function rejectVoicebank(id: string) {
    try {
      const response = await fetch(`/api/admin/voicebanks/${id}/reject`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("审核失败")
      }

      // 更新列表
      setPendingVoicebanks(pendingVoicebanks.filter((vb) => vb.id !== id))

      toast({
        title: "审核成功",
        description: "声库已被拒绝",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "操作失败",
        description: "请稍后再试",
      })
    }
  }

  async function approveTutorial(id: string) {
    try {
      const response = await fetch(`/api/admin/tutorials/${id}/approve`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("审核失败")
      }

      // 更新列表
      setPendingTutorials(pendingTutorials.filter((t) => t.id !== id))

      toast({
        title: "审核成功",
        description: "教程已通过审核",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "操作失败",
        description: "请稍后再试",
      })
    }
  }

  async function rejectTutorial(id: string) {
    try {
      const response = await fetch(`/api/admin/tutorials/${id}/reject`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("审核失败")
      }

      // 更新列表
      setPendingTutorials(pendingTutorials.filter((t) => t.id !== id))

      toast({
        title: "审核成功",
        description: "教程已被拒绝",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "操作失败",
        description: "请稍后再试",
      })
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">管理员面板</h1>
        <p className="text-muted-foreground">管理声库、歌曲和教程</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>待审核声库</CardTitle>
            <CardDescription>需要审核的声库数量</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingVoicebanks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>待审核教程</CardTitle>
            <CardDescription>需要审核的教程数量</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTutorials.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="voicebanks">
        <TabsList>
          <TabsTrigger value="voicebanks">待审核声库</TabsTrigger>
          <TabsTrigger value="tutorials">待审核教程</TabsTrigger>
          <TabsTrigger value="websites">网址管理</TabsTrigger>
        </TabsList>
        <TabsContent value="voicebanks">
          {pendingVoicebanks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h2 className="mt-4 text-lg font-medium">暂无待审核声库</h2>
              <p className="mt-2 text-sm text-muted-foreground">所有声库已审核完毕</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-5 p-4 font-medium">
                <div>歌姬名称</div>
                <div>上传者</div>
                <div>上传时间</div>
                <div>状态</div>
                <div className="text-right">操作</div>
              </div>
              {pendingVoicebanks.map((voicebank) => (
                <div key={voicebank.id} className="grid grid-cols-5 items-center p-4 border-t">
                  <div>{voicebank.vocaloid.name}</div>
                  <div>{voicebank.user.name || voicebank.user.email}</div>
                  <div>{new Date(voicebank.createdAt).toLocaleDateString()}</div>
                  <div>
                    <Badge variant="outline">待审核</Badge>
                  </div>
                  <div className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => approveVoicebank(voicebank.id)}>
                      通过
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => rejectVoicebank(voicebank.id)}>
                      拒绝
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="tutorials">
          {pendingTutorials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h2 className="mt-4 text-lg font-medium">暂无待审核教程</h2>
              <p className="mt-2 text-sm text-muted-foreground">所有教程已审核完毕</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-5 p-4 font-medium">
                <div>教程标题</div>
                <div>上传者</div>
                <div>上传时间</div>
                <div>状态</div>
                <div className="text-right">操作</div>
              </div>
              {pendingTutorials.map((tutorial) => (
                <div key={tutorial.id} className="grid grid-cols-5 items-center p-4 border-t">
                  <div>{tutorial.title}</div>
                  <div>{tutorial.user.name || tutorial.user.email}</div>
                  <div>{new Date(tutorial.createdAt).toLocaleDateString()}</div>
                  <div>
                    <Badge variant="outline">待审核</Badge>
                  </div>
                  <div className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => approveTutorial(tutorial.id)}>
                      通过
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => rejectTutorial(tutorial.id)}>
                      拒绝
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="websites">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">网址管理</h2>
              <Button asChild>
                <Link href="/admin/websites/add">添加网址</Link>
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>网址列表</CardTitle>
                <CardDescription>管理与虚拟歌姬相关的网址资源</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/websites" className="text-primary hover:underline">
                  前往网址管理页面
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
