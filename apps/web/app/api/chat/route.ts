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

  // Mesajları modellere göre grupla
  const messagesByRole: Record<string, number> = { user: 0, assistant: 0 }
  const userTopics: string[] = []
  const modelResponses: Record<string, number> = {}

  for (const msg of messages) {
    messagesByRole[msg.role] = (messagesByRole[msg.role] || 0) + 1

    if (msg.role === 'user') {
      // Kullanıcı mesajının ilk 50 karakterini topic olarak al
      const topic = msg.content.substring(0, 50).replace(/\n/g, ' ')
      if (!userTopics.includes(topic)) {
        userTopics.push(topic)
      }
    } else if (msg.role === 'assistant') {
      const model = msg.model || 'unknown'
      modelResponses[model] = (modelResponses[model] || 0) + 1
    }
  }

  // Özet oluştur
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
 * Model seçimi - Tetikleyicilere göre
 */
function selectModel(userMessage: string, model?: string): string {
  // Eğer model belirtilmişse, onu kullan
  if (model) {
    return model
  }

  // Tetikleyicilere göre model seç
  const lowerMessage = userMessage.toLowerCase()

  // Kod analizi
  if (
    lowerMessage.includes('kod') ||
    lowerMessage.includes('mimarı') ||
    lowerMessage.includes('tasarım')
  ) {
    return 'anthropic/claude-sonnet-4' // Architect
  }

  // Haber/Trend
  if (
    lowerMessage.includes('haber') ||
    lowerMessage.includes('güncel') ||
    lowerMessage.includes('trend')
  ) {
    return 'x-ai/grok-4-1-fast' // News Anchor
  }

  // Etik/Çatışma
  if (
    lowerMessage.includes('etik') ||
    lowerMessage.includes('çatışma') ||
    lowerMessage.includes('uyuşmazlık')
  ) {
    return 'anthropic/claude-opus-4' // High Judge
  }

  // Denetim/Analiz
  if (
    lowerMessage.includes('denetim') ||
    lowerMessage.includes('kontrol') ||
    lowerMessage.includes('analiz et')
  ) {
    return 'deepseek/deepseek-reasoner' // Prosecutor
  }

  // Varsayılan
  return 'deepseek/deepseek-chat' // Fast Worker
}

/**
 * Failover Mantığı
 */
async function callOpenRouterWithFailover(
  messages: any[],
  selectedModel: string,
  retries: number = 0
): Promise<Response> {
  const MAX_RETRIES = 2

  // Failover modelleri
  const failoverChain: Record<string, string> = {
    'deepseek/deepseek-chat': 'google/gemini-2.5-flash-preview',
    'deepseek/deepseek-reasoner': 'anthropic/claude-haiku-4',
    'anthropic/claude-sonnet-4': 'google/gemini-2.5-flash-preview',
    'x-ai/grok-4-1-fast': 'google/gemini-2.0-flash-lite',
    'anthropic/claude-opus-4': 'anthropic/claude-haiku-4',
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://argume.ai',
        'X-Title': 'Argume.ai'
      },
      body: JSON.stringify({
        model: selectedModel,
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return response
  } catch (error) {
    console.error(
      `[Failover] Model ${selectedModel} failed:`,
      error
    )

    // Failover modeline geç
    if (retries < MAX_RETRIES) {
      const failoverModel = failoverChain[selectedModel]
      if (failoverModel) {
        console.log(`[Failover] Switching to ${failoverModel}`)
        return callOpenRouterWithFailover(messages, failoverModel, retries + 1)
      }
    }

    throw error
  }
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

    // Hafıza yönetimi: Son 5 mesaj tam, eskiler özet
    const organizedMessages = organizeMessages(messages)

    // Model seçimi
    const userMessage = messages[messages.length - 1]?.content || ''
    const selectedModel = selectModel(userMessage, model)

    console.log(`[API] Selected model: ${selectedModel}`)
    console.log(`[Memory Manager] Total: ${messages.length}, Full Context: ${organizedMessages.length}`)

    // Failover desteği ile API çağrısı
    const response = await callOpenRouterWithFailover(organizedMessages, selectedModel)

    // Return the streaming response directly
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
