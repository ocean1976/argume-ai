/**
 * Sequential Council Flow - Sıralı Konsey Tartışması
 * 
 * Modeller sırayla konuşur, her biri öncekinin çıktısını bağlam olarak alır.
 * Araya müdahaleler (interjections) asenkron olarak eklenir ve bağlama enjekte edilir.
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
    type: 'WARNING' | 'INFO' | 'INSIGHT' | 'CONFLICT'
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
  type: 'WARNING' | 'INFO' | 'INSIGHT' | 'CONFLICT'
  content: string
}> {
  const interjections: Array<{
    modelId: string
    modelName: string
    type: 'WARNING' | 'INFO' | 'INSIGHT' | 'CONFLICT'
    content: string
  }> = []

  const responseLength = speakingModelResponse.length

  // Tetikleyici Analizi
  const hasRiskKeywords = /risk|tehlike|dikkat|uyarı|hata|sorun|başarısız|çöküş/i.test(
    speakingModelResponse
  )
  const hasInfoKeywords = /bilgi|not|ek olarak|ayrıca|bağlam|kaynak|referans|belge/i.test(
    speakingModelResponse
  )
  const hasConflict = /çatışma|uyuşmazlık|anlaşmazlık|karşıt|zıt|tutarsız|çelişki/i.test(
    speakingModelResponse
  )
  const hasComplexity = /karmaşık|zor|derin|ileri|teknik|mimarı|tasarım/i.test(
    speakingModelResponse
  )

  // 1. Risk Uyarısı - Prosecutor'ı çağır
  if (hasRiskKeywords && responseLength > 100) {
    const prosecutor = getModelByRole('PROSECUTOR')
    if (prosecutor && prosecutor.id !== speakingModelId) {
      interjections.push({
        modelId: prosecutor.id,
        modelName: prosecutor.name,
        type: 'WARNING',
        content:
          'Risk Uyarisi: Bu noktadaki potansiyel riskleri, yan etkilerini ve basarisizlik senaryolarini daha detayli analiz etmeliyiz.',
      })
    }
  }

  // 2. Bilgi Ekleme - Librarian'ı çağır
  if (hasInfoKeywords && responseLength > 150) {
    const librarian = getModelByRole('LIBRARIAN')
    if (librarian && librarian.id !== speakingModelId) {
      interjections.push({
        modelId: librarian.id,
        modelName: librarian.name,
        type: 'INFO',
        content:
          'Ek Baglamı: Bu konuyla ilgili ek bilgi, kaynaklar ve referanslar ekleyebilirim. Lutfen devam et, ben de ekleyecegim.',
      })
    }
  }

  // 3. Çatışma Çözümü - High Judge'ı çağır
  if (hasConflict) {
    const judge = getModelByRole('HIGH_JUDGE')
    if (judge && judge.id !== speakingModelId) {
      interjections.push({
        modelId: judge.id,
        modelName: judge.name,
        type: 'CONFLICT',
        content:
          'Etik Perspektif: Bu catismayi cozmek icin dengeli ve etik bir yaklasim onerebilirim. Her iki tarafin da hakli noktalari var.',
      })
    }
  }

  // 4. Karmaşıklık Analizi - Architect'i çağır
  if (hasComplexity && responseLength > 200) {
    const architect = getModelByRole('ARCHITECT')
    if (architect && architect.id !== speakingModelId) {
      interjections.push({
        modelId: architect.id,
        modelName: architect.name,
        type: 'INSIGHT',
        content:
          'Mimari Perspektif: Bu karmasik yapıyı daha iyi organize edebiliriz. Moduler bir yaklasim onerebilirim.',
      })
    }
  }

  // 5. Yaratıcı Fikir - Visionary'yi çağır
  if (responseLength > 250 && Math.random() < 0.35) {
    const visionary = getModelByRole('VISIONARY')
    if (visionary && visionary.id !== speakingModelId) {
      interjections.push({
        modelId: visionary.id,
        modelName: visionary.name,
        type: 'INSIGHT',
        content:
          'Yaratici Bakis: Bu soruna tamamen farkli bir acidan yaklasabiliriz. Yeni bir perspektif sunabilirim.',
      })
    }
  }

  return interjections
}

/**
 * Bağlam Enjeksiyonu - Müdahaleleri bir sonraki modelin bağlamına ekle
 */
