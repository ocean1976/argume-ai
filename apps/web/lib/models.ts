// Tüm modellerin OpenRouter ID'leri
export const MODELS = {
  // Orkestratör (görünmez, her zaman çalışır)
  orchestrator: 'openai/gpt-4o-mini',
  
  // T1 - Hızlı, ucuz
  fastWorker: 'deepseek/deepseek-chat',
  librarian: 'google/gemini-2.0-flash-001',
  
  // T2 - Orta
  architect: 'anthropic/claude-3.5-sonnet',
  prosecutor: 'deepseek/deepseek-reasoner',
  newsAnchor: 'x-ai/grok-2-1212',
  
  // T3 - Premium
  judge: 'anthropic/claude-3-opus',
  reasoner: 'openai/o1',
  visionary: 'google/gemini-pro-1.5',
};
