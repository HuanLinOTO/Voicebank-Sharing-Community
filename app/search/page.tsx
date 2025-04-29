import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { MicIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const dynamic = "force-dynamic"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; engine?: string; gender?: string; language?: string }
}) {
  const { q, engine, gender, language } = searchParams

  // 如果没有搜索参数，显示空结果
  if (!q && !engine && !gender && !language) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">搜索结果</h1>
          <p className="text-muted-foreground">请输入搜索关键词或使用筛选条件</p>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MicIcon className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-medium">无搜索结果</h2>
          <p className="mt-2 text-sm text-muted-foreground">请尝试使用不同的搜索词或筛选条件</p>
        </div>
      </div>
    )
  }

  // 构建搜索条件
  const whereClause: any = {}

  if (q) {
    whereClause.name = {
      contains: q,
    }
  }

  if (engine) {
    whereClause.engines = {
      contains: engine,
    }
  }

  if (gender) {
    whereClause.gender = gender
  }

  if (language) {
    whereClause.languages = {
      contains: language,
    }
  }

  // 搜索歌姬
  const vocaloids = await prisma.vocaloid.findMany({
    where: whereClause,
    include: {
      voicebanks: {
        where: {
          status: "APPROVED",
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  })

  // 搜索歌曲（如果有关键词）
  const songs = q
    ? await prisma.song.findMany({
        where: {
          OR: [{ title: { contains: q } }, { creator: { contains: q } }],
        },
        include: {
          vocaloid: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    : []

  // 搜索教程（如果有关键词）
  const tutorials = q
    ? await prisma.tutorial.findMany({
        where: {
          OR: [{ title: { contains: q } }, { description: { contains: q } }],
          status: "APPROVED",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    : []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">搜索结果</h1>
        <p className="text-muted-foreground">
          {q ? `搜索"${q}"` : ""}
          {engine ? ` 引擎:${engine}` : ""}
          {gender ? ` 性别:${gender === "MALE" ? "男" : gender === "FEMALE" ? "女" : "不明"}` : ""}
          {language ? ` 语种:${language}` : ""}
        </p>
      </div>

      <Tabs defaultValue="vocaloids">
        <TabsList>
          <TabsTrigger value="vocaloids">歌姬 ({vocaloids.length})</TabsTrigger>
          <TabsTrigger value="songs">歌曲 ({songs.length})</TabsTrigger>
          <TabsTrigger value="tutorials">教程 ({tutorials.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="vocaloids">
          {vocaloids.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MicIcon className="h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-lg font-medium">未找到匹配的歌姬</h2>
              <p className="mt-2 text-sm text-muted-foreground">请尝试使用不同的搜索词或筛选条件</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {vocaloids.map((vocaloid) => (
                <Card key={vocaloid.id} className="overflow-hidden">
                  <div className="aspect-square relative">
                    <img
                      src={`/api/files/${vocaloid.avatarUrl}`}
                      alt={vocaloid.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{vocaloid.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">性别:</span>
                        <span>{vocaloid.gender === "MALE" ? "男" : vocaloid.gender === "FEMALE" ? "女" : "不明"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">引擎:</span>
                        <span>{JSON.parse(vocaloid.engines).join(", ")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">语种:</span>
                        <span>{JSON.parse(vocaloid.languages).join(", ")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">声库数:</span>
                        <span>{vocaloid.voicebanks.length}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/voicebanks/${vocaloid.id}`}>查看详情</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="songs">
          {songs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MicIcon className="h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-lg font-medium">未找到匹配的歌曲</h2>
              <p className="mt-2 text-sm text-muted-foreground">请尝试使用不同的搜索词</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {songs.map((song) => (
                <Card key={song.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    {song.coverPath ? (
                      <img
                        src={`/api/files/${song.coverPath}`}
                        alt={song.title}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <MicIcon className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle>{song.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">歌姬:</span>
                        <Link href={`/voicebanks/${song.vocaloidId}`} className="hover:underline">
                          {song.vocaloid.name}
                        </Link>
                      </div>
                      {song.creator && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">创作者:</span>
                          <span>{song.creator}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="font-medium">上传者:</span>
                        <span>{song.user.name || "未知用户"}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/songs/${song.id}`}>查看详情</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="tutorials">
          {tutorials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MicIcon className="h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-lg font-medium">未找到匹配的教程</h2>
              <p className="mt-2 text-sm text-muted-foreground">请尝试使用不同的搜索词</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tutorials.map((tutorial) => (
                <Card key={tutorial.id}>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{tutorial.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">类型:</span>
                        <span>
                          {tutorial.type === "VOICEBANK_CREATION"
                            ? "声库制作"
                            : tutorial.type === "SONG_CREATION"
                              ? "歌曲创作"
                              : tutorial.type === "TUNING"
                                ? "调教技巧"
                                : "其他"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">作者:</span>
                        <span>{tutorial.user.name || "未知用户"}</span>
                      </div>
                      <p className="text-muted-foreground line-clamp-3">{tutorial.description}</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/tutorials/${tutorial.id}`}>查看教程</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
