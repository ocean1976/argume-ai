import { NextRequest, NextResponse } from 'next/server'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

/**
 * Model seçimi - Tetikleyicilere göre
 */
function selectModelsByTriggers(userMessage: string): string[] {
  const models: string[] = []
  const lowerMessage = userMessage.toLowerCase()

  // Master Orchestrator (Her zaman başında)
  models.push('openai/gpt-4o-mini')

  // Fast Worker (Hızlı başlangıç)
  models.push('deepseek/deepseek-chat')

  // Tetikleyicilere göre
  if (
    lowerMessage.includes('kod') ||
    lowerMessage.includes('mimarı') ||
    lowerMessage.includes('tasarım')
  ) {
    models.push('anthropic/claude-sonnet-4')
  }

  if (
    lowerMessage.includes('haber') ||
    lowerMessage.includes('güncel') ||
    lowerMessage.includes('trend')
  ) {
    models.push('x-ai/grok-4-1-fast')
  }

  if (
    lowerMessage.includes('etik') ||
    lowerMessage.includes('çatışma') ||
    lowerMessage.includes('uyuşmazlık')
  ) {
    models.push('anthropic/claude-opus-4')
  }

  if (
    lowerMessage.includes('denetim') ||
    lowerMessage.includes('kontrol') ||
    lowerMessage.includes('analiz et')
  ) {
    models.push('deepseek/deepseek-reasoner')
  }

  // Librarian (Bağlam ve bilgi)
  models.push('google/gemini-2.5-flash-preview')

  // Synthesizer (En sonda)
  models.push('openai/gpt-5.2')

  return models
}

/**
 * Hafıza yönetimi - Son 5 mesaj tam, eskiler özet
 */
function organizeMessages(messages: any[]) {
  const FULL_CONTEXT_LIMIT = 5

  if (messages.length <= FULL_CONTEXT_LIMIT) {
    return messages
  }

  const fullContext = messages.slice(-FULL_CONTEXT_LIMIT)
  const olderMessages = messages.slice(0, -FULL_CONTEXT_LIMIT)
  const briefSummary = generateBrief(olderMessages)

  return [
    {
      role: 'system',
      content: briefSummary
    },
    ...fullContext
  ]
}

/**
 * Eski mesajlardan özet oluştur
 */
function generateBrief(messages: any[]): string {
  if (messages.length === 0) return ''

  const messagesByRole: Record<string, number> = { user: 0, assistant: 0 }
  const userTopics: string[] = []
  const modelResponses: Record<string, number> = {}

  for (const msg of messages) {
    messagesByRole[msg.role] = (messagesByRole[msg.role] || 0) + 1

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

  brief += `\nLütfen yukarıdaki özeti göz önünde bulundur ve aşağıdaki son mesajlara odaklan.`

  return brief
}

/**
 * Sıralı Konsey Tartışması API
 * 
 * Birden fazla modelin sırayla yanıt vermesini sağlar
 */
export async function POST(req: NextRequest) {
  try {
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      )
    }

    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Hafıza yönetimi
    const organizedMessages = organizeMessages(messages)

    // Model seçimi
    const userMessage = messages[messages.length - 1]?.content || ''
    const selectedModels = selectModelsByTriggers(userMessage)

    console.log(`[Council API] Selected models: ${selectedModels.join(' -> ')}`)

    // Sıralı olarak modelleri çalıştır ve yanıtları stream et
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let previousResponse = ''

          for (const model of selectedModels) {
            console.log(`[Council API] Calling model: ${model}`)

            // Bağlam oluştur
            const contextMessages = [
              ...organizedMessages,
              {
                role: 'system',
                content:
                  previousResponse
                    ? `Önceki tartışma:\n${previousResponse}\n\nSen şimdi sıradaki konsey üyesisin.`
                    : 'Sen konsey tartışmasının bir üyesisin.'
              }
            ]

            // API çağrısı
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://argume.ai',
                'X-Title': 'Argume.ai'
              },
              body: JSON.stringify({
                model,
                messages: contextMessages,
                stream: true,
                temperature: 0.7,
                max_tokens: 1500
              })
            })

            if (!response.ok) {
              throw new Error(`Model ${model} failed: ${response.status}`)
            }

            // Model başlığı gönder
            const modelName = model.split('/')[1] || model
            controller.enqueue(
              encoder.encode(`data: {"type":"model_start","model":"${modelName}"}\n\n`)
            )

            // Streaming yanıtı oku
            const reader = response.body?.getReader()
            if (!reader) throw new Error('No response body')

            const decoder = new TextDecoder()
            let modelResponse = ''

            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              const chunk = decoder.decode(value)
              const lines = chunk.split('\n')

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6))
                    if (data.choices?.[0]?.delta?.content) {
                      const content = data.choices[0].delta.content
                      modelResponse += content

                      // Content'i stream et
                      controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ type: 'content', content })}\n\n`)
                      )
                    }
                  } catch (e) {
                    // Ignore parsing errors
                  }
                }
              }
            }

            // Model bitiş sinyali
            controller.enqueue(
              encoder.encode(`data: {"type":"model_end","model":"${modelName}"}\n\n`)
            )

            previousResponse += `\n${modelName}: ${modelResponse}`
          }

          // Tartışma bitiş sinyali
          controller.enqueue(
            encoder.encode(`data: {"type":"council_end"}\n\n`)
          )

          controller.close()
        } catch (error) {
          console.error('Council API error:', error)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'error', error: String(error) })}\n\n`
            )
          )
          controller.close()
        }
      }
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  } catch (error) {
    console.error('Council API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
