import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcrypt"
import { ensureDirectories } from "@/lib/file-utils"

export async function POST(request: NextRequest) {
  try {
    // 确保数据目录存在
    ensureDirectories()

    const { email, name, password, verificationCode } = await request.json()

    // 验证验证码
    if (verificationCode !== "114514") {
      return NextResponse.json({ message: "验证码错误" }, { status: 400 })
    }

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ message: "该邮箱已被注册" }, { status: 400 })
    }

    // 创建用户
    const hashedPassword = await hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "USER", // 默认为普通用户
      },
    })

    return NextResponse.json({ message: "注册成功", userId: user.id }, { status: 201 })
  } catch (error) {
    console.error("注册错误:", error)
    return NextResponse.json({ message: "注册失败，请稍后再试" }, { status: 500 })
  }
}
