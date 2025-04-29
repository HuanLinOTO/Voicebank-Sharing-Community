import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { MusicIcon, PlusIcon } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function SongsPage() {
  const songs = await prisma.song.findMany({
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">歌曲分区</h1>
          <p className="text-muted-foreground">浏览虚拟歌姬演唱的歌曲，或上传您自己的作品</p>
        </div>
        <Button asChild>
          <Link href="/songs/upload">
            <PlusIcon className="mr-2 h-4 w-4" />
            上传歌曲
          </Link>
        </Button>
      </div>

      {songs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MusicIcon className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-medium">暂无歌曲</h2>
          <p className="mt-2 text-sm text-muted-foreground">成为第一个上传歌曲的用户吧！</p>
          <Button asChild className="mt-4">
            <Link href="/songs/upload">上传歌曲</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {songs.map((song) => (
            <Card key={song.id} className="overflow-hidden">
              <div className="aspect-video relative">
                {song.coverPath ? (
                  <img src={`/api/files/${song.coverPath}`} alt={song.title} className="object-cover w-full h-full" />
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
    </div>
  )
}
