import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

/**
 * DİKKAT: Bu API rotası test amaçlı tüm kimlik doğrulama (auth) kontrollerinden arındırılmıştır.
 * Türkçe karakter sorununu çözmek için stream geçici olarak false yapılmıştır.
 */
export async function POST(req: NextRequest) {
  try {
    // Gelen isteği oku
    const body = await req.json()
    const { messages, model } = body
    
    // API anahtarı (Güvenlik için environment variable'a taşındı)
    const API_KEY = process.env.OPENROUTER_API_KEY || ''
    
    if (!API_KEY) {
      return NextResponse.json({ error: 'API Key is missing in environment' }, { status: 500 })
    }

    // Model eşleşmeleri
    const MODEL_MAP: Record<string, string> = {
      'gpt': 'openai/gpt-4o-mini',
      'claude': 'anthropic/claude-3.5-sonnet',
      'gemini': 'google/gemini-flash-1.5',
      'grok': 'x-ai/grok-2-1212',
      'deepseek': 'deepseek/deepseek-chat'
    }

    const selectedModelId = MODEL_MAP[model] || MODEL_MAP['gpt']

    // OpenRouter'a doğrudan istek yap
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://argume.ai',
        'X-Title': 'Argume.ai'
      },
      body: JSON.stringify({
        model: selectedModelId,
        messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
        stream: false, // Türkçe karakter sorunu için geçici olarak false yapıldı
        temperature: 0.7
      })
    })

    // Hata kontrolü
    if (!response.ok) {
      const errorText = await response.text()
      return new NextResponse(JSON.stringify({ error: 'OpenRouter Error', details: errorText }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const data = await response.json()
    
    // Stream kapalı olduğu için doğrudan JSON yanıtı döndür
    return NextResponse.json(data)
    
  } catch (error: any) {
    // Genel hata yakalama
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
