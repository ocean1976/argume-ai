// Model ID → Görünen isim eşleştirmesi

export const MODEL_DISPLAY_NAMES: Record<string, string> = {
  // T1 - Fast
  'deepseek/deepseek-chat': 'DeepSeek',
  'google/gemini-2.0-flash-001': 'Gemini Flash',
  
  // T2 - Specialist
  'anthropic/claude-sonnet-4': 'Claude Sonnet',
  'deepseek/deepseek-reasoner': 'DeepSeek Reasoner',
  'x-ai/grok-2-1212': 'Grok',
  
  // T3 - Premium
  'anthropic/claude-opus-4': 'Claude Opus',
  'openai/o1': 'GPT o1',
  'google/gemini-2.5-pro': 'Gemini Pro',
  
  // Orkestratör & Fallback
  'openai/gpt-4o-mini': 'GPT-4o Mini',
  'openai/gpt-4o': 'GPT-4o',
};

// Model ID'den görünen isim al
export function getModelDisplayName(modelId: string): string {
  return MODEL_DISPLAY_NAMES[modelId] || modelId;
}

// Model renkleri (UI için)
export const MODEL_COLORS: Record<string, string> = {
  'deepseek/deepseek-chat': '#7C3AED',        // Mor
  'deepseek/deepseek-reasoner': '#7C3AED',    // Mor
  'google/gemini-2.0-flash-001': '#4285F4',   // Mavi
  'google/gemini-2.5-pro': '#4285F4',         // Mavi
  'anthropic/claude-sonnet-4': '#D97706',     // Turuncu
  'anthropic/claude-opus-4': '#D97706',       // Turuncu
  'x-ai/grok-2-1212': '#E11D48',              // Kırmızı
  'openai/o1': '#10A37F',                     // Yeşil
  'openai/gpt-4o-mini': '#10A37F',            // Yeşil
  'openai/gpt-4o': '#10A37F',                 // Yeşil
};

// Model rengini al
export function getModelColor(modelId: string): string {
  return MODEL_COLORS[modelId] || '#6B7280'; // Varsayılan gri
}
