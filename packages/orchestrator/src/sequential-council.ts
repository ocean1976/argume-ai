/**
 * Sequential Council Flow - Sıralı Konsey Tartışması
 * 
 * Modeller sırayla konuşur, her biri öncekinin çıktısını bağlam olarak alır.
 * Araya müdahaleler (interjections) asenkron olarak eklenir.
 */

import {
  MODEL_REGISTRY,
  getModelByRole,
  getModelByTrigger,
  type ModelConfig,
  type TriggerType,
} from '@argume/models'

export interface CouncilMember {
  model: ModelConfig
  order: number
  response: string
  interjections: Array<{
    modelId: string
    modelName: string
    type: 'WARNING' | 'INFO' | 'INSIGHT'
    content: string
  }>
  executionTime: number
  tokenCount: number
  cost: number
}

export interface SequentialCouncilFlow {
  userMessage: string
  councilMembers: CouncilMember[]
  synthesisResponse: string
  totalCost: number
  totalExecutionTime: number
  triggers: TriggerType[]
}

/**
 * Konsey üyelerini tetikleyicilere göre sırala
 */
function orderCouncilMembers(triggers: TriggerType[]): ModelConfig[] {
  const council: ModelConfig[] = []
  const addedModels = new Set<string>()

  // 1. Master Orchestrator (Her zaman başında)
  const orchestrator = getModelByRole('MASTER_ORCHESTRATOR')
  if (orchestrator && !addedModels.has(orchestrator.id)) {
    council.push(orchestrator)
    addedModels.add(orchestrator.id)
  }

  // 2. Fast Worker (Hızlı başlangıç)
  const fastWorker = getModelByRole('FAST_WORKER')
  if (fastWorker && !addedModels.has(fastWorker.id)) {
    council.push(fastWorker)
    addedModels.add(fastWorker.id)
  }

  // 3. Tetikleyicilere göre uzmanlar
  for (const trigger of triggers) {
    const model = getModelByTrigger(trigger)
    if (model && !addedModels.has(model.id)) {
      council.push(model)
      addedModels.add(model.id)
    }
  }

  // 4. Librarian (Bağlam ve bilgi)
  const librarian = getModelByRole('LIBRARIAN')
  if (librarian && !addedModels.has(librarian.id)) {
    council.push(librarian)
    addedModels.add(librarian.id)
  }

  // 5. High Judge (Etik ve çatışma çözümü - sonda)
  if (triggers.includes('ETHICS') || triggers.includes('CONFLICT')) {
    const judge = getModelByRole('HIGH_JUDGE')
    if (judge && !addedModels.has(judge.id)) {
      council.push(judge)
      addedModels.add(judge.id)
    }
  }

  // 6. Synthesizer (En sonda - son söz)
  const synthesizer = getModelByRole('SYNTHESIZER')
  if (synthesizer && !addedModels.has(synthesizer.id)) {
    council.push(synthesizer)
    addedModels.add(synthesizer.id)
  }

  return council
}

/**
 * Müdahale Tetikleyicileri - Bir model konuşurken diğerinin araya girmesi
 */
function checkForInterjections(
  speakingModelId: string,
  speakingModelResponse: string,
  councilMembers: ModelConfig[]
): Array<{
  modelId: string
  modelName: string
  type: 'WARNING' | 'INFO' | 'INSIGHT'
  content: string
}> {
  const interjections: Array<{
    modelId: string
    modelName: string
    type: 'WARNING' | 'INFO' | 'INSIGHT'
    content: string
  }> = []

  const responseLength = speakingModelResponse.length
  const hasRiskKeywords = /risk|tehlike|dikkat|uyarı|hata|sorun/i.test(
    speakingModelResponse
  )
  const hasInfoKeywords = /bilgi|not|ek olarak|ayrıca|bağlam|kaynak/i.test(
    speakingModelResponse
  )
  const hasConflict = /çatışma|uyuşmazlık|anlaşmazlık|karşıt/i.test(
    speakingModelResponse
  )

  // Risk Uyarısı - Prosecutor'ı çağır
  if (hasRiskKeywords && responseLength > 100) {
    const prosecutor = getModelByRole('PROSECUTOR')
    if (prosecutor && prosecutor.id !== speakingModelId) {
      interjections.push({
        modelId: prosecutor.id,
        modelName: prosecutor.name,
        type: 'WARNING',
        content:
          '⚠️ Risk Uyarısı: Bu noktadaki potansiyel riskleri ve yan etkilerini daha detaylı analiz etmeliyiz.',
      })
    }
  }

  // Bilgi Ekleme - Librarian'ı çağır
  if (hasInfoKeywords && responseLength > 150) {
    const librarian = getModelByRole('LIBRARIAN')
    if (librarian && librarian.id !== speakingModelId) {
      interjections.push({
        modelId: librarian.id,
        modelName: librarian.name,
        type: 'INFO',
        content:
          'ℹ️ Ek Bağlam: Bu konuyla ilgili ek bilgi ve kaynaklar ekleyebilirim.',
      })
    }
  }

  // Çatışma Çözümü - High Judge'ı çağır
  if (hasConflict) {
    const judge = getModelByRole('HIGH_JUDGE')
    if (judge && judge.id !== speakingModelId) {
      interjections.push({
        modelId: judge.id,
        modelName: judge.name,
        type: 'INSIGHT',
        content:
          '⚖️ Etik Perspektif: Bu çatışmayı çözmek için etik ve dengeli bir yaklaşım önerebilirim.',
      })
    }
  }

  // Yaratıcı Fikir - Visionary'yi çağır (düşük olasılıkla)
  if (responseLength > 200 && Math.random() < 0.4) {
    const visionary = getModelByRole('VISIONARY')
    if (visionary && visionary.id !== speakingModelId) {
      interjections.push({
        modelId: visionary.id,
        modelName: visionary.name,
        type: 'INSIGHT',
        content:
          '💡 Yaratıcı Bakış: Bu soruna tamamen farklı bir açıdan yaklaşabiliriz.',
      })
    }
  }

  return interjections
}

