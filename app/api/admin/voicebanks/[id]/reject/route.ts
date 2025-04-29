import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const voicebankId = (await params).id

    // 更新声库状态为已拒绝
    await prisma.voicebank.update({
      where: {
        id: voicebankId,
      },
      data: {
        status: "REJECTED",
      },
    })

    return NextResponse.json({ message: "声库已被拒绝" })
  } catch (error) {
    console.error("审核声库错误:", error)
    return NextResponse.json({ message: "审核声库失败，请稍后再试" }, { status: 500 })
  }
}
