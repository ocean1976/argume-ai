import { NextRequest, NextResponse } from 'next/server'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

/**
 * Tier Orchestration - Sorunun karmaşıklığına göre model seç
 */
function determineTierByComplexity(userMessage: string): 1 | 2 | 3 {
  const messageLength = userMessage.length
  const wordCount = userMessage.split(/\s+/).length

  const hasComplexKeywords = /mimarı|tasarım|algoritma|sistem|analiz|strateji|etik|çatışma|uyuşmazlık/i.test(
    userMessage
  )
  const hasCodeKeywords = /kod|function|class|api|database|sql|python|javascript/i.test(
    userMessage
  )
  const hasMultipleParts = /ve|ancak|fakat|ama|çünkü|eğer|ise/i.test(userMessage)

  if (
    (messageLength > 500 && hasComplexKeywords) ||
    (hasCodeKeywords && hasMultipleParts) ||
    wordCount > 150
  ) {
    return 3
  }

  if (
    (messageLength > 200 && hasComplexKeywords) ||
    (hasCodeKeywords && messageLength > 150) ||
    (hasMultipleParts && messageLength > 150)
  ) {
    return 2
  }

  return 1
}

/**
 * Tier 1 - Rotasyonel Model Seçimi
 */
let tier1Index = 0
const tier1Models = [
  'deepseek/deepseek-chat',
  'google/gemini-2.5-flash-preview',
  'openai/gpt-4o-mini',
]

function getNextTier1Model(): string {
  const model = tier1Models[tier1Index % tier1Models.length]
  tier1Index = (tier1Index + 1) % tier1Models.length
  return model
}

/**
 * Tier 2 - Primary + Critic Model Seçimi
 */
let tier2Index = 0
const tier2Models = [
  'anthropic/claude-sonnet-4',
  'deepseek/deepseek-reasoner',
  'x-ai/grok-4-1-fast',
]

function getTier2Models(): { primary: string; critic: string } {
  const primaryIndex = tier2Index % tier2Models.length
  const criticIndex = (tier2Index + 1) % tier2Models.length
  tier2Index = (tier2Index + 1) % tier2Models.length

  return {
    primary: tier2Models[primaryIndex],
    critic: tier2Models[criticIndex],
  }
}

/**
 * Tier 3 - Primary + Critic + Synthesis Model Seçimi
 */
let tier3Index = 0
const tier3Models = [
  'anthropic/claude-opus-4',
  'google/gemini-3-pro',
  'openai/gpt-5.2',
]

function getTier3Models(): {
  primary: string
  critic: string
  synthesis: string
} {
  const primaryIndex = tier3Index % tier3Models.length
  const criticIndex = (tier3Index + 1) % tier3Models.length
  const synthesisIndex = (tier3Index + 2) % tier3Models.length
  tier3Index = (tier3Index + 1) % tier3Models.length

  return {
    primary: tier3Models[primaryIndex],
    critic: tier3Models[criticIndex],
    synthesis: tier3Models[synthesisIndex],
  }
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

  let brief = `[Onceki Tartisma Ozeti - ${messages.length} mesaj]\n\n`

  brief += `Tartisilan Konular:\n`
  userTopics.forEach((topic, i) => {
    brief += `${i + 1}. ${topic}\n`
  })

  brief += `\nModel Katilimi:\n`
  Object.entries(modelResponses).forEach(([model, count]) => {
    brief += `- ${model}: ${count} yanit\n`
  })

  brief += `\nLutfen yukaridaki ozeti goz onunde bulundur ve asagidaki son mesajlara odaklan.`

  return brief
}

/**
 * OpenRouter API çağrısı
 */
async function callOpenRouterAPI(
  messages: any[],
  model: string
): Promise<Response> {
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
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 1500
    })
  })

  if (!response.ok) {
    throw new Error(`Model ${model} failed: ${response.status}`)
  }

  return response
}

