/**
 * Memory Manager - Akıllı Hafıza Yönetimi
 * 
 * Strateji:
 * - Son 5 mesaj: Tam detaylarıyla (Full Context)
 * - 5+ mesajdan eski olanlar: Özet şeklinde (Brief/Summary)
 * 
 * Bu sayede:
 * 1. Token kullanımı optimize edilir
 * 2. AI'lar güncel tartışmaya odaklanır
 * 3. Eski bağlam kaybolmaz, sadece özetlenir
 */

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  model?: string
  timestamp: string
}

export interface MemoryContext {
  fullContext: Message[] // Son 5 mesaj
  briefContext: string | null // Eski mesajların özeti
  totalMessageCount: number
}

/**
 * Mesajları hafıza stratejisine göre ayırır
 */
export function organizeMemory(messages: Message[]): MemoryContext {
  const FULL_CONTEXT_LIMIT = 5

  if (messages.length <= FULL_CONTEXT_LIMIT) {
    // Eğer 5 mesajdan az ise hepsini tam context olarak kullan
    return {
      fullContext: messages,
      briefContext: null,
      totalMessageCount: messages.length,
    }
  }

  // Son 5 mesaj tam context
  const fullContext = messages.slice(-FULL_CONTEXT_LIMIT)

  // Eski mesajları özet yap
  const olderMessages = messages.slice(0, -FULL_CONTEXT_LIMIT)
  const briefContext = generateBrief(olderMessages)

  return {
    fullContext,
    briefContext,
    totalMessageCount: messages.length,
  }
}

/**
 * Eski mesajlardan özet oluştur
 */
function generateBrief(messages: Message[]): string {
  if (messages.length === 0) return ''

  // Mesajları modellere göre grupla
  const messagesByModel: Record<string, string[]> = {}
  let userTopics: string[] = []

  for (const msg of messages) {
    if (msg.role === 'user') {
      // Kullanıcı mesajının ilk 50 karakterini topic olarak al
      userTopics.push(msg.content.substring(0, 50))
    } else if (msg.model) {
      if (!messagesByModel[msg.model]) {
        messagesByModel[msg.model] = []
      }
      // Her modelin cevabının ilk 60 karakterini al
      messagesByModel[msg.model].push(msg.content.substring(0, 60))
    }
  }

  // Özet oluştur
  let brief = `[Önceki Tartışma Özeti - ${messages.length} mesaj]\n`

  if (userTopics.length > 0) {
    brief += `Konular: ${userTopics.join(' | ')}\n`
  }

  for (const [model, responses] of Object.entries(messagesByModel)) {
    brief += `${model}: ${responses.length} yanıt verdi\n`
  }

  return brief
}

/**
 * OpenRouter API'ya gönderilecek mesaj formatını hazırla
 */
export function prepareMessagesForAPI(memoryContext: MemoryContext): Array<{ role: string; content: string }> {
  const apiMessages: Array<{ role: string; content: string }> = []

  // Eğer brief context varsa, sistem mesajı olarak ekle
  if (memoryContext.briefContext) {
    apiMessages.push({
      role: 'system',
      content: `Tartışmanın önceki bağlamı:\n${memoryContext.briefContext}\n\nLütfen yukarıdaki özeti göz önünde bulundur ve aşağıdaki son mesajlara odaklan.`
    })
  }

  // Son 5 mesajı ekle
  for (const msg of memoryContext.fullContext) {
    apiMessages.push({
      role: msg.role,
      content: msg.content
    })
  }

  return apiMessages
}

/**
 * Hafıza istatistikleri
 */
export function getMemoryStats(memoryContext: MemoryContext) {
  return {
    fullContextCount: memoryContext.fullContext.length,
    hasBriefContext: !!memoryContext.briefContext,
    totalMessages: memoryContext.totalMessageCount,
    briefLength: memoryContext.briefContext?.length || 0,
  }
}
