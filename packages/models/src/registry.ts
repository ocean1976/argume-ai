/**
 * Model Registry - Argume.ai'ın AI Konseyi
 * 
 * Tüm modellerin tanımı, tier seviyeleri, roller ve tetikleyicileri
 */

export type Tier = 1 | 2 | 3 | 4
export type ModelRole = 
  | 'MASTER_ORCHESTRATOR'
  | 'FAST_WORKER'
  | 'LIBRARIAN'
  | 'PROSECUTOR'
  | 'ARCHITECT'
  | 'NEWS_ANCHOR'
  | 'HIGH_JUDGE'
  | 'VISIONARY'
  | 'SYNTHESIZER'
  | 'JESTER'
  | 'BACKUP_ROUTER'
  | 'BACKUP_AUDIT'

export type TriggerType = 
  | 'ALWAYS'
  | 'DEFAULT'
  | 'PDF_FILE'
  | 'LARGE_CONTEXT'
  | 'AUDIT_REQUIRED'
  | 'COMPLEX_CODE'
  | 'NEWS'
  | 'CONFLICT'
  | 'ETHICS'
  | 'CREATIVE'
  | 'FAILOVER'
  | 'REASONER_FAILOVER'
  | 'ENTERTAINMENT'

export interface ModelConfig {
  id: string
  name: string
  role: ModelRole
  openrouterId: string
  tier: Tier
  costPerMTok: number // Cost per million tokens
  maxTokens: number
  temperature: number
  triggers: TriggerType[]
  description: string
  color: string // UI rengi
  icon: string // Lucide icon adı
  isActive: boolean
  failoverTo?: string // Yedek model ID'si
}

/**
 * Model Registry - Tüm modellerin merkezi tanımı
 */
export const MODEL_REGISTRY: Record<string, ModelConfig> = {
  // ===== TIER 1: Always Active, Fast & Cheap =====
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    role: 'MASTER_ORCHESTRATOR',
    openrouterId: 'openai/gpt-4o-mini',
    tier: 1,
    costPerMTok: 0.15,
    maxTokens: 4096,
    temperature: 0.7,
    triggers: ['ALWAYS'],
    description: 'Her zaman aktif, ucuz ve hızlı. Konsey yöneticisi.',
    color: '#10B981',
    icon: 'Brain',
    isActive: true,
  },

  'deepseek-chat': {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    role: 'FAST_WORKER',
    openrouterId: 'deepseek/deepseek-chat',
    tier: 1,
    costPerMTok: 0.14,
    maxTokens: 4096,
    temperature: 0.7,
    triggers: ['DEFAULT'],
    description: 'Varsayılan sohbet modeli, hızlı ve etkili.',
    color: '#8B5CF6',
    icon: 'Zap',
    isActive: true,
    failoverTo: 'gemini-2.5-flash',
  },

  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    role: 'LIBRARIAN',
    openrouterId: 'google/gemini-2.5-flash-preview',
    tier: 1,
    costPerMTok: 0.075,
    maxTokens: 8192,
    temperature: 0.7,
    triggers: ['PDF_FILE', 'LARGE_CONTEXT'],
    description: 'Büyük dosya ve bağlam işleme uzmanı.',
    color: '#3B82F6',
    icon: 'BookOpen',
    isActive: true,
  },

  // ===== TIER 2: On-Demand, Specialist =====
  'deepseek-reasoner': {
    id: 'deepseek-reasoner',
    name: 'DeepSeek Reasoner',
    role: 'PROSECUTOR',
    openrouterId: 'deepseek/deepseek-reasoner',
    tier: 2,
    costPerMTok: 0.55,
    maxTokens: 8192,
    temperature: 0.5,
    triggers: ['AUDIT_REQUIRED'],
    description: 'Detaylı analiz ve denetim için çağrılır.',
    color: '#F59E0B',
    icon: 'Scale',
    isActive: true,
    failoverTo: 'claude-haiku-4',
  },

  'claude-sonnet-4.5': {
    id: 'claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    role: 'ARCHITECT',
    openrouterId: 'anthropic/claude-sonnet-4',
    tier: 2,
    costPerMTok: 3.0,
    maxTokens: 4096,
    temperature: 0.7,
    triggers: ['COMPLEX_CODE'],
    description: 'Karmaşık kod mimarisi ve tasarım uzmanı.',
    color: '#F59E0B',
    icon: 'Code',
    isActive: true,
  },

  'grok-4.1-fast': {
    id: 'grok-4.1-fast',
    name: 'Grok 4.1 Fast',
    role: 'NEWS_ANCHOR',
    openrouterId: 'x-ai/grok-4-1-fast',
    tier: 2,
    costPerMTok: 2.0,
    maxTokens: 4096,
    temperature: 0.8,
    triggers: ['NEWS'],
    description: 'Güncel haber ve trend analizi.',
    color: '#EF4444',
    icon: 'Newspaper',
    isActive: true,
  },

  // ===== TIER 3: Rarely, Premium =====
  'gemini-3-pro': {
    id: 'gemini-3-pro',
    name: 'Gemini 3 Pro',
    role: 'VISIONARY',
    openrouterId: 'google/gemini-3-pro',
    tier: 3,
    costPerMTok: 15.0,
    maxTokens: 8192,
    temperature: 0.9,
    triggers: ['CREATIVE'],
    description: 'Yaratıcı ve vizyoner çözümler için.',
    color: '#3B82F6',
    icon: 'Sparkles',
    isActive: true,
  },

  'claude-opus-4.5': {
    id: 'claude-opus-4.5',
    name: 'Claude Opus 4.5',
    role: 'HIGH_JUDGE',
    openrouterId: 'anthropic/claude-opus-4',
    tier: 3,
    costPerMTok: 15.0,
    maxTokens: 4096,
    temperature: 0.5,
    triggers: ['CONFLICT', 'ETHICS'],
    description: 'Etik ve çatışma çözümleme için en yüksek yargıç.',
    color: '#F59E0B',
    icon: 'Gavel',
    isActive: true,
  },

  'gpt-5.2': {
    id: 'gpt-5.2',
    name: 'GPT-5.2',
    role: 'SYNTHESIZER',
    openrouterId: 'openai/gpt-5.2',
    tier: 3,
    costPerMTok: 15.0,
    maxTokens: 4096,
    temperature: 0.7,
    triggers: [],
    description: 'Alternatif jüri ve sentez.',
    color: '#10B981',
    icon: 'Combine',
    isActive: true,
  },

  // ===== TIER 4: Manual Approval, God Mode =====
  'gpt-5.2-pro': {
    id: 'gpt-5.2-pro',
    name: 'GPT-5.2 Pro',
    role: 'MASTER_ORCHESTRATOR',
    openrouterId: 'openai/gpt-5.2-pro',
    tier: 4,
    costPerMTok: 168.0,
    maxTokens: 8192,
    temperature: 0.7,
    triggers: [],
    description: 'Manuel onay gerekli, God Mode.',
    color: '#10B981',
    icon: 'Crown',
    isActive: false, // Varsayılan kapalı
  },

  // ===== BONUS: Entertainment =====
  'grok-4-heavy': {
    id: 'grok-4-heavy',
    name: 'Grok 4 Heavy',
    role: 'JESTER',
    openrouterId: 'x-ai/grok-4-heavy',
    tier: 2,
    costPerMTok: 5.0,
    maxTokens: 4096,
    temperature: 1.0,
    triggers: ['ENTERTAINMENT'],
    description: 'Eğlence modu - şakacı ve yaratıcı yanıtlar.',
    color: '#EF4444',
    icon: 'Smile',
    isActive: true,
  },

  // ===== FAILOVER / BACKUP =====
  'gemini-2.0-flash-lite': {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash Lite',
    role: 'BACKUP_ROUTER',
    openrouterId: 'google/gemini-2.0-flash-lite',
    tier: 1,
    costPerMTok: 0.05,
    maxTokens: 4096,
    temperature: 0.7,
    triggers: ['FAILOVER'],
    description: 'Yedek router - model çöktüğünde devreye girer.',
    color: '#3B82F6',
    icon: 'Shield',
    isActive: true,
  },

  'claude-haiku-4.5': {
    id: 'claude-haiku-4.5',
    name: 'Claude Haiku 4.5',
    role: 'BACKUP_AUDIT',
    openrouterId: 'anthropic/claude-haiku-4',
    tier: 1,
    costPerMTok: 0.8,
    maxTokens: 2048,
    temperature: 0.5,
    triggers: ['REASONER_FAILOVER'],
    description: 'Reasoner çökerse devreye giren yedek denetim modeli.',
    color: '#F59E0B',
    icon: 'Shield',
    isActive: true,
  },
}

