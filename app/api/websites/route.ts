import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { name, url, category, description } = await request.json()

    // 验证必填项
    if (!name || !url || !category || !description) {
      return NextResponse.json({ message: "缺少必填项" }, { status: 400 })
    }

    // 创建网址
    const website = await prisma.website.create({
      data: {
        name,
        url,
        category,
        description,
      },
    })

    return NextResponse.json(
      {
        message: "网址添加成功",
        websiteId: website.id,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("添加网址错误:", error)
    return NextResponse.json({ message: "添加网址失败，请稍后再试" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category") as string | null

    const websites = await prisma.website.findMany({
      where: category ? { category } : undefined,
      orderBy: [
        {
          category: "asc",
        },
        {
          name: "asc",
        },
      ],
    })

    return NextResponse.json(websites)
  } catch (error) {
    console.error("获取网址列表错误:", error)
    return NextResponse.json({ message: "获取网址列表失败，请稍后再试" }, { status: 500 })
  }
}
