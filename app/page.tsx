import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MicIcon, MusicIcon, BookOpenIcon, GlobeIcon } from "lucide-react"

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="py-12 md:py-16 lg:py-20">
        <div className="px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                欢迎来到虚拟歌姬分享平台
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                发现、分享和创作虚拟歌姬的世界。上传声库、分享歌曲、学习教程，一切尽在这里。
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/voicebanks">浏览声库</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/register">立即注册</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12 lg:py-16">
        <div className="px-4 md:px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">声库分区</CardTitle>
                <MicIcon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">上传和下载各种引擎的虚拟歌姬声库，支持多种格式和语种。</p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/voicebanks">查看声库</Link>
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">歌曲分区</CardTitle>
                <MusicIcon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">分享使用虚拟歌姬创作的歌曲，展示您的音乐才华。</p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/songs">浏览歌曲</Link>
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">教程分区</CardTitle>
                <BookOpenIcon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">学习声库制作、歌曲创作和调教技巧的教程，从入门到高阶。</p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/tutorials">查看教程</Link>
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">网址大全</CardTitle>
                <GlobeIcon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  收集与虚拟歌姬相关的优质资源链接，包括社区论坛、创作工具等。
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/websites">浏览网址</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12 lg:py-16 bg-muted/50">
        <div className="px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">加入我们的社区</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
                注册账号，上传您的声库、歌曲和教程，与其他创作者交流和分享。
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/register">立即注册</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
