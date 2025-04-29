import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { GlobeIcon } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function WebsitesPage() {
  const websites = await prisma.website.findMany({
    orderBy: [
      {
        category: "asc",
      },
      {
        name: "asc",
      },
    ],
  })

  // 按类别分组
  const websitesByCategory: Record<string, typeof websites> = {}

  websites.forEach((website) => {
    if (!websitesByCategory[website.category]) {
      websitesByCategory[website.category] = []
    }
    websitesByCategory[website.category].push(website)
  })

  const getCategoryName = (category: string) => {
    switch (category) {
      case "VOICEBANK_DOWNLOAD":
        return "声库下载"
      case "COMMUNITY":
        return "社区论坛"
      case "TOOLS":
        return "创作工具"
      case "OTHER":
        return "其他资源"
      default:
        return category
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">网址大全</h1>
        <p className="text-muted-foreground">收集与虚拟歌姬相关的优质资源链接</p>
      </div>

      {Object.keys(websitesByCategory).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <GlobeIcon className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-medium">暂无网址资源</h2>
          <p className="mt-2 text-sm text-muted-foreground">网站管理员将很快添加相关资源</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(websitesByCategory).map(([category, websites]) => (
            <div key={category} className="space-y-4">
              <h2 className="text-2xl font-bold">{getCategoryName(category)}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {websites.map((website) => (
                  <Card key={website.id}>
                    <CardHeader>
                      <CardTitle>{website.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{website.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Button asChild variant="outline" className="w-full">
                        <a href={website.url} target="_blank" rel="noopener noreferrer">
                          访问网站
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
