import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    if (id) {
      // 获取单个歌姬
      const vocaloid = await prisma.vocaloid.findUnique({
        where: { id },
        include: {
          voicebanks: {
            where: {
              status: "APPROVED",
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          songs: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      })

      if (!vocaloid) {
        return NextResponse.json({ message: "未找到指定的歌姬" }, { status: 404 })
      }

      return NextResponse.json(vocaloid)
    } else {
      // 获取所有歌姬
      const vocaloids = await prisma.vocaloid.findMany({
        orderBy: {
          name: "asc",
        },
      })

      return NextResponse.json(vocaloids)
    }
  } catch (error) {
    console.error("获取歌姬错误:", error)
    return NextResponse.json({ message: "获取歌姬失败，请稍后再试" }, { status: 500 })
  }
}
