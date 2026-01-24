import { MODELS } from './models';

// Model ID'lerini kullanıcı arayüzünde gösterilecek daha okunabilir isimlerle eşleştirir.
export const MODEL_NAMES: Record<string, string> = {
  [MODELS.orchestrator]: 'GPT-4o Mini (Orchestrator)',
  
  // T1 - Fast
  [MODELS.fastWorker]: 'DeepSeek Chat (Fast Worker)',
  [MODELS.librarian]: 'Gemini 2.5 Flash (Librarian)',
  
  // T2 - Specialist
  [MODELS.architect]: 'Claude 3.5 Sonnet (Architect)',
  [MODELS.prosecutor]: 'DeepSeek Reasoner (Prosecutor)',
  [MODELS.newsAnchor]: 'Grok-2 (News Anchor)',
  
  // T3 - Premium
  [MODELS.judge]: 'Claude 3 Opus (High Judge)',
  [MODELS.reasoner]: 'OpenAI O1 (Reasoner)',
  [MODELS.visionary]: 'Gemini 2.5 Pro (Visionary)',
};

// Fallback durumunda kullanılacak genel isim
export const FALLBACK_MODEL_NAME = 'DeepSeek Chat (Fallback)';

// ID'den okunabilir ismi döndüren fonksiyon
export function getModelName(modelId: string): string {
  // Eğer model ID'si doğrudan MODEL_NAMES içinde yoksa,
  // bu bir fallback model çağrısı olabilir.
  return MODEL_NAMES[modelId] || FALLBACK_MODEL_NAME;
}
