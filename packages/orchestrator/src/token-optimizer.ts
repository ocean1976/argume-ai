/**
 * Token Optimizer - Token Maliyetini Düşürmek İçin Optimizasyon Stratejileri
 * 
 * Stratejiler:
 * 1. Context Pruning: Sadece gerekli kısımları gönder
 * 2. Prompt Refinement: Sistem mesajlarını kısalt
 * 3. Output Limiting: Max tokens sınırı koy
 * 4. Caching: Benzer sorular için sonuçları yeniden kullan
 */

export interface TokenOptimizationConfig {
  enableContextPruning: boolean
  maxContextLength: number // Karakter cinsinden
  enableOutputLimiting: boolean
  maxOutputTokens: number
  enableCaching: boolean
  cacheTTL: number // Saniye cinsinden
}

export const DEFAULT_OPTIMIZATION_CONFIG: TokenOptimizationConfig = {
  enableContextPruning: true,
  maxContextLength: 2000, // ~500 token
  enableOutputLimiting: true,
  maxOutputTokens: 1000,
  enableCaching: true,
  cacheTTL: 3600, // 1 saat
}

/**
 * Context Pruning - Bağlamı Kısalt
 * 
 * Sadece en önemli kısımları tutup, gereksiz detayları çıkar
 */
export function pruneContext(
  context: string,
  maxLength: number = 2000
): string {
  if (context.length <= maxLength) {
    return context
  }

  // En son kısmı al (daha önemli)
  let pruned = context.substring(context.length - maxLength)

  // Eğer ortasında kesilmişse, tam bir cümle bulana kadar geri git
  const lastPeriod = pruned.lastIndexOf('.')
  if (lastPeriod > maxLength * 0.7) {
    pruned = pruned.substring(0, lastPeriod + 1)
  }

  return `[... OZET BAGLAM ...]\n${pruned}`
}

/**
 * Prompt Refinement - Sistem Mesajlarını Rafine Et
 * 
 * Uzun talimatları kısa ve öz hale getir
 */
export function refineSystemPrompt(originalPrompt: string): string {
  // Gereksiz açıklamaları kaldır
  let refined = originalPrompt
    .replace(/Lütfen.*?detayli/gi, 'Detayli')
    .replace(/Asagidaki.*?analiz et/gi, 'Analiz et')
    .replace(/Görevin.*?\n\n/gi, '')
    .replace(/\n\n/g, '\n')

  // Maksimum 500 karakter tut
  if (refined.length > 500) {
    refined = refined.substring(0, 500) + '...'
  }

  return refined
}

/**
 * Output Limiting - Çıktı Sınırı Koy
 * 
 * Modellere max_tokens parametresi ekle
 */
export function getOptimizedMaxTokens(
  tier: 1 | 2 | 3,
  role: 'advocate' | 'critic' | 'mediator' | 'default'
): number {
  const limits: Record<number, Record<string, number>> = {
    1: {
      default: 500, // Tier 1: Kısa ve hızlı
    },
    2: {
      advocate: 800,
      critic: 700,
      default: 600,
    },
    3: {
      advocate: 1000,
      critic: 800,
      mediator: 1500, // Arabulucu daha uzun olabilir
      default: 1000,
    },
  }

  return limits[tier]?.[role] || limits[tier]?.['default'] || 500
}

/**
 * Bağlam Enjeksiyonu - Optimize Edilmiş Mesaj Hazırlama
 */
export function buildOptimizedMessages(
  conversationHistory: Array<{ role: string; content: string }>,
  newMessage: string,
  config: TokenOptimizationConfig = DEFAULT_OPTIMIZATION_CONFIG
): Array<{ role: string; content: string }> {
  const messages: Array<{ role: string; content: string }> = []

  // Son 5 mesajı al
  const recentMessages = conversationHistory.slice(-5)

  // Eğer daha eski mesajlar varsa, onları özet yap
  if (conversationHistory.length > 5 && config.enableContextPruning) {
    const olderMessages = conversationHistory.slice(0, -5)
    const briefContext = generateBrief(olderMessages)

    messages.push({
      role: 'system',
      content: `[Onceki Tartisma Ozeti]\n${briefContext}`,
    })
  }

  // Son 5 mesajı ekle
  for (const msg of recentMessages) {
    messages.push(msg)
  }

  // Yeni mesajı ekle
  messages.push({
    role: 'user',
    content: newMessage,
  })

  return messages
}

