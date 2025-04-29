import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { saveVoicebank, saveAvatar, saveImage, saveSample } from "@/lib/file-utils"

export async function POST(request: NextRequest) {
  try {
    // 解析表单数据
    const formData = await request.formData()

    // 获取基本信息
    const name = formData.get("name") as string
    const gender = formData.get("gender") as "MALE" | "FEMALE" | "UNKNOWN"
    const enginesJson = formData.get("engines") as string
    const languagesJson = formData.get("languages") as string
    const voiceprovider = formData.get("voiceprovider") as string | null
    const description = formData.get("description") as string | null
    const isNewVocaloid = formData.get("isNewVocaloid") === "on"
    const vocaloidId = formData.get("vocaloidId") as string | null

    // 获取文件
    const voicebankFile = formData.get("voicebankFile") as File
    const avatarFile = formData.get("avatarFile") as File
    const imageFile = formData.get("imageFile") as File | null
    const sampleFile = formData.get("sampleFile") as File

    // 验证必填项
    if (!name || !gender || !enginesJson || !languagesJson || !voicebankFile || !avatarFile || !sampleFile) {
      return NextResponse.json({ message: "缺少必填项" }, { status: 400 })
    }

    // 解析JSON
    const engines = JSON.parse(enginesJson)
    const languages = JSON.parse(languagesJson)

    // 验证引擎和语种
    if (!engines.length || !languages.length) {
      return NextResponse.json({ message: "请至少选择一个引擎和一种语言" }, { status: 400 })
    }

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
      // 从请求体中获取用户ID（仅用于测试，实际应该从会话中获取）
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

    if (!userId) {
      return NextResponse.json({ message: "未授权" }, { status: 401 })
    }

    // 保存文件
    const voicebankPath = await saveVoicebank(voicebankFile)
    const avatarPath = await saveAvatar(avatarFile)
    const imagePath = imageFile ? await saveImage(imageFile) : null
    const samplePath = await saveSample(sampleFile)

    // 创建或更新歌姬
    let vocaloid

    if (isNewVocaloid) {
      // 创建新歌姬
      vocaloid = await prisma.vocaloid.create({
        data: {
          name,
          gender,
          engines: JSON.stringify(engines),
          languages: JSON.stringify(languages),
          avatarUrl: avatarPath,
          imageUrl: imagePath,
        },
      })
    } else if (vocaloidId) {
      // 使用现有歌姬
      vocaloid = await prisma.vocaloid.findUnique({
        where: { id: vocaloidId },
      })

      if (!vocaloid) {
        return NextResponse.json({ message: "未找到指定的歌姬" }, { status: 404 })
      }
    } else {
      return NextResponse.json({ message: "请选择一个现有歌姬或创建新歌姬" }, { status: 400 })
    }

    // 创建声库
    const voicebank = await prisma.voicebank.create({
      data: {
        vocaloidId: vocaloid.id,
        userId,
        filePath: voicebankPath,
        samplePath,
        voiceprovider,
        status: "PENDING", // 默认为待审核状态
      },
    })

    return NextResponse.json(
      {
        message: "声库上传成功，等待审核",
        voicebankId: voicebank.id,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("声库上传错误:", error)
    return NextResponse.json({ message: "声库上传失败，请稍后再试" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status") as "PENDING" | "APPROVED" | "REJECTED" | null

    const voicebanks = await prisma.voicebank.findMany({
      where: status ? { status } : undefined,
      include: {
        vocaloid: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(voicebanks)
  } catch (error) {
    console.error("获取声库列表错误:", error)
    return NextResponse.json({ message: "获取声库列表失败，请稍后再试" }, { status: 500 })
  }
}