/**
 * Tier'a göre modelleri getir
 */
export function getModelsByTier(tier: Tier): ModelConfig[] {
  return Object.values(MODEL_REGISTRY).filter(
    m => m.tier === tier && m.isActive
  )
}

/**
 * Tetikleyiciye göre modeli bul
 */
export function getModelByTrigger(trigger: TriggerType): ModelConfig | null {
  const model = Object.values(MODEL_REGISTRY).find(
    m => m.triggers.includes(trigger) && m.isActive
  )
  return model || null
}

/**
 * Rol'e göre modeli bul
 */
export function getModelByRole(role: ModelRole): ModelConfig | null {
  const model = Object.values(MODEL_REGISTRY).find(
    m => m.role === role && m.isActive
  )
  return model || null
}

/**
 * Yedek model'i getir
 */
export function getFailoverModel(modelId: string): ModelConfig | null {
  const model = MODEL_REGISTRY[modelId]
  if (!model?.failoverTo) return null
  return MODEL_REGISTRY[model.failoverTo] || null
}

/**
 * Tüm aktif modelleri getir
 */
export function getActiveModels(): ModelConfig[] {
  return Object.values(MODEL_REGISTRY).filter(m => m.isActive)
}

/**
 * Model maliyetini hesapla (input + output tokens)
 */
export function calculateModelCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): number {
  const model = MODEL_REGISTRY[modelId]
  if (!model) return 0
  
  const totalTokens = (inputTokens + outputTokens) / 1_000_000 // Convert to millions
  return totalTokens * model.costPerMTok
}

/**
 * Model istatistikleri
 */
export function getModelStats() {
  const models = Object.values(MODEL_REGISTRY)
  const activeModels = models.filter(m => m.isActive)
  
  return {
    total: models.length,
    active: activeModels.length,
    byTier: {
      tier1: getModelsByTier(1).length,
      tier2: getModelsByTier(2).length,
      tier3: getModelsByTier(3).length,
      tier4: getModelsByTier(4).length,
    },
    averageCost: activeModels.reduce((sum, m) => sum + m.costPerMTok, 0) / activeModels.length,
  }
}
