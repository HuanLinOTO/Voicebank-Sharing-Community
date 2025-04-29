import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { saveSong, saveCover } from "@/lib/file-utils"

export async function POST(request: NextRequest) {
  try {
    // 解析表单数据
    const formData = await request.formData()

    // 获取基本信息
    const title = formData.get("title") as string
    const vocaloidId = formData.get("vocaloidId") as string
    const creator = formData.get("creator") as string | null
    const bilibiliUrl = formData.get("bilibiliUrl") as string | null
    const lyrics = formData.get("lyrics") as string | null

    // 获取文件
    const songFile = formData.get("songFile") as File
    const coverFile = formData.get("coverFile") as File | null

    // 验证必填项
    if (!title || !vocaloidId || !songFile) {
      return NextResponse.json({ message: "缺少必填项" }, { status: 400 })
    }

    // 验证歌姬是否存在
    const vocaloid = await prisma.vocaloid.findUnique({
      where: { id: vocaloidId },
    })

    if (!vocaloid) {
      return NextResponse.json({ message: "未找到指定的歌姬" }, { status: 404 })
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
    const songPath = await saveSong(songFile)
    const coverPath = coverFile ? await saveCover(coverFile) : null

    // 创建歌曲
    const song = await prisma.song.create({
      data: {
        title,
        vocaloidId,
        userId,
        filePath: songPath,
        coverPath,
        creator,
        bilibiliUrl,
        lyrics,
      },
    })

    return NextResponse.json(
      {
        message: "歌曲上传成功",
        songId: song.id,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("歌曲上传错误:", error)
    return NextResponse.json({ message: "歌曲上传失败，请稍后再试" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const vocaloidId = searchParams.get("vocaloidId")

    const songs = await prisma.song.findMany({
      where: vocaloidId ? { vocaloidId } : undefined,
      include: {
        vocaloid: true,
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

    return NextResponse.json(songs)
  } catch (error) {
    console.error("获取歌曲列表错误:", error)
    return NextResponse.json({ message: "获取歌曲列表失败，请稍后再试" }, { status: 500 })
  }
}
