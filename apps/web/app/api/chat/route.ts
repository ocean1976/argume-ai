import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'edge' // Vercel Edge Runtime kullanarak daha hızlı ve engelsiz yanıt alalım

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, model } = body
    
    // API anahtarını doğrudan buraya yazıyoruz (Vercel env bazen geç yansıyabiliyor)
    const API_KEY = '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'
    
    const MODEL_MAP: Record<string, string> = {
      'gpt': 'openai/gpt-4o-mini',
      'claude': 'anthropic/claude-3.5-sonnet',
      'gemini': 'google/gemini-flash-1.5',
      'grok': 'x-ai/grok-2-1212',
      'deepseek': 'deepseek/deepseek-chat'
    }

    const selectedModelId = MODEL_MAP[model] || MODEL_MAP['gpt']

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

    if (!response.ok) {
      const errorText = await response.text()
      return new NextResponse(JSON.stringify({ error: 'OpenRouter Error', details: errorText }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
