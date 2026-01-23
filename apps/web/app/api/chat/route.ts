import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { messages, model } = await req.json()
    
    const API_KEY = process.env.OPENROUTER_API_KEY
    
    if (!API_KEY) {
      return NextResponse.json({ error: 'API Key is missing' }, { status: 500 })
    }

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
      const errorData = await response.json().catch(() => ({ error: 'OpenRouter API Error' }))
      return NextResponse.json({ error: 'OpenRouter Error', details: errorData }, { status: response.status })
    }

    // Stream yanıtını doğrudan frontend'e ilet
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  } catch (error: any) {
    console.error('Chat API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
