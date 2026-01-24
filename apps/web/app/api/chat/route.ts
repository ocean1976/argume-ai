import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

// MODEL TIER SİSTEMİ
const MODELS = {
  TIER1: {
    GPT4O_MINI: 'openai/gpt-4o-mini',
    DEEPSEEK_CHAT: 'deepseek/deepseek-chat',
    GEMINI_FLASH: 'google/gemini-flash-1.5'
  },
  TIER2: {
    CLAUDE_SONNET: 'anthropic/claude-3.5-sonnet',
    DEEPSEEK_REASONER: 'deepseek/deepseek-reasoner',
    GROK_FAST: 'x-ai/grok-2-1212'
  },
  TIER3: {
    CLAUDE_OPUS: 'anthropic/claude-3-opus',
    GEMINI_PRO: 'google/gemini-pro'
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, model } = body
    
    const API_KEY = process.env.OPENROUTER_API_KEY || ''
    
    if (!API_KEY) {
      return NextResponse.json({ error: 'API Key is missing' }, { status: 500 })
    }

    // Model Seçimi (Soru tipine göre orkestrasyon)
    let selectedModelId = MODELS.TIER1.GPT4O_MINI // Default

    if (model === 'gpt') selectedModelId = MODELS.TIER1.GPT4O_MINI
    else if (model === 'claude') selectedModelId = MODELS.TIER2.CLAUDE_SONNET
    else if (model === 'gemini') selectedModelId = MODELS.TIER1.GEMINI_FLASH
    else if (model === 'grok') selectedModelId = MODELS.TIER2.GROK_FAST
    else if (model === 'deepseek') selectedModelId = MODELS.TIER1.DEEPSEEK_CHAT
    else if (model === 'prosecutor') selectedModelId = MODELS.TIER2.DEEPSEEK_REASONER
    else if (model === 'judge') selectedModelId = MODELS.TIER3.CLAUDE_OPUS

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
        stream: false,
        temperature: model === 'prosecutor' ? 0.3 : 0.7
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      return new NextResponse(JSON.stringify({ error: 'OpenRouter Error', details: errorText }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
