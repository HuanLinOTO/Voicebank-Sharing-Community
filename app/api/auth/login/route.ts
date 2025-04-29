import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { email, verificationCode } = await request.json()

    // 验证验证码
    if (verificationCode !== "114514") {
      return NextResponse.json({ message: "验证码错误" }, { status: 400 })
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ message: "用户不存在" }, { status: 400 })
    }

    // 创建会话
    const session = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    }

    return NextResponse.json({ session }, { status: 200 })
  } catch (error) {
    console.error("登录错误:", error)
    return NextResponse.json({ message: "登录失败，请稍后再试" }, { status: 500 })
  }
}