/**
 * Sıralı Konsey Tartışması - Ana Fonksiyon
 * 
 * Bu fonksiyon:
 * 1. Modelleri sıraya koyar
 * 2. Her modeli sırayla çalıştırır
 * 3. Müdahaleleri tetikler
 * 4. Sonunda sentez yapar
 */
export async function executeSequentialCouncil(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>,
  triggers: TriggerType[]
): Promise<SequentialCouncilFlow> {
  const startTime = Date.now()

  console.log(`[Sequential Council] Starting with triggers: ${triggers.join(', ')}`)

  // 1. Konsey üyelerini sırala
  const councilMembers = orderCouncilMembers(triggers)

  console.log(
    `[Sequential Council] Council assembled (${councilMembers.length} members): ${councilMembers
      .map(m => m.name)
      .join(' -> ')}`
  )

  // 2. Her modeli sırayla çalıştır (simüle)
  const responses: CouncilMember[] = []
  let previousResponse = ''

  for (let i = 0; i < councilMembers.length; i++) {
    const model = councilMembers[i]
    const memberStartTime = Date.now()

    // Bağlam oluştur: Önceki modelin çıktısı + konuşma geçmişi
    const context = previousResponse
      ? `Önceki tartışma:\n${previousResponse}\n\nYeni katkı:`
      : ''

    // Mock yanıt (gerçek uygulamada API çağrısı yapılacak)
    const mockResponse = `[${model.name}] Yanıt: ${userMessage.substring(0, 40)}... ${context.substring(0, 50)}`

    previousResponse += `\n${model.name}: ${mockResponse}`

    // Müdahale kontrolleri
    const interjections = checkForInterjections(
      model.id,
      mockResponse,
      councilMembers
    )

    const executionTime = Date.now() - memberStartTime
    const tokenCount = Math.ceil(mockResponse.length / 4) // Rough estimate
    const cost = (tokenCount / 1_000_000) * model.costPerMTok

    responses.push({
      model,
      order: i + 1,
      response: mockResponse,
      interjections,
      executionTime,
      tokenCount,
      cost,
    })

    console.log(
      `[Sequential Council] ${model.name} responded (${executionTime}ms, ${interjections.length} interjections)`
    )
  }

  // 3. Sentez (Synthesis) - Tüm argümanları toplayıp son söz
  const synthesizer = getModelByRole('SYNTHESIZER')
  const synthesisResponse = synthesizer
    ? `[${synthesizer.name}] Sentez: Tüm görüşleri değerlendirerek, en uygun çözüm şudur...`
    : 'Tartışma tamamlandı.'

  const totalExecutionTime = Date.now() - startTime
  const totalCost = responses.reduce((sum, r) => sum + r.cost, 0)

  return {
    userMessage,
    councilMembers: responses,
    synthesisResponse,
    totalCost,
    totalExecutionTime,
    triggers,
  }
}

/**
 * Konsey Tartışmasını Supabase'e kaydet
 */
export async function saveCouncilDiscussionToDatabase(
  conversationId: string,
  flow: SequentialCouncilFlow
) {
  // Bu fonksiyon, tartışmanın tamamını Supabase'e kaydetmek için kullanılacak
  // Şimdilik mock
  console.log(
    `[Database] Saving council discussion to conversation ${conversationId}`
  )

  return {
    conversationId,
    discussionId: `disc_${Date.now()}`,
    memberCount: flow.councilMembers.length,
    totalCost: flow.totalCost,
    executionTime: flow.totalExecutionTime,
  }
}

/**
 * Konsey İstatistikleri
 */
export function getSequentialCouncilStats(flow: SequentialCouncilFlow) {
  const avgResponseTime =
    flow.councilMembers.reduce((sum, m) => sum + m.executionTime, 0) /
    flow.councilMembers.length

  const totalInterjections = flow.councilMembers.reduce(
    (sum, m) => sum + m.interjections.length,
    0
  )

  return {
    totalMembers: flow.councilMembers.length,
    averageResponseTime: Math.round(avgResponseTime),
    totalInterjections,
    costPerMember: flow.totalCost / flow.councilMembers.length,
    totalExecutionTime: flow.totalExecutionTime,
  }
}
