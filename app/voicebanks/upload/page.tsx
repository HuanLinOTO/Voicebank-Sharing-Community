"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "@/lib/session-provider"

const engines = [
  { id: "utau", label: "UTAU" },
  { id: "deepfusion", label: "DeeFusion" },
  { id: "niaoniao", label: "袅袅" },
  { id: "vogen", label: "Vogen" },
  { id: "deepvocal", label: "DeepVocal" },
  { id: "vocalsharp", label: "VocalSharp" },
]

const languages = [
  { id: "chinese", label: "汉语" },
  { id: "japanese", label: "日语" },
  { id: "english", label: "英语" },
  { id: "chinese_dialect", label: "中文方言" },
  { id: "korean", label: "韩语" },
]

export default function UploadVoicebankPage() {
  const { session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedEngines, setSelectedEngines] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [otherEngine, setOtherEngine] = useState("")
  const [otherLanguage, setOtherLanguage] = useState("")
  const [voicebankFile, setVoicebankFile] = useState<File | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [sampleFile, setSampleFile] = useState<File | null>(null)

  // 检查用户是否已登录
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-bold">请先登录</h1>
        <p className="mt-2 text-muted-foreground">您需要登录才能上传声库</p>
        <Button asChild className="mt-4">
          <a href="/login">前往登录</a>
        </Button>
      </div>
    )
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)

    // 添加引擎和语种
    const finalEngines = [...selectedEngines]
    if (otherEngine && !selectedEngines.includes(otherEngine)) {
      finalEngines.push(otherEngine)
    }

    const finalLanguages = [...selectedLanguages]
    if (otherLanguage && !selectedLanguages.includes(otherLanguage)) {
      finalLanguages.push(otherLanguage)
    }

    formData.set("engines", JSON.stringify(finalEngines))
    formData.set("languages", JSON.stringify(finalLanguages))

    // 添加文件
    if (voicebankFile) formData.set("voicebankFile", voicebankFile)
    if (avatarFile) formData.set("avatarFile", avatarFile)
    if (imageFile) formData.set("imageFile", imageFile)
    if (sampleFile) formData.set("sampleFile", sampleFile)

    // 添加用户ID
    if (session?.user?.id) {
      formData.set("userId", session.user.id)
    }

    try {
      // 验证必填项
      if (
        !formData.get("name") ||
        !voicebankFile ||
        !avatarFile ||
        !sampleFile ||
        finalEngines.length === 0 ||
        finalLanguages.length === 0
      ) {
        throw new Error("请填写所有必填项")
      }

      const response = await fetch("/api/voicebanks", {
        method: "POST",
        body: formData,
        headers: session
          ? {
              Authorization: `Bearer ${JSON.stringify(session)}`,
            }
          : undefined,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "上传失败")
      }

      toast({
        title: "上传成功",
        description: "您的声库已提交，等待审核",
      })
      router.push("/dashboard")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "上传失败",
        description: error instanceof Error ? error.message : "请稍后再试",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>上传声库</CardTitle>
          <CardDescription>填写声库信息并上传相关文件</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">基础信息</h3>

              <div className="grid gap-2">
                <Label htmlFor="name">歌姬名称 *</Label>
                <Input id="name" name="name" required />
              </div>

              <div className="grid gap-2">
                <Label>歌姬性别 *</Label>
                <RadioGroup defaultValue="UNKNOWN" name="gender">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="MALE" id="male" />
                    <Label htmlFor="male">男</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="FEMALE" id="female" />
                    <Label htmlFor="female">女</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="UNKNOWN" id="unknown" />
                    <Label htmlFor="unknown">不明</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid gap-2">
                <Label>引擎 *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {engines.map((engine) => (
                    <div key={engine.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`engine-${engine.id}`}
                        checked={selectedEngines.includes(engine.label)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedEngines([...selectedEngines, engine.label])
                          } else {
                            setSelectedEngines(selectedEngines.filter((e) => e !== engine.label))
                          }
                        }}
                      />
                      <Label htmlFor={`engine-${engine.id}`}>{engine.label}</Label>
                    </div>
                  ))}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox
                    id="engine-other"
                    checked={!!otherEngine}
                    onCheckedChange={(checked) => {
                      if (!checked) setOtherEngine("")
                    }}
                  />
                  <Label htmlFor="engine-other">其他</Label>
                  <Input
                    value={otherEngine}
                    onChange={(e) => setOtherEngine(e.target.value)}
                    placeholder="请输入其他引擎"
                    disabled={!otherEngine && otherEngine !== ""}
                    className="max-w-[200px]"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>语种 *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {languages.map((language) => (
                    <div key={language.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`language-${language.id}`}
                        checked={selectedLanguages.includes(language.label)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedLanguages([...selectedLanguages, language.label])
                          } else {
                            setSelectedLanguages(selectedLanguages.filter((l) => l !== language.label))
                          }
                        }}
                      />
                      <Label htmlFor={`language-${language.id}`}>{language.label}</Label>
                    </div>
                  ))}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox
                    id="language-other"
                    checked={!!otherLanguage}
                    onCheckedChange={(checked) => {
                      if (!checked) setOtherLanguage("")
                    }}
                  />
                  <Label htmlFor="language-other">其他</Label>
                  <Input
                    value={otherLanguage}
                    onChange={(e) => setOtherLanguage(e.target.value)}
                    placeholder="请输入其他语种"
                    disabled={!otherLanguage && otherLanguage !== ""}
                    className="max-w-[200px]"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="voiceprovider">配音者</Label>
                <Input id="voiceprovider" name="voiceprovider" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">文件上传</h3>

              <div className="grid gap-2">
                <Label htmlFor="voicebankFile">声库文件 * (支持zip、7z、rar等压缩包)</Label>
                <Input
                  id="voicebankFile"
                  type="file"
                  accept=".zip,.7z,.rar"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setVoicebankFile(e.target.files[0])
                    }
                  }}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="avatarFile">头像 * (100x100像素)</Label>
                <Input
                  id="avatarFile"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setAvatarFile(e.target.files[0])
                    }
                  }}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="imageFile">立绘 (最大5000x5000像素)</Label>
                <Input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImageFile(e.target.files[0])
                    }
                  }}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sampleFile">试听曲 * (MP3格式，最大10MB)</Label>
                <Input
                  id="sampleFile"
                  type="file"
                  accept=".mp3"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSampleFile(e.target.files[0])
                    }
                  }}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">关联设置</h3>

              <div className="grid gap-2">
                <Label htmlFor="description">声库描述</Label>
                <Textarea id="description" name="description" />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="isNewVocaloid" name="isNewVocaloid" defaultChecked />
                  <Label htmlFor="isNewVocaloid">这是一个新的歌姬</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  如果这是已有歌姬的其他声库，请取消勾选并在下方选择关联的歌姬
                </p>
              </div>

              {/* 这里可以添加关联现有歌姬的选择器，但需要从API获取现有歌姬列表 */}
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "上传中..." : "提交声库"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
