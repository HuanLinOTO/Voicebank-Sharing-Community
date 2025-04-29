import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { MusicIcon, Download, ExternalLink } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function SongDetailPage({ params }: { params: { id: string } }) {
    const song = await prisma.song.findUnique({
        where: {
            id: params.id,
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
    })

    if (!song) {
        notFound()
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* 歌曲封面 */}
                <div className="md:w-1/3">
                    <div className="rounded-lg overflow-hidden">
                        {song.coverPath ? (
                            <img src={`/api/files/${song.coverPath}`} alt={song.title} className="w-full aspect-video object-cover" />
                        ) : (
                            <div className="w-full aspect-video bg-muted flex items-center justify-center">
                                <MusicIcon className="h-16 w-16 text-muted-foreground" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="md:w-2/3 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold">{song.title}</h1>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <Link href={`/voicebanks/${song.vocaloidId}`} className="text-primary hover:underline">
                                {song.vocaloid.name}
                            </Link>
                            {song.creator && <span className="text-muted-foreground">创作者: {song.creator}</span>}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Button asChild>
                                <a href={`/api/files/${song.filePath}`} download>
                                    <Download className="mr-2 h-4 w-4" />
                                    下载歌曲
                                </a>
                            </Button>
                            {song.bilibiliUrl && (
                                <Button variant="outline" asChild>
                                    <a href={song.bilibiliUrl} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        B站链接
                                    </a>
                                </Button>
                            )}
                        </div>

                        <div>
                            <audio controls className="w-full">
                                <source src={`/api/files/${song.filePath}`} type="audio/mpeg" />
                                您的浏览器不支持音频播放
                            </audio>
                        </div>
                    </div>
                </div>
            </div>

            {song.lyrics && (
                <Card>
                    <CardContent className="pt-6">
                        <h2 className="text-xl font-semibold mb-4">歌词</h2>
                        <div className="whitespace-pre-wrap">{song.lyrics}</div>
                    </CardContent>
                </Card>
            )}

            <div className="text-sm text-muted-foreground">
                <p>上传者: {song.user.name || "未知用户"}</p>
                <p>上传时间: {new Date(song.createdAt).toLocaleDateString()}</p>
            </div>
        </div>
    )
}
