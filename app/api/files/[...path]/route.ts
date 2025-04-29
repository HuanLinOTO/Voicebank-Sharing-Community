import { type NextRequest, NextResponse } from "next/server"
import { getFilePath } from "@/lib/file-utils"
import fs from "fs"
import path from "path"

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const filePath = (await params).path.join("/")
    const fullPath = getFilePath(filePath)

    // 检查文件是否存在
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ message: "文件不存在" }, { status: 404 })
    }

    // 获取文件类型
    const ext = path.extname(fullPath).toLowerCase()
    let contentType = "application/octet-stream"

    switch (ext) {
      case ".jpg":
      case ".jpeg":
        contentType = "image/jpeg"
        break
      case ".png":
        contentType = "image/png"
        break
      case ".gif":
        contentType = "image/gif"
        break
      case ".mp3":
        contentType = "audio/mpeg"
        break
      case ".pdf":
        contentType = "application/pdf"
        break
      case ".zip":
        contentType = "application/zip"
        break
      case ".7z":
        contentType = "application/x-7z-compressed"
        break
      case ".rar":
        contentType = "application/vnd.rar"
        break
    }

    // 读取文件
    const fileBuffer = fs.readFileSync(fullPath)

    // 返回文件
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${path.basename(fullPath)}"`,
      },
    })
  } catch (error) {
    console.error("文件读取错误:", error)
    return NextResponse.json({ message: "文件读取失败，请稍后再试" }, { status: 500 })
  }
}
