/**
 * Council Manager - Argume.ai'ın AI Konseyi Yöneticisi
 * 
 * Sorular gelen zaman:
 * 1. Tetikleyicileri analiz et
 * 2. Uygun modelleri seç
 * 3. Sırayla çalıştır
 * 4. Müdahale (Interjection) mantığını uygula
 */

import {
  MODEL_REGISTRY,
  getModelByTrigger,
  getModelByRole,
  getFailoverModel,
  getActiveModels,
  type ModelConfig,
  type TriggerType,
  type ModelRole,
} from '@argume/models'

export interface CouncilRequest {
  userMessage: string
  conversationHistory: Array<{ role: string; content: string }>
  requestType?: TriggerType
  userId?: string
}

export interface CouncilResponse {
  responses: Array<{
    modelId: string
    modelName: string
    role: ModelRole
    content: string
    order: number
    interjections?: Array<{
      modelId: string
      modelName: string
      type: 'WARNING' | 'INFO' | 'INSIGHT'
      content: string
    }>
  }>
  totalCost: number
  executionTime: number
}

/**
 * Kullanıcı mesajından tetikleyicileri çıkar
 */
function extractTriggers(message: string, contextSize: number): TriggerType[] {
  const triggers: TriggerType[] = []

  // Büyük bağlam kontrolü
  if (contextSize > 50000) {
    triggers.push('LARGE_CONTEXT')
  }

  // Anahtar kelimeler
  const lowerMessage = message.toLowerCase()

  if (
    lowerMessage.includes('pdf') ||
    lowerMessage.includes('dosya') ||
    lowerMessage.includes('belge')
  ) {
    triggers.push('PDF_FILE')
  }

  if (
    lowerMessage.includes('denetim') ||
    lowerMessage.includes('kontrol') ||
    lowerMessage.includes('analiz et')
  ) {
    triggers.push('AUDIT_REQUIRED')
  }

  if (
    lowerMessage.includes('kod') ||
    lowerMessage.includes('mimarı') ||
    lowerMessage.includes('tasarım')
  ) {
    triggers.push('COMPLEX_CODE')
  }

  if (
    lowerMessage.includes('haber') ||
    lowerMessage.includes('güncel') ||
    lowerMessage.includes('trend')
  ) {
    triggers.push('NEWS')
  }

  if (
    lowerMessage.includes('etik') ||
    lowerMessage.includes('çatışma') ||
    lowerMessage.includes('uyuşmazlık')
  ) {
    triggers.push('ETHICS')
  }

  if (
    lowerMessage.includes('yaratıcı') ||
    lowerMessage.includes('fikir') ||
    lowerMessage.includes('tasarla')
  ) {
    triggers.push('CREATIVE')
  }

  if (
    lowerMessage.includes('şaka') ||
    lowerMessage.includes('eğlence') ||
    lowerMessage.includes('mizah')
  ) {
    triggers.push('ENTERTAINMENT')
  }

  // Varsayılan tetikleyici
  if (triggers.length === 0) {
    triggers.push('DEFAULT')
  }

  return triggers
}

/**
 * Tetikleyicilere göre Konsey oluştur
 */
function buildCouncil(triggers: TriggerType[]): ModelConfig[] {
  const council: ModelConfig[] = []
  const addedModels = new Set<string>()

  // 1. Master Orchestrator (Her zaman)
  const orchestrator = getModelByRole('MASTER_ORCHESTRATOR')
  if (orchestrator && !addedModels.has(orchestrator.id)) {
    council.push(orchestrator)
    addedModels.add(orchestrator.id)
  }

  // 2. Tetikleyicilere göre modeller
  for (const trigger of triggers) {
    const model = getModelByTrigger(trigger)
    if (model && !addedModels.has(model.id)) {
      council.push(model)
      addedModels.add(model.id)
    }
  }

  // 3. Fast Worker (Varsayılan)
  const fastWorker = getModelByRole('FAST_WORKER')
  if (fastWorker && !addedModels.has(fastWorker.id)) {
    council.push(fastWorker)
    addedModels.add(fastWorker.id)
  }

  // 4. High Judge (Etik/Çatışma durumunda)
  if (triggers.includes('ETHICS') || triggers.includes('CONFLICT')) {
    const judge = getModelByRole('HIGH_JUDGE')
    if (judge && !addedModels.has(judge.id)) {
      council.push(judge)
      addedModels.add(judge.id)
    }
  }

  return council
}

/**
 * Müdahale (Interjection) Mantığı
 * Bir model yanıt verirken, diğerinin araya girmesi gerekip gerekmediğini kontrol et
 */
