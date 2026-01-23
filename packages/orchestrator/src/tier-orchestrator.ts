/**
 * Tier Orchestrator - Kademeli ve Rotasyonel Model Yönetimi
 * 
 * Sorunun karmaşıklığına göre:
 * - Tier 1: Rotasyonel (tek model)
 * - Tier 2: Tartışma (Primary + Critic)
 * - Tier 3: Konsey (Primary + Critic + Synthesis)
 */

import {
  determineTierByComplexity,
  getNextTier1Model,
  getTier2Models,
  getTier3Models,
  calculateTierCost,
  type ModelPool,
} from './model-pools'

export interface TierOrchestrationResult {
  tier: 1 | 2 | 3
  models: {
    primary: string
    critic?: string
    synthesis?: string
  }
  strategy: 'ROTATION' | 'DISCUSSION' | 'COUNCIL'
  estimatedCost: number
  description: string
}

/**
 * Sorunun karmaşıklığını analiz et ve uygun Tier'ı seç
 */
export function analyzeSoruComplexity(userMessage: string): {
  tier: 1 | 2 | 3
  complexity: 'SIMPLE' | 'MODERATE' | 'COMPLEX'
  indicators: string[]
} {
  const tier = determineTierByComplexity(userMessage)
  const indicators: string[] = []

  // Karmaşıklık göstergelerini topla
  if (userMessage.length > 500) indicators.push('Uzun mesaj')
  if (/mimarı|tasarım|algoritma|sistem/i.test(userMessage))
    indicators.push('Teknik kavramlar')
  if (/ve|ancak|fakat|ama/i.test(userMessage)) indicators.push('Çoklu bölümler')
  if (/kod|function|class|api/i.test(userMessage)) indicators.push('Kod örneği')
  if (/etik|çatışma|uyuşmazlık/i.test(userMessage)) indicators.push('Etik sorular')

  const complexityMap = {
    1: 'SIMPLE' as const,
    2: 'MODERATE' as const,
    3: 'COMPLEX' as const,
  }

  return {
    tier,
    complexity: complexityMap[tier],
    indicators,
  }
}

/**
 * Tier 1 Orchestration - Rotasyonel (Tek Model)
 */
export function orchestrateTier1(): TierOrchestrationResult {
  const model = getNextTier1Model()

  return {
    tier: 1,
    models: {
      primary: model,
    },
    strategy: 'ROTATION',
    estimatedCost: calculateTierCost(1),
    description: `Basit soru - Rotasyonel model: ${model.split('/')[1]}`,
  }
}

/**
 * Tier 2 Orchestration - Tartışma (Primary + Critic)
 */
export function orchestrateTier2(): TierOrchestrationResult {
  const { primary, critic } = getTier2Models()

  return {
    tier: 2,
    models: {
      primary,
      critic,
    },
    strategy: 'DISCUSSION',
    estimatedCost: calculateTierCost(2),
    description: `Orta seviye - Tartışma: ${primary.split('/')[1]} (Primary) + ${critic.split('/')[1]} (Critic)`,
  }
}

/**
 * Tier 3 Orchestration - Konsey (Primary + Critic + Synthesis)
 */
export function orchestrateTier3(): TierOrchestrationResult {
  const { primary, critic, synthesis } = getTier3Models()

  return {
    tier: 3,
    models: {
      primary,
      critic,
      synthesis,
    },
    strategy: 'COUNCIL',
    estimatedCost: calculateTierCost(3),
    description: `Uzman seviye - Konsey: ${primary.split('/')[1]} (Primary) + ${critic.split('/')[1]} (Critic) + ${synthesis.split('/')[1]} (Synthesis)`,
  }
}

/**
 * Ana Orchestration Fonksiyonu - Soruyu Analiz Edip Uygun Tier'ı Seç
 */
export function orchestrateByComplexity(
  userMessage: string
): TierOrchestrationResult {
  const analysis = analyzeSoruComplexity(userMessage)

  console.log(`[Tier Orchestrator] Complexity: ${analysis.complexity}`)
  console.log(`[Tier Orchestrator] Indicators: ${analysis.indicators.join(', ')}`)

  switch (analysis.tier) {
    case 1:
      return orchestrateTier1()
    case 2:
      return orchestrateTier2()
    case 3:
      return orchestrateTier3()
    default:
      return orchestrateTier1()
  }
}

/**
 * Tier 1 - Rotasyonel Tartışma Akışı
 * Tek model yanıt verir, müdahaleler eklenir
 */
export function buildTier1ConversationFlow(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>
): Array<{ role: string; content: string }> {
  return [
    ...conversationHistory,
    {
      role: 'user',
      content: userMessage,
    },
  ]
}

/**
 * Tier 2 - Tartışma Akışı
 * Primary yanıt verir, Critic onu eleştirir
 */
export function buildTier2ConversationFlow(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>,
  primaryResponse: string
): Array<{ role: string; content: string }> {
  return [
    ...conversationHistory,
    {
      role: 'user',
      content: userMessage,
    },
    {
      role: 'system',
      content: `[Primary Model Yaniti]\n${primaryResponse}\n\n[Critic Model - Lutfen yukaridaki yaniti analiz et, eleştir ve gelistir]`,
    },
  ]
}

/**
 * Tier 3 - Konsey Akışı
 * Primary yanıt verir, Critic eleştirir, Synthesis sentez yapar
 */
export function buildTier3ConversationFlow(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>,
  primaryResponse: string,
  criticResponse: string
): Array<{ role: string; content: string }> {
  return [
    ...conversationHistory,
    {
      role: 'user',
      content: userMessage,
    },
    {
      role: 'system',
      content: `[Primary Model Yaniti]\n${primaryResponse}\n\n[Critic Model Yaniti]\n${criticResponse}\n\n[Synthesis Model - Lutfen yukaridaki iki yaniti degerlendirerek en iyi sentezi olustur]`,
    },
  ]
}

/**
 * Tier Escalation - Sorunun Karmaşıklığı Artarsa Tier Yükselt
 */
export function checkForEscalation(
  currentTier: 1 | 2 | 3,
  userMessage: string,
  conversationLength: number
): 1 | 2 | 3 {
  // Eğer konuşma çok uzunlaşırsa Tier yükselt
  if (conversationLength > 20 && currentTier < 3) {
    return (currentTier + 1) as 1 | 2 | 3
  }

  // Eğer yeni soru çok karmaşıksa Tier yükselt
  const newTier = determineTierByComplexity(userMessage)
  if (newTier > currentTier) {
    console.log(
      `[Tier Escalation] Escalating from Tier ${currentTier} to Tier ${newTier}`
    )
    return newTier
  }

  return currentTier
}

/**
 * Tier İstatistikleri
 */
export function getTierStats() {
  return {
    tier1: {
      description: 'Basit sorular - Rotasyonel model',
      avgCost: calculateTierCost(1),
      strategy: 'ROTATION',
    },
    tier2: {
      description: 'Orta seviye - Primary + Critic tartışması',
      avgCost: calculateTierCost(2),
      strategy: 'DISCUSSION',
    },
    tier3: {
      description: 'Uzman seviye - Primary + Critic + Synthesis konseyi',
      avgCost: calculateTierCost(3),
      strategy: 'COUNCIL',
    },
  }
}
