import fs from "fs"
import path from "path"
import { randomUUID } from "crypto"

// 确保数据目录存在
const DATA_DIR = path.join(process.cwd(), "data")
const VOICEBANKS_DIR = path.join(DATA_DIR, "voicebanks")
const AVATARS_DIR = path.join(DATA_DIR, "avatars")
const IMAGES_DIR = path.join(DATA_DIR, "images")
const SAMPLES_DIR = path.join(DATA_DIR, "samples")
const SONGS_DIR = path.join(DATA_DIR, "songs")
const COVERS_DIR = path.join(DATA_DIR, "covers")
const TUTORIALS_DIR = path.join(DATA_DIR, "tutorials")

// 确保所有目录存在
export function ensureDirectories() {
  const dirs = [DATA_DIR, VOICEBANKS_DIR, AVATARS_DIR, IMAGES_DIR, SAMPLES_DIR, SONGS_DIR, COVERS_DIR, TUTORIALS_DIR]

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }
}

// 保存上传的文件
export async function saveFile(file: File, directory: string): Promise<string> {
  ensureDirectories()

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // 生成唯一文件名
  const fileName = `${randomUUID()}${path.extname(file.name)}`
  const filePath = path.join(directory, fileName)

  // 写入文件
  fs.writeFileSync(filePath, buffer)

  // 返回相对路径
  return path.relative(DATA_DIR, filePath)
}

// 保存声库文件
export async function saveVoicebank(file: File): Promise<string> {
  return saveFile(file, VOICEBANKS_DIR)
}

// 保存头像文件
export async function saveAvatar(file: File): Promise<string> {
  return saveFile(file, AVATARS_DIR)
}

// 保存立绘文件
export async function saveImage(file: File): Promise<string> {
  return saveFile(file, IMAGES_DIR)
}

// 保存试听曲文件
export async function saveSample(file: File): Promise<string> {
  return saveFile(file, SAMPLES_DIR)
}

// 保存歌曲文件
export async function saveSong(file: File): Promise<string> {
  return saveFile(file, SONGS_DIR)
}

// 保存封面文件
export async function saveCover(file: File): Promise<string> {
  return saveFile(file, COVERS_DIR)
}

// 保存教程文件
export async function saveTutorial(file: File): Promise<string> {
  return saveFile(file, TUTORIALS_DIR)
}

// 获取文件的完整路径
export function getFilePath(relativePath: string): string {
  return path.join(DATA_DIR, relativePath)
}

// 删除文件
export function deleteFile(relativePath: string): void {
  const fullPath = getFilePath(relativePath)
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath)
  }
}

// 获取文件流
export function createReadStream(relativePath: string) {
  const fullPath = getFilePath(relativePath)
  return fs.createReadStream(fullPath)
}
