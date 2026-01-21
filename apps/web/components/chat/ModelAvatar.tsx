import React from 'react'
import { cn } from '@/lib/utils'
import { Bot, Sparkles, Zap, Brain, Cpu, Globe } from 'lucide-react'

export type ModelType = 'gpt' | 'claude' | 'gemini' | 'deepseek' | 'grok' | 'user'

interface ModelAvatarProps {
  model: ModelType
  className?: string
}

const modelConfig = {
  gpt: { color: 'bg-emerald-500', icon: Bot, label: 'GPT' },
  claude: { color: 'bg-orange-500', icon: Sparkles, label: 'Claude' },
  gemini: { color: 'bg-blue-500', icon: Zap, label: 'Gemini' },
  deepseek: { color: 'bg-purple-500', icon: Brain, label: 'DeepSeek' },
  grok: { color: 'bg-red-500', icon: Cpu, label: 'Grok' },
  user: { color: 'bg-indigo-600', icon: Globe, label: 'Siz' },
}

export const ModelAvatar = ({ model, className }: ModelAvatarProps) => {
  const config = modelConfig[model] || modelConfig.gpt
  const Icon = config.icon

  return (
    <div className={cn(
      "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg text-white shadow-sm",
      config.color,
      className
    )}>
      <Icon className="h-5 w-5" />
    </div>
  )
}
