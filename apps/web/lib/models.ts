// Ana modeller
export const MODELS = {
  orchestrator: 'openai/gpt-4o-mini',
  fastWorker: 'deepseek/deepseek-chat',
  librarian: 'google/gemini-2.0-flash-001',
  architect: 'anthropic/claude-sonnet-4',
  prosecutor: 'deepseek/deepseek-reasoner',
  newsAnchor: 'x-ai/grok-2-1212',
  judge: 'anthropic/claude-opus-4',
  reasoner: 'openai/o1',
  visionary: 'google/gemini-2.5-pro',
};

// Yedek modeller (ana model hata verirse)
export const FALLBACK_MODELS: Record<string, string> = {
  'deepseek/deepseek-chat': 'openai/gpt-4o-mini',
  'google/gemini-2.0-flash-001': 'openai/gpt-4o-mini',
  'anthropic/claude-sonnet-4': 'openai/gpt-4o',
  'deepseek/deepseek-reasoner': 'deepseek/deepseek-chat',
  'x-ai/grok-2-1212': 'openai/gpt-4o-mini',
  'anthropic/claude-opus-4': 'anthropic/claude-sonnet-4',
  'openai/o1': 'openai/gpt-4o',
  'google/gemini-2.5-pro': 'google/gemini-2.0-flash-001',
};
