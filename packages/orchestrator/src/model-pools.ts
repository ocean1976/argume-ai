/**
 * Model Pools - Tier'lara göre Model Havuzları
 * 
 * Stratejiler:
 * - Tier 1: Rotasyonel (Round-Robin) - Her soru farklı model
 * - Tier 2: Tartışma (Primary + Critic)
 * - Tier 3: Konsey (Primary + Critic + Synthesis)
 */

export interface ModelPool {
  tier: 1 | 2 | 3
  models: string[] // OpenRouter model IDs
  strategy: 'ROTATION' | 'DISCUSSION' | 'COUNCIL'
  costPerQuery: number // Ortalama maliyet
  description: string
}

export interface RotationState {
  tier1Index: number
  tier2Index: number
  tier3Index: number
  lastUpdated: Date
}

/**
 * TIER 1 - Basit Sorular (Rotasyonel)
 * Maliyet: Düşük (~$0.15 - $2.50)
 * Strateji: Her soru farklı model
 */
export const TIER1_POOL: ModelPool = {
  tier: 1,
  models: [
    'deepseek/deepseek-chat',           // $0.27 in / $1.10 out
    'google/gemini-2.5-flash-preview',  // $0.30 in / $2.50 out
    'openai/gpt-4o-mini',               // $0.15 in / $0.60 out
  ],
  strategy: 'ROTATION',
  costPerQuery: 1.20, // Ortalama
  description: 'Basit sorular için hızlı ve ucuz modeller. Rotasyonel olarak çalışır.',
}

/**
 * TIER 2 - Orta Seviye Sorular (Primary + Critic)
 * Maliyet: Orta (~$0.50 - $15)
 * Strateji: İki model tartışır (Primary + Critic)
 */
export const TIER2_POOL: ModelPool = {
  tier: 2,
  models: [
    'anthropic/claude-sonnet-4',        // $3.00 in / $15.00 out
    'deepseek/deepseek-reasoner',       // $0.55 in / $2.20 out
    'x-ai/grok-4-1-fast',               // $2.00 in / $8.00 out
  ],
  strategy: 'DISCUSSION',
  costPerQuery: 8.50, // Ortalama (2 model)
  description: 'Orta seviye sorular için tartışma. Primary + Critic modelleri konuşur.',
}

/**
 * TIER 3 - Uzman Seviye Sorular (Primary + Critic + Synthesis)
 * Maliyet: Yüksek (~$10 - $25)
 * Strateji: Üç model konsey yapar (Primary + Critic + Judge)
 */
export const TIER3_POOL: ModelPool = {
  tier: 3,
  models: [
    'anthropic/claude-opus-4',          // $15.00 in / $75.00 out
    'google/gemini-3-pro',              // $15.00 in / $30.00 out
    'openai/gpt-5.2',                   // $15.00 in / $60.00 out
  ],
  strategy: 'COUNCIL',
  costPerQuery: 45.00, // Ortalama (3 model)
  description: 'Uzman seviye sorular için tam konsey. Primary + Critic + Synthesis.',
}

/**
 * Model Havuzlarını Merkezi Olarak Yönet
 */
export const MODEL_POOLS = {
  tier1: TIER1_POOL,
  tier2: TIER2_POOL,
  tier3: TIER3_POOL,
}

/**
 * Rotasyon Durumu - Tier 1 için sıradaki modeli takip et
 */
let rotationState: RotationState = {
  tier1Index: 0,
  tier2Index: 0,
  tier3Index: 0,
  lastUpdated: new Date(),
}

/**
 * Tier 1 - Rotasyonel Model Seçimi
 * Her çağrıda sıradaki modeli döndür
 */
export function getNextTier1Model(): string {
  const models = TIER1_POOL.models
  const model = models[rotationState.tier1Index % models.length]
  rotationState.tier1Index = (rotationState.tier1Index + 1) % models.length
  return model
}

/**
 * Tier 2 - Primary + Critic Model Seçimi
 */
export function getTier2Models(): { primary: string; critic: string } {
  const models = TIER2_POOL.models
  const primaryIndex = rotationState.tier2Index % models.length
  const criticIndex = (rotationState.tier2Index + 1) % models.length
  rotationState.tier2Index = (rotationState.tier2Index + 1) % models.length

  return {
    primary: models[primaryIndex],
    critic: models[criticIndex],
  }
}

/**
 * Tier 3 - Primary + Critic + Synthesis Model Seçimi
 */
export function getTier3Models(): {
  primary: string
  critic: string
  synthesis: string
} {
  const models = TIER3_POOL.models
  const primaryIndex = rotationState.tier3Index % models.length
  const criticIndex = (rotationState.tier3Index + 1) % models.length
  const synthesisIndex = (rotationState.tier3Index + 2) % models.length
  rotationState.tier3Index = (rotationState.tier3Index + 1) % models.length

  return {
    primary: models[primaryIndex],
    critic: models[criticIndex],
    synthesis: models[synthesisIndex],
  }
}

/**
 * Sorunun Karmaşıklığına Göre Tier Belirle
 */
export function determineTierByComplexity(userMessage: string): 1 | 2 | 3 {
  const messageLength = userMessage.length
  const wordCount = userMessage.split(/\s+/).length

  // Karmaşıklık göstergeleri
  const hasComplexKeywords = /mimarı|tasarım|algoritma|sistem|analiz|strateji|etik|çatışma|uyuşmazlık/i.test(
    userMessage
  )
  const hasCodeKeywords = /kod|function|class|api|database|sql|python|javascript/i.test(
    userMessage
  )
  const hasMultipleParts = /ve|ancak|fakat|ama|çünkü|eğer|ise/i.test(userMessage)

  // Tier 3 (Uzman)
  if (
    (messageLength > 500 && hasComplexKeywords) ||
    (hasCodeKeywords && hasMultipleParts) ||
    wordCount > 150
  ) {
    return 3
  }

  // Tier 2 (Orta)
  if (
    (messageLength > 200 && hasComplexKeywords) ||
    (hasCodeKeywords && messageLength > 150) ||
    (hasMultipleParts && messageLength > 150)
  ) {
    return 2
  }

  // Tier 1 (Basit)
  return 1
}

/**
 * Tier'ın Maliyetini Hesapla
 */
export function calculateTierCost(tier: 1 | 2 | 3): number {
  const pools = {
    1: TIER1_POOL,
    2: TIER2_POOL,
    3: TIER3_POOL,
  }
  return pools[tier].costPerQuery
}

/**
 * Rotasyon Durumunu Sıfırla (Test için)
 */
export function resetRotationState(): void {
  rotationState = {
    tier1Index: 0,
    tier2Index: 0,
    tier3Index: 0,
    lastUpdated: new Date(),
  }
}

/**
 * Rotasyon Durumunu Getir (Debug için)
 */
export function getRotationState(): RotationState {
  return { ...rotationState }
}

/**
 * Tüm Havuzlar Hakkında İstatistik
 */
export function getPoolStats() {
  return {
    tier1: {
      modelCount: TIER1_POOL.models.length,
      strategy: TIER1_POOL.strategy,
      avgCost: TIER1_POOL.costPerQuery,
      models: TIER1_POOL.models,
    },
    tier2: {
      modelCount: TIER2_POOL.models.length,
      strategy: TIER2_POOL.strategy,
      avgCost: TIER2_POOL.costPerQuery,
      models: TIER2_POOL.models,
    },
    tier3: {
      modelCount: TIER3_POOL.models.length,
      strategy: TIER3_POOL.strategy,
      avgCost: TIER3_POOL.costPerQuery,
      models: TIER3_POOL.models,
    },
  }
}
