import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import { Download } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function TutorialDetailPage({ params }: { params: { id: string } }) {
    const tutorial = await prisma.tutorial.findUnique({
        where: {
            id: params.id,
            status: "APPROVED", // 只显示已审核通过的教程
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    })

    if (!tutorial) {
        notFound()
    }

    // 解析适用引擎类型（如果有）
    const engineTypes = tutorial.engineType ? JSON.parse(tutorial.engineType) : []

    // 获取文件扩展名
    const fileExtension = tutorial.filePath.split(".").pop()?.toLowerCase()
    const isPdf = fileExtension === "pdf"
    const isVideo = ["mp4", "webm", "ogg"].includes(fileExtension || "")

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">{tutorial.title}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline">
                        {tutorial.difficulty === "BEGINNER" ? "入门" : tutorial.difficulty === "INTERMEDIATE" ? "进阶" : "高阶"}
                    </Badge>
                    <Badge variant="secondary">
                        {tutorial.type === "VOICEBANK_CREATION"
                            ? "声库制作"
                            : tutorial.type === "SONG_CREATION"
                                ? "歌曲创作"
                                : tutorial.type === "TUNING"
                                    ? "调教技巧"
                                    : "其他"}
                    </Badge>
                    {engineTypes.map((engine: string) => (
                        <Badge key={engine} variant="outline">
                            {engine}
                        </Badge>
                    ))}
                </div>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4">教程简介</h2>
                    <p className="whitespace-pre-wrap">{tutorial.description}</p>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">教程内容</h2>

                {isPdf && (
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                        <iframe src={`/api/files/${tutorial.filePath}`} className="w-full h-full" title={tutorial.title}></iframe>
                    </div>
                )}

                {isVideo && (
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                        <video controls className="w-full h-full">
                            <source src={`/api/files/${tutorial.filePath}`} type={`video/${fileExtension}`} />
                            您的浏览器不支持视频播放
                        </video>
                    </div>
                )}

                {!isPdf && !isVideo && (
                    <div className="flex justify-center">
                        <Button asChild size="lg">
                            <a href={`/api/files/${tutorial.filePath}`} download>
                                <Download className="mr-2 h-4 w-4" />
                                下载教程文件
                            </a>
                        </Button>
                    </div>
                )}
            </div>

            <div className="text-sm text-muted-foreground">
                <p>作者: {tutorial.user.name || "未知用户"}</p>
                <p>发布时间: {new Date(tutorial.createdAt).toLocaleDateString()}</p>
            </div>
        </div>
    )
}