function injectInterjectionContext(
  interjections: Array<{
    modelId: string
    modelName: string
    type: string
    content: string
  }>
): string {
  if (interjections.length === 0) return ''

  let contextMessage = '\n[MUDAHALELER - Lutfen dikkate al]\n'

  for (const interjection of interjections) {
    contextMessage += `\n${interjection.modelName} (${interjection.type}): ${interjection.content}`
  }

  contextMessage += '\n\n[Baglamda enjekte edildi - Yukaridaki mudahaleleri goz onunde bulundurarak yanit ver]'

  return contextMessage
}

/**
 * Sıralı Konsey Tartışması - Ana Fonksiyon
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

  // 2. Her modeli sırayla çalıştır
  const responses: CouncilMember[] = []
  let previousResponse = ''
  let accumulatedInterjections: Array<{
    modelId: string
    modelName: string
    type: string
    content: string
  }> = []

  for (let i = 0; i < councilMembers.length; i++) {
    const model = councilMembers[i]
    const memberStartTime = Date.now()

    // Bağlam oluştur: Önceki modelin çıktısı + mudahale bağlamı
    const injectedContext = injectInterjectionContext(accumulatedInterjections)
    const context = previousResponse
      ? `Onceki tartisma:\n${previousResponse}\n${injectedContext}\n\nYeni katkı:`
      : ''

    // Mock yanıt
    const mockResponse = `[${model.name}] Yanit: ${userMessage.substring(0, 40)}... ${context.substring(0, 50)}`

    previousResponse += `\n${model.name}: ${mockResponse}`

    // Müdahale kontrolleri
    const interjections = checkForInterjections(
      model.id,
      mockResponse,
      councilMembers
    )

    // Müdahaleleri birikdir (bir sonraki modele aktarılacak)
    accumulatedInterjections = interjections

    const executionTime = Date.now() - memberStartTime
    const tokenCount = Math.ceil(mockResponse.length / 4)
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

  // 3. Sentez (Synthesis)
  const synthesizer = getModelByRole('SYNTHESIZER')
  const synthesisResponse = synthesizer
    ? `[${synthesizer.name}] Sentez: Tum gorusleri degerlendirerek, en uygun cozum sudur...`
    : 'Tartisma tamamlandi.'

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
 * Synthesis Prompt - Sentezleyici için özel talimatlar
 */
function buildSynthesisPrompt(
  councilResponses: CouncilMember[],
  userMessage: string
): string {
  const responsesSummary = councilResponses
    .map(
      (r, i) =>
        `${i + 1}. ${r.model.name}: ${r.response.substring(0, 200)}...`
    )
    .join('\n\n')

  return `
Sen bir Konsey Hakem Modelisin (Synthesizer). Görevin:

1. ANALIZ: Yukaridaki tum model yanitlarini dikkatle oku ve analiz et.
2. ÇATIŞMA ÇÖZÜMÜ: Eğer modeller arasında uyuşmazlık varsa, en mantıklı argümanı öne çıkar.
3. UZLAŞMA: Tüm görüşleri dikkate alarak en iyi çözümü bul.
4. KARAR: Nihai kararını açık ve net bir şekilde sun.

ORİJİNAL SORU:
${userMessage}

MODEL YANITLARI:
${responsesSummary}

Lütfen tüm bu yanıtları değerlendirerek en iyi, en dengeli ve en doğru sentezi oluştur.
Sonucunu "👔 KONSEY KARARI" başlığı altında sun.
`
}

/**
 * Konsey Tartışmasını Supabase'e kaydet
 */
export async function saveCouncilDiscussionToDatabase(
  conversationId: string,
  flow: SequentialCouncilFlow
) {
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
