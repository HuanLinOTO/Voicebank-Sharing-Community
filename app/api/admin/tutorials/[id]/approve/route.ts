import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tutorialId = (await params).id

    // 更新教程状态为已通过
    await prisma.tutorial.update({
      where: {
        id: tutorialId,
      },
      data: {
        status: "APPROVED",
      },
    })

    return NextResponse.json({ message: "教程已通过审核" })
  } catch (error) {
    console.error("审核教程错误:", error)
    return NextResponse.json({ message: "审核教程失败，请稍后再试" }, { status: 500 })
  }
}
