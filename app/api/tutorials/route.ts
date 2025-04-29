import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { saveTutorial } from "@/lib/file-utils"

export async function POST(request: NextRequest) {
  try {
    // 解析表单数据
    const formData = await request.formData()

    // 获取基本信息
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const type = formData.get("type") as "VOICEBANK_CREATION" | "SONG_CREATION" | "TUNING" | "OTHER"
    const difficulty = formData.get("difficulty") as "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
    const engineTypeJson = formData.get("engineType") as string | null

    // 获取文件
    const tutorialFile = formData.get("tutorialFile") as File

    // 验证必填项
    if (!title || !description || !type || !difficulty || !tutorialFile) {
      return NextResponse.json({ message: "缺少必填项" }, { status: 400 })
    }

    // 修改教程API，确保正确处理Authorization头部
    // 在POST函数中，修改获取用户会话的部分
    // 获取用户会话
    const sessionHeader = request.headers.get("Authorization")
    let userId

    if (sessionHeader) {
      try {
        const sessionData = JSON.parse(sessionHeader.replace("Bearer ", ""))
        userId = sessionData.user.id
      } catch (error) {
        console.error("解析会话错误:", error)
      }
    }

    // 如果没有从头部获取到用户ID，尝试从cookies或其他地方获取
    if (!userId) {
      // 尝试从localStorage获取（这在服务器端不起作用，但我们需要一个备选方案）
      const sessionCookie = request.cookies.get("session")
      if (sessionCookie) {
        try {
          const sessionData = JSON.parse(sessionCookie.value)
          userId = sessionData.user.id
        } catch (error) {
          console.error("解析会话cookie错误:", error)
        }
      }
    }

    // 如果仍然没有用户ID，尝试从表单数据中获取（仅用于测试）
    if (!userId) {
      userId = formData.get("userId") as string
    }

    if (!userId) {
      return NextResponse.json({ message: "未授权" }, { status: 401 })
    }

    // 保存文件
    const filePath = await saveTutorial(tutorialFile)

    // 创建教程
    const tutorial = await prisma.tutorial.create({
      data: {
        title,
        description,
        type,
        difficulty,
        filePath,
        engineType: engineTypeJson,
        userId,
        status: "PENDING", // 默认为待审核状态
      },
    })

    return NextResponse.json(
      {
        message: "教程上传成功，等待审核",
        tutorialId: tutorial.id,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("教程上传错误:", error)
    return NextResponse.json({ message: "教程上传失败，请稍后再试" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status") as "PENDING" | "APPROVED" | "REJECTED" | null

    const tutorials = await prisma.tutorial.findMany({
      where: status ? { status } : { status: "APPROVED" },
      include: {
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

    return NextResponse.json(tutorials)
  } catch (error) {
    console.error("获取教程列表错误:", error)
    return NextResponse.json({ message: "获取教程列表失败，请稍后再试" }, { status: 500 })
  }
}
