import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { MicIcon, PlusIcon } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function VoicebanksPage() {
  const vocaloids = await prisma.vocaloid.findMany({
    include: {
      voicebanks: {
        where: {
          status: "APPROVED",
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
          <h1 className="text-3xl font-bold tracking-tight">声库分区</h1>
          <p className="text-muted-foreground">浏览和下载虚拟歌姬声库，或上传您自己的声库</p>
        </div>
        <Button asChild>
          <Link href="/voicebanks/upload">
            <PlusIcon className="mr-2 h-4 w-4" />
            上传声库
          </Link>
        </Button>
      </div>

      {vocaloids.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MicIcon className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-medium">暂无声库</h2>
          <p className="mt-2 text-sm text-muted-foreground">成为第一个上传声库的用户吧！</p>
          <Button asChild className="mt-4">
            <Link href="/voicebanks/upload">上传声库</Link>
          </Button>
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
    </div>
  )
}
