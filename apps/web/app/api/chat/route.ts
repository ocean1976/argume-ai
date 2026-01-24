import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

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
    const { messages, model, workflowStep } = body
    
    const API_KEY = process.env.OPENROUTER_API_KEY || ''
    
    if (!API_KEY) {
      return NextResponse.json({ error: 'API Key is missing' }, { status: 500 })
    }

    let selectedModelId = MODELS.TIER1.GPT4O_MINI
    let systemPrompt = "You are a helpful AI assistant."

    if (model === 'gpt') {
      selectedModelId = MODELS.TIER1.GPT4O_MINI
      systemPrompt = "You are the Orchestrator. Analyze the user's request and provide a clear direction."
    } else if (model === 'claude') {
      selectedModelId = MODELS.TIER2.CLAUDE_SONNET
      systemPrompt = "You are the Architect. Provide detailed, structured, and well-thought-out answers or code."
    } else if (model === 'deepseek') {
      selectedModelId = MODELS.TIER1.DEEPSEEK_CHAT
      systemPrompt = "You are the Fast Worker. Provide a quick, accurate, and concise initial response."
    } else if (model === 'prosecutor') {
      selectedModelId = MODELS.TIER2.DEEPSEEK_REASONER
      systemPrompt = "You are the Prosecutor. Critically analyze the previous responses, find errors, and suggest better approaches."
    } else if (model === 'grok') {
      selectedModelId = MODELS.TIER2.GROK_FAST
      systemPrompt = "You are the News Anchor. Focus on the most up-to-date information and real-time context."
    } else if (model === 'judge') {
      selectedModelId = MODELS.TIER3.CLAUDE_OPUS
      systemPrompt = "You are the High Judge. Review all previous arguments and provide a final, definitive, and ethical conclusion."
    } else if (model === 'gemini') {
      selectedModelId = MODELS.TIER1.GEMINI_FLASH
      systemPrompt = "You are the Librarian. Focus on document analysis, facts, and comprehensive data retrieval."
    }

    if (workflowStep === 'thesis') systemPrompt += " Your role in this debate is to present the THESIS (🛡️)."
    if (workflowStep === 'antithesis') systemPrompt += " Your role in this debate is to present the ANTITHESIS (⚔️). Challenge the previous points."
    if (workflowStep === 'synthesis') systemPrompt += " Your role in this debate is to provide the SYNTHESIS (◆). Combine all views into a final answer."

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://clashof.ai',
        'X-Title': 'Clash of AI'
      },
      body: JSON.stringify({
        model: selectedModelId,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m: any) => ({ role: m.role, content: m.content }))
        ],
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
