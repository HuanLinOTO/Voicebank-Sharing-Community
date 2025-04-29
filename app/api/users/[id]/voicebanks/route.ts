import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = (await params).id

    // 获取用户的声库
    const voicebanks = await prisma.voicebank.findMany({
      where: {
        userId,
      },
      include: {
        vocaloid: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(voicebanks)
  } catch (error) {
    console.error("获取用户声库错误:", error)
    return NextResponse.json({ message: "获取用户声库失败，请稍后再试" }, { status: 500 })
  }
}
