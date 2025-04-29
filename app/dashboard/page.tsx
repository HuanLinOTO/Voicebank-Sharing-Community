"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSession } from "@/lib/session-provider"
import { MicIcon, MusicIcon, BookOpenIcon, PlusIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type Voicebank = {
  id: string
  vocaloidId: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
  vocaloid: {
    name: string
  }
}

type Song = {
  id: string
  title: string
  vocaloidId: string
  createdAt: string
  vocaloid: {
    name: string
  }
}

type Tutorial = {
  id: string
  title: string
  type: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
}

export default function DashboardPage() {
  const { session } = useSession()
  const [voicebanks, setVoicebanks] = useState<Voicebank[]>([])
  const [songs, setSongs] = useState<Song[]>([])
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchUserData() {
      if (!session) return

      try {
        // 获取用户的声库
        const voicebanksResponse = await fetch(`/api/users/${session.user.id}/voicebanks`)
        if (voicebanksResponse.ok) {
          const voicebanksData = await voicebanksResponse.json()
          setVoicebanks(voicebanksData)
        }

        // 获取用户的歌曲
        const songsResponse = await fetch(`/api/users/${session.user.id}/songs`)
        if (songsResponse.ok) {
          const songsData = await songsResponse.json()
          setSongs(songsData)
        }

        // 获取用户的教程
        const tutorialsResponse = await fetch(`/api/users/${session.user.id}/tutorials`)
        if (tutorialsResponse.ok) {
          const tutorialsData = await tutorialsResponse.json()
          setTutorials(tutorialsData)
        }
      } catch (error) {
        console.error("获取用户数据失败:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [session])

  // 检查用户是否已登录
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-bold">请先登录</h1>
        <p className="mt-2 text-muted-foreground">您需要登录才能访问控制面板</p>
        <Button asChild className="mt-4">
          <a href="/login">前往登录</a>
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">控制面板</h1>
        <p className="text-muted-foreground">管理您的声库、歌曲和教程</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">声库</CardTitle>
            <MicIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{voicebanks.length}</div>
            <p className="text-xs text-muted-foreground">已上传声库数量</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/voicebanks/upload">
                <PlusIcon className="mr-2 h-4 w-4" />
                上传声库
              </Link>
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">歌曲</CardTitle>
            <MusicIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{songs.length}</div>
            <p className="text-xs text-muted-foreground">已上传歌曲数量</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/songs/upload">
                <PlusIcon className="mr-2 h-4 w-4" />
                上传歌曲
              </Link>
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">教程</CardTitle>
            <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tutorials.length}</div>
            <p className="text-xs text-muted-foreground">已上传教程数量</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/tutorials/upload">
                <PlusIcon className="mr-2 h-4 w-4" />
                上传教程
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="voicebanks">
        <TabsList>
          <TabsTrigger value="voicebanks">我的声库</TabsTrigger>
          <TabsTrigger value="songs">我的歌曲</TabsTrigger>
          <TabsTrigger value="tutorials">我的教程</TabsTrigger>
        </TabsList>
        <TabsContent value="voicebanks">
          {voicebanks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MicIcon className="h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-lg font-medium">暂无声库</h2>
              <p className="mt-2 text-sm text-muted-foreground">您还没有上传任何声库</p>
              <Button asChild className="mt-4">
                <Link href="/voicebanks/upload">上传声库</Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-4 p-4 font-medium">
                <div>歌姬名称</div>
                <div>上传时间</div>
                <div>状态</div>
                <div className="text-right">操作</div>
              </div>
              {voicebanks.map((voicebank) => (
                <div key={voicebank.id} className="grid grid-cols-4 items-center p-4 border-t">
                  <div>{voicebank.vocaloid.name}</div>
                  <div>{new Date(voicebank.createdAt).toLocaleDateString()}</div>
                  <div>
                    {voicebank.status === "PENDING" ? (
                      <Badge variant="outline">待审核</Badge>
                    ) : voicebank.status === "APPROVED" ? (
                      <Badge variant="default">已通过</Badge>
                    ) : (
                      <Badge variant="destructive">已拒绝</Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/voicebanks/${voicebank.vocaloidId}`}>查看</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="songs">
          {songs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MusicIcon className="h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-lg font-medium">暂无歌曲</h2>
              <p className="mt-2 text-sm text-muted-foreground">您还没有上传任何歌曲</p>
              <Button asChild className="mt-4">
                <Link href="/songs/upload">上传歌曲</Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-4 p-4 font-medium">
                <div>歌曲名称</div>
                <div>歌姬</div>
                <div>上传时间</div>
                <div className="text-right">操作</div>
              </div>
              {songs.map((song) => (
                <div key={song.id} className="grid grid-cols-4 items-center p-4 border-t">
                  <div>{song.title}</div>
                  <div>{song.vocaloid.name}</div>
                  <div>{new Date(song.createdAt).toLocaleDateString()}</div>
                  <div className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/songs/${song.id}`}>查看</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="tutorials">
          {tutorials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpenIcon className="h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-lg font-medium">暂无教程</h2>
              <p className="mt-2 text-sm text-muted-foreground">您还没有上传任何教程</p>
              <Button asChild className="mt-4">
                <Link href="/tutorials/upload">上传教程</Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-4 p-4 font-medium">
                <div>教程标题</div>
                <div>类型</div>
                <div>状态</div>
                <div className="text-right">操作</div>
              </div>
              {tutorials.map((tutorial) => (
                <div key={tutorial.id} className="grid grid-cols-4 items-center p-4 border-t">
                  <div>{tutorial.title}</div>
                  <div>
                    {tutorial.type === "VOICEBANK_CREATION"
                      ? "声库制作"
                      : tutorial.type === "SONG_CREATION"
                        ? "歌曲创作"
                        : tutorial.type === "TUNING"
                          ? "调教技巧"
                          : "其他"}
                  </div>
                  <div>
                    {tutorial.status === "PENDING" ? (
                      <Badge variant="outline">待审核</Badge>
                    ) : tutorial.status === "APPROVED" ? (
                      <Badge variant="default">已通过</Badge>
                    ) : (
                      <Badge variant="destructive">已拒绝</Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/tutorials/${tutorial.id}`}>查看</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
