import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

/**
 * DİKKAT: Bu API rotası test amaçlı tüm kimlik doğrulama (auth) kontrollerinden arındırılmıştır.
 * Giriş yapmadan doğrudan OpenRouter üzerinden AI yanıtları alınabilir.
 */
export async function POST(req: NextRequest) {
  try {
    // Gelen isteği oku
    const body = await req.json()
    const { messages, model } = body
    
    // API anahtarı (Kullanıcı tarafından sağlanan yeni anahtar)
    const API_KEY = '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'
    
    // Model eşleşmeleri
    const MODEL_MAP: Record<string, string> = {
      'gpt': 'openai/gpt-4o-mini',
      'claude': 'anthropic/claude-3.5-sonnet',
      'gemini': 'google/gemini-flash-1.5',
      'grok': 'x-ai/grok-2-1212',
      'deepseek': 'deepseek/deepseek-chat'
    }

    const selectedModelId = MODEL_MAP[model] || MODEL_MAP['gpt']

    // OpenRouter'a doğrudan istek yap (Hiçbir auth kontrolü yok)
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
        stream: true,
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

    // Yanıtı stream olarak döndür
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  } catch (error: any) {
    // Genel hata yakalama
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