/**
 * Sıralı Konsey Tartışması API
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

    // Sorunun karmaşıklığını analiz et
    const userMessage = messages[messages.length - 1]?.content || ''
    const tier = determineTierByComplexity(userMessage)

    console.log(`[Council API] Tier determined: ${tier}`)

    // Tier'a göre modelleri seç
    let selectedModels: { primary: string; critic?: string; synthesis?: string }

    if (tier === 1) {
      selectedModels = { primary: getNextTier1Model() }
      console.log(`[Council API] Tier 1 - Rotasyonel: ${selectedModels.primary}`)
    } else if (tier === 2) {
      selectedModels = getTier2Models()
      console.log(
        `[Council API] Tier 2 - Tartisma: ${selectedModels.primary} + ${selectedModels.critic}`
      )
    } else {
      selectedModels = getTier3Models()
      console.log(
        `[Council API] Tier 3 - Konsey: ${selectedModels.primary} + ${selectedModels.critic} + ${selectedModels.synthesis}`
      )
    }

    // Streaming yanıtı oluştur
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let accumulatedResponses: Record<string, string> = {}

          // Tier 1 - Tek model
          if (tier === 1) {
            const response = await callOpenRouterAPI(
              organizedMessages,
              selectedModels.primary
            )

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'model_start', model: selectedModels.primary })}\n\n`
              )
            )

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

                      controller.enqueue(
                        encoder.encode(
                          `data: ${JSON.stringify({ type: 'content', content })}\n\n`
                        )
                      )
                    }
                  } catch (e) {
                    // Ignore parsing errors
                  }
                }
              }
            }

            accumulatedResponses[selectedModels.primary] = modelResponse
          }
          // Tier 2 - Primary + Critic
          else if (tier === 2 && selectedModels.critic) {
            // Primary
            let primaryResponse = await callOpenRouterAPI(
              organizedMessages,
              selectedModels.primary
            )

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'model_start', model: selectedModels.primary })}\n\n`
              )
            )

            const reader1 = primaryResponse.body?.getReader()
            if (!reader1) throw new Error('No response body')

            const decoder = new TextDecoder()
            let primaryText = ''

            while (true) {
              const { done, value } = await reader1.read()
              if (done) break

              const chunk = decoder.decode(value)
              const lines = chunk.split('\n')

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6))
                    if (data.choices?.[0]?.delta?.content) {
                      const content = data.choices[0].delta.content
                      primaryText += content

                      controller.enqueue(
                        encoder.encode(
                          `data: ${JSON.stringify({ type: 'content', content })}\n\n`
                        )
                      )
                    }
                  } catch (e) {
                    // Ignore
                  }
                }
              }
            }

            accumulatedResponses[selectedModels.primary] = primaryText

            // Critic
            const criticMessages = [
              ...organizedMessages,
              {
                role: 'system',
                content: `[Primary Model Yaniti]\n${primaryText}\n\n[Critic Model - Lutfen yukaridaki yaniti analiz et, elestir ve gelistir]`
              }
            ]

            const criticResponse = await callOpenRouterAPI(
              criticMessages,
              selectedModels.critic
            )

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'model_start', model: selectedModels.critic })}\n\n`
              )
            )

            const reader2 = criticResponse.body?.getReader()
            if (!reader2) throw new Error('No response body')

            let criticText = ''

            while (true) {
              const { done, value } = await reader2.read()
              if (done) break

              const chunk = decoder.decode(value)
              const lines = chunk.split('\n')

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6))
                    if (data.choices?.[0]?.delta?.content) {
                      const content = data.choices[0].delta.content
                      criticText += content

                      controller.enqueue(
                        encoder.encode(
                          `data: ${JSON.stringify({ type: 'content', content })}\n\n`
                        )
                      )
                    }
                  } catch (e) {
                    // Ignore
                  }
                }
              }
            }

            accumulatedResponses[selectedModels.critic] = criticText
          }
          // Tier 3 - Primary + Critic + Synthesis
          else if (tier === 3 && selectedModels.critic && selectedModels.synthesis) {
            // Primary
            let primaryResponse = await callOpenRouterAPI(
              organizedMessages,
              selectedModels.primary
            )

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'model_start', model: selectedModels.primary })}\n\n`
              )
            )

            const reader1 = primaryResponse.body?.getReader()
            if (!reader1) throw new Error('No response body')

            const decoder = new TextDecoder()
            let primaryText = ''

            while (true) {
              const { done, value } = await reader1.read()
              if (done) break

              const chunk = decoder.decode(value)
              const lines = chunk.split('\n')

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6))
                    if (data.choices?.[0]?.delta?.content) {
                      const content = data.choices[0].delta.content
                      primaryText += content

                      controller.enqueue(
                        encoder.encode(
                          `data: ${JSON.stringify({ type: 'content', content })}\n\n`
                        )
                      )
                    }
                  } catch (e) {
                    // Ignore
                  }
                }
              }
            }

            accumulatedResponses[selectedModels.primary] = primaryText

            // Critic
            const criticMessages = [
              ...organizedMessages,
              {
                role: 'system',
                content: `[Primary Model Yaniti]\n${primaryText}\n\n[Critic Model - Lutfen yukaridaki yaniti analiz et, elestir ve gelistir]`
              }
            ]

            const criticResponse = await callOpenRouterAPI(
              criticMessages,
              selectedModels.critic
            )

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'model_start', model: selectedModels.critic })}\n\n`
              )
            )

            const reader2 = criticResponse.body?.getReader()
            if (!reader2) throw new Error('No response body')

            let criticText = ''

            while (true) {
              const { done, value } = await reader2.read()
              if (done) break

              const chunk = decoder.decode(value)
              const lines = chunk.split('\n')

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6))
                    if (data.choices?.[0]?.delta?.content) {
                      const content = data.choices[0].delta.content
                      criticText += content

                      controller.enqueue(
                        encoder.encode(
                          `data: ${JSON.stringify({ type: 'content', content })}\n\n`
                        )
                      )
                    }
                  } catch (e) {
                    // Ignore
                  }
                }
              }
            }

            accumulatedResponses[selectedModels.critic] = criticText

            // Synthesis
            const synthesisMessages = [
              ...organizedMessages,
              {
                role: 'system',
                content: `[Primary Model Yaniti]\n${primaryText}\n\n[Critic Model Yaniti]\n${criticText}\n\n[Synthesis Model - Lutfen yukaridaki iki yaniti degerlendirerek en iyi sentezi olustur]`
              }
            ]

            const synthesisResponse = await callOpenRouterAPI(
              synthesisMessages,
              selectedModels.synthesis
            )

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'model_start', model: selectedModels.synthesis })}\n\n`
              )
            )

            const reader3 = synthesisResponse.body?.getReader()
            if (!reader3) throw new Error('No response body')

            let synthesisText = ''

            while (true) {
              const { done, value } = await reader3.read()
              if (done) break

              const chunk = decoder.decode(value)
              const lines = chunk.split('\n')

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6))
                    if (data.choices?.[0]?.delta?.content) {
                      const content = data.choices[0].delta.content
                      synthesisText += content

                      controller.enqueue(
                        encoder.encode(
                          `data: ${JSON.stringify({ type: 'content', content })}\n\n`
                        )
                      )
                    }
                  } catch (e) {
                    // Ignore
                  }
                }
              }
            }

            accumulatedResponses[selectedModels.synthesis] = synthesisText
          }

          // Tartışma bitiş sinyali
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'council_end' })}\n\n`)
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