/**
 * Özet Oluştur
 */
function generateBrief(messages: Array<{ role: string; content: string }>): string {
  const userMessages = messages.filter(m => m.role === 'user')
  const assistantMessages = messages.filter(m => m.role === 'assistant')

  let brief = `${userMessages.length} soru, ${assistantMessages.length} yanit.\n`

  // İlk ve son konuları özetle
  if (userMessages.length > 0) {
    brief += `Konular: ${userMessages.map(m => m.content.substring(0, 30)).join(' | ')}`
  }

  return brief
}

/**
 * Token Sayısını Tahmin Et
 */
export function estimateTokenCount(text: string): number {
  // Basit tahmin: 1 token ≈ 4 karakter
  return Math.ceil(text.length / 4)
}

/**
 * Maliyeti Hesapla
 */
export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  model: string
): number {
  // OpenRouter fiyatlandırması (örnek)
  const prices: Record<string, { input: number; output: number }> = {
    'deepseek/deepseek-chat': { input: 0.27 / 1_000_000, output: 1.1 / 1_000_000 },
    'openai/gpt-4o-mini': { input: 0.15 / 1_000_000, output: 0.6 / 1_000_000 },
    'google/gemini-2.5-flash-preview': { input: 0.3 / 1_000_000, output: 2.5 / 1_000_000 },
    'anthropic/claude-sonnet-4': { input: 3.0 / 1_000_000, output: 15.0 / 1_000_000 },
    'anthropic/claude-opus-4': { input: 15.0 / 1_000_000, output: 75.0 / 1_000_000 },
  }

  const price = prices[model] || { input: 1 / 1_000_000, output: 1 / 1_000_000 }
  return inputTokens * price.input + outputTokens * price.output
}

/**
 * Optimizasyon İstatistikleri
 */
export function getOptimizationStats(
  originalTokens: number,
  optimizedTokens: number
): {
  reduction: number
  reductionPercent: number
  estimatedSavings: string
} {
  const reduction = originalTokens - optimizedTokens
  const reductionPercent = (reduction / originalTokens) * 100

  return {
    reduction,
    reductionPercent: Math.round(reductionPercent),
    estimatedSavings: `~${Math.round(reductionPercent)}% token tasarrufu`,
  }
}

/**
 * Caching Key Oluştur
 */
export function generateCacheKey(userMessage: string, tier: number): string {
  // Basit hash
  const hash = userMessage
    .toLowerCase()
    .replace(/\s+/g, '_')
    .substring(0, 50)

  return `tier${tier}_${hash}`
}

/**
 * Tier'a Göre Optimizasyon Profili
 */
export function getOptimizationProfile(tier: 1 | 2 | 3): TokenOptimizationConfig {
  const profiles: Record<number, TokenOptimizationConfig> = {
    1: {
      enableContextPruning: true,
      maxContextLength: 1000, // Tier 1: Daha agresif kısaltma
      enableOutputLimiting: true,
      maxOutputTokens: 500,
      enableCaching: true,
      cacheTTL: 3600,
    },
    2: {
      enableContextPruning: true,
      maxContextLength: 2000,
      enableOutputLimiting: true,
      maxOutputTokens: 1000,
      enableCaching: true,
      cacheTTL: 1800,
    },
    3: {
      enableContextPruning: true,
      maxContextLength: 3000, // Tier 3: Daha fazla bağlam
      enableOutputLimiting: true,
      maxOutputTokens: 1500,
      enableCaching: false, // Tier 3 sonuçları çok spesifik
      cacheTTL: 0,
    },
  }

  return profiles[tier] || DEFAULT_OPTIMIZATION_CONFIG
}
