import { NextRequest, NextResponse } from 'next/server'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

/**
 * Hafıza yönetimi - Son 5 mesaj tam, eskiler özet
 */
function organizeMessages(messages: any[]) {
  const FULL_CONTEXT_LIMIT = 5

  if (messages.length <= FULL_CONTEXT_LIMIT) {
    return messages
  }

  // Son 5 mesaj tam context
  const fullContext = messages.slice(-FULL_CONTEXT_LIMIT)

  // Eski mesajlardan özet oluştur
  const olderMessages = messages.slice(0, -FULL_CONTEXT_LIMIT)
  const briefSummary = generateBrief(olderMessages)

  // Sistem mesajı olarak özeti ekle
  const organizedMessages = [
    {
      role: 'system',
      content: briefSummary
    },
    ...fullContext
  ]

  return organizedMessages
}

/**
 * Eski mesajlardan özet oluştur
 */
function generateBrief(messages: any[]): string {
  if (messages.length === 0) return ''

  const userTopics: string[] = []
  const modelResponses: Record<string, number> = {}

  for (const msg of messages) {
    if (msg.role === 'user') {
      const topic = msg.content.substring(0, 50).replace(/\n/g, ' ')
      if (!userTopics.includes(topic)) {
        userTopics.push(topic)
      }
    } else if (msg.role === 'assistant') {
      const model = msg.model || 'unknown'
      modelResponses[model] = (modelResponses[model] || 0) + 1
    }
  }

  let brief = `[📋 Önceki Tartışma Özeti - ${messages.length} mesaj]\n\n`
  brief += `Tartışılan Konular:\n`
  userTopics.forEach((topic, i) => {
    brief += `${i + 1}. ${topic}\n`
  })

  brief += `\nModel Katılımı:\n`
  Object.entries(modelResponses).forEach(([model, count]) => {
    brief += `- ${model}: ${count} yanıt\n`
  })

  brief += `\nLütfen yukarıdaki özeti göz önünde bulundur ve aşağıdaki son mesajlara odaklan. Tartışmanın akışını koru ve tutarlı bir argüman sun.`
  return brief
}

/**
 * Model ID'lerini OpenRouter formatına çevir
 */
const MODEL_MAP: Record<string, string> = {
  'gpt': 'openai/gpt-4o-mini',
  'claude': 'anthropic/claude-3.5-sonnet',
  'gemini': 'google/gemini-flash-1.5',
  'grok': 'x-ai/grok-2-1212',
  'deepseek': 'deepseek/deepseek-chat'
}

export async function POST(req: NextRequest) {
  try {
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      )
    }

    const { messages, model } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Hafıza yönetimi
    const organizedMessages = organizeMessages(messages)

    // Model seçimi
    const selectedModelId = MODEL_MAP[model] || MODEL_MAP['gpt']

    console.log(`[API] Requesting model: ${selectedModelId}`)

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://argume.ai',
        'X-Title': 'Argume.ai'
      },
      body: JSON.stringify({
        model: selectedModelId,
        messages: organizedMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[OpenRouter Error]', errorData)
      return NextResponse.json(
        { error: errorData.error?.message || 'OpenRouter API error' },
        { status: response.status }
      )
    }

    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
