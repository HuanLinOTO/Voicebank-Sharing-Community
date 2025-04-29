import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { BookOpenIcon, PlusIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

export default async function TutorialsPage() {
  const tutorials = await prisma.tutorial.findMany({
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
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">教程分区</h1>
          <p className="text-muted-foreground">学习声库制作、歌曲创作和调教技巧的教程</p>
        </div>
        <Button asChild>
          <Link href="/tutorials/upload">
            <PlusIcon className="mr-2 h-4 w-4" />
            上传教程
          </Link>
        </Button>
      </div>

      {tutorials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpenIcon className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-medium">暂无教程</h2>
          <p className="mt-2 text-sm text-muted-foreground">成为第一个上传教程的用户吧！</p>
          <Button asChild className="mt-4">
            <Link href="/tutorials/upload">上传教程</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tutorials.map((tutorial) => (
            <Card key={tutorial.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="line-clamp-2">{tutorial.title}</CardTitle>
                  <Badge variant="outline">
                    {tutorial.difficulty === "BEGINNER"
                      ? "入门"
                      : tutorial.difficulty === "INTERMEDIATE"
                        ? "进阶"
                        : "高阶"}
                  </Badge>
                </div>
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
    </div>
  )
}
