import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import { MusicIcon, Download, PlayCircle } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function VocaloidDetailPage({ params }: { params: { id: string } }) {
    const vocaloid = await prisma.vocaloid.findUnique({
        where: {
            id: params.id,
        },
        include: {
            voicebanks: {
                where: {
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
            },
            songs: {
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
            },
        },
    })

    if (!vocaloid) {
        notFound()
    }

    // 解析JSON字符串
    const engines = JSON.parse(vocaloid.engines)
    const languages = JSON.parse(vocaloid.languages)

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* 歌姬信息 */}
                <div className="md:w-1/3">
                    <div className="rounded-lg overflow-hidden">
                        {vocaloid.imageUrl ? (
                            <img
                                src={`/api/files/${vocaloid.imageUrl}`}
                                alt={vocaloid.name}
                                className="w-full aspect-square object-cover"
                            />
                        ) : (
                            <div className="w-full aspect-square bg-muted flex items-center justify-center">
                                <img
                                    src={`/api/files/${vocaloid.avatarUrl}`}
                                    alt={vocaloid.name}
                                    className="w-1/2 h-1/2 object-contain"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="md:w-2/3 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold">{vocaloid.name}</h1>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline">
                                {vocaloid.gender === "MALE" ? "男" : vocaloid.gender === "FEMALE" ? "女" : "不明"}
                            </Badge>
                            {engines.map((engine: string) => (
                                <Badge key={engine} variant="secondary">
                                    {engine}
                                </Badge>
                            ))}
                            {languages.map((language: string) => (
                                <Badge key={language} variant="outline">
                                    {language}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold">声库信息</h2>
                        <p className="text-muted-foreground">
                            共 {vocaloid.voicebanks.length} 个声库，{vocaloid.songs.length} 首歌曲
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button asChild>
                            <Link href={`/songs/upload?vocaloidId=${vocaloid.id}`}>上传歌曲</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/voicebanks/upload">上传声库</Link>
                        </Button>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="voicebanks">
                <TabsList>
                    <TabsTrigger value="voicebanks">声库 ({vocaloid.voicebanks.length})</TabsTrigger>
                    <TabsTrigger value="songs">歌曲 ({vocaloid.songs.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="voicebanks" className="space-y-4">
                    {vocaloid.voicebanks.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">暂无声库</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {vocaloid.voicebanks.map((voicebank) => (
                                <Card key={voicebank.id}>
                                    <CardHeader>
                                        <CardTitle>{vocaloid.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {voicebank.voiceprovider && (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">配音者:</span>
                                                    <span>{voicebank.voiceprovider}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">上传者:</span>
                                                <span>{voicebank.user.name || "未知用户"}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">上传时间:</span>
                                                <span>{new Date(voicebank.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="mt-4">
                                                <audio controls className="w-full">
                                                    <source src={`/api/files/${voicebank.samplePath}`} type="audio/mpeg" />
                                                    您的浏览器不支持音频播放
                                                </audio>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between">
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={`/api/files/${voicebank.filePath}`} download>
                                                <Download className="mr-2 h-4 w-4" />
                                                下载声库
                                            </a>
                                        </Button>
                                        <Button size="sm" asChild>
                                            <a href={`/api/files/${voicebank.samplePath}`} target="_blank" rel="noreferrer">
                                                <PlayCircle className="mr-2 h-4 w-4" />
                                                试听
                                            </a>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="songs" className="space-y-4">
                    {vocaloid.songs.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">暂无歌曲</p>
                            <Button asChild className="mt-4">
                                <Link href={`/songs/upload?vocaloidId=${vocaloid.id}`}>上传歌曲</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {vocaloid.songs.map((song) => (
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
                                                <MusicIcon className="h-12 w-12 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <CardHeader>
                                        <CardTitle>{song.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 text-sm">
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
                                            <div className="mt-4">
                                                <audio controls className="w-full">
                                                    <source src={`/api/files/${song.filePath}`} type="audio/mpeg" />
                                                    您的浏览器不支持音频播放
                                                </audio>
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
            </Tabs>
        </div>
    )
}
