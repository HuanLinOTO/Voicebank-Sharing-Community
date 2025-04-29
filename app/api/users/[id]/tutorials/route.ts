import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = (await params).id

    // 获取用户的教程
    const tutorials = await prisma.tutorial.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(tutorials)
  } catch (error) {
    console.error("获取用户教程错误:", error)
    return NextResponse.json({ message: "获取用户教程失败，请稍后再试" }, { status: 500 })
  }
}