function checkForInterjections(
  modelResponse: string,
  respondingModelId: string,
  council: ModelConfig[]
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

  // Basit heuristic: Yanıtın uzunluğu ve içeriğine göre müdahale tetikle
  const responseLength = modelResponse.length
  const hasWarningKeywords = /risk|tehlike|dikkat|uyarı/i.test(modelResponse)
  const hasInfoKeywords = /bilgi|not|ek olarak|ayrıca/i.test(modelResponse)

  // Risk uyarısı tetikleyicileri
  if (hasWarningKeywords && responseLength > 100) {
    // Prosecutor'ı çağır
    const prosecutor = getModelByRole('PROSECUTOR')
    if (prosecutor && prosecutor.id !== respondingModelId) {
      interjections.push({
        modelId: prosecutor.id,
        modelName: prosecutor.name,
        type: 'WARNING',
        content:
          '⚠️ Risk Uyarısı: Lütfen bu noktadaki riskleri daha detaylı analiz et.',
      })
    }
  }

  // Bilgi ekleme tetikleyicileri
  if (hasInfoKeywords && responseLength > 150) {
    // Librarian'ı çağır
    const librarian = getModelByRole('LIBRARIAN')
    if (librarian && librarian.id !== respondingModelId) {
      interjections.push({
        modelId: librarian.id,
        modelName: librarian.name,
        type: 'INFO',
        content:
          'ℹ️ Ek Bilgi: Bu konuyla ilgili ek bağlam ve kaynaklar ekleyebilirim.',
      })
    }
  }

  // Yaratıcı fikir tetikleyicileri
  if (responseLength > 200) {
    // Visionary'yi çağır (düşük olasılıkla)
    if (Math.random() < 0.3) {
      const visionary = getModelByRole('VISIONARY')
      if (visionary && visionary.id !== respondingModelId) {
        interjections.push({
          modelId: visionary.id,
          modelName: visionary.name,
          type: 'INSIGHT',
          content:
            '💡 Yaratıcı Bakış: Bu soruna farklı bir açıdan yaklaşabiliriz.',
        })
      }
    }
  }

  return interjections
}

/**
 * Konsey Yöneticisi - Ana Orchestration Fonksiyonu
 */
export async function orchestrateCouncil(
  request: CouncilRequest
): Promise<CouncilResponse> {
  const startTime = Date.now()

  // 1. Tetikleyicileri çıkar
  const contextSize = request.conversationHistory.reduce(
    (sum, msg) => sum + msg.content.length,
    0
  )
  const triggers = extractTriggers(request.userMessage, contextSize)

  console.log(`[Council Manager] Triggers detected: ${triggers.join(', ')}`)

  // 2. Konsey oluştur
  const council = buildCouncil(triggers)

  console.log(
    `[Council Manager] Council assembled: ${council.map(m => m.name).join(' -> ')}`
  )

  // 3. Konsey üyelerinin yanıtlarını topla (simüle)
  const responses: CouncilResponse['responses'] = []
  let totalCost = 0

  for (let i = 0; i < council.length; i++) {
    const model = council[i]

    // Gerçek uygulamada, burada API çağrısı yapılacak
    // Şimdilik mock response
    const mockResponse = `[${model.name}] Yanıt: ${request.userMessage.substring(0, 30)}...`

    // Müdahale kontrolleri
    const interjections = checkForInterjections(
      mockResponse,
      model.id,
      council
    )

    // Maliyet hesapla
    const estimatedTokens = mockResponse.length / 4 // Rough estimate
    const cost = (estimatedTokens / 1_000_000) * model.costPerMTok
    totalCost += cost

    responses.push({
      modelId: model.id,
      modelName: model.name,
      role: model.role,
      content: mockResponse,
      order: i + 1,
      interjections: interjections.length > 0 ? interjections : undefined,
    })
  }

  const executionTime = Date.now() - startTime

  return {
    responses,
    totalCost,
    executionTime,
  }
}

/**
 * Failover Mantığı - Model çöktüğünde yedek modele geç
 */
export function getFailoverChain(modelId: string): ModelConfig[] {
  const chain: ModelConfig[] = []
  let currentModelId: string | null = modelId

  while (currentModelId) {
    const model = MODEL_REGISTRY[currentModelId]
    if (!model) break

    chain.push(model)

    // Yedek modeli bul
    const failover = getFailoverModel(currentModelId)
    currentModelId = failover?.id || null
  }

  return chain
}

/**
 * Konsey İstatistikleri
 */
export function getCouncilStats() {
  const activeModels = getActiveModels()

  return {
    totalCouncilMembers: activeModels.length,
    roles: activeModels.map(m => m.role),
    averageCostPerQuery: activeModels.reduce((sum, m) => sum + m.costPerMTok, 0) / activeModels.length,
    fastestModels: activeModels
      .sort((a, b) => a.costPerMTok - b.costPerMTok)
      .slice(0, 3)
      .map(m => m.name),
  }
}
