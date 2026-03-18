import { GoogleGenerativeAI } from '@google/generative-ai'
import { uploadContentImage } from '@/lib/storage'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

export async function generateCoverImage(
  title: string,
  excerpt: string
): Promise<string | null> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-preview-image-generation',
    })

    const prompt = `Professional blog cover image for an article titled "${title}". \
Abstract, modern, minimalist design. Dark navy blue background with cyan and violet accent colors. \
Geometric shapes, clean lines. No text. No people. No letters. \
Suitable for a web design and digital marketing agency blog. \
Context: ${excerpt.substring(0, 120)}`

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        // @ts-expect-error - responseModalities not yet in SDK types (v0.24.x)
        responseModalities: ['IMAGE', 'TEXT'],
      },
    })

    const parts = result.response.candidates?.[0]?.content?.parts ?? []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imagePart = parts.find((p: any) => p.inlineData?.mimeType?.startsWith('image/'))

    if (!imagePart?.inlineData?.data) {
      console.error('[ImageGen] No image data returned from Gemini')
      return null
    }

    const mimeType: string = imagePart.inlineData.mimeType as string
    const ext = mimeType === 'image/jpeg' ? 'jpg' : 'png'
    const imageBuffer = Buffer.from(imagePart.inlineData.data as string, 'base64')
    const filename = `${Date.now()}-cover.${ext}`
    const publicUrl = await uploadContentImage(imageBuffer, filename, mimeType)
    console.log('[ImageGen] Cover image uploaded:', publicUrl)
    return publicUrl
  } catch (error) {
    console.error(
      '[ImageGen] Image generation failed:',
      error instanceof Error ? error.message : error
    )
    return null // Non-fatal — content generation continues without image
  }
}
