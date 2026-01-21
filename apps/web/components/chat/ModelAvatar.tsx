import React from 'react'
import { cn } from '@/lib/utils'
import { Bot, Sparkles, Zap, Brain, Cpu, User } from 'lucide-react'

export type ModelType = 'gpt' | 'claude' | 'gemini' | 'deepseek' | 'grok' | 'user'

interface ModelAvatarProps {
  model: ModelType
  className?: string
}

export const modelConfig = {
  gpt: { color: '#10B981', icon: Bot, label: 'GPT-4o' },
  claude: { color: '#D97706', icon: Sparkles, label: 'Claude 3.5' },
  gemini: { color: '#3B82F6', icon: Zap, label: 'Gemini 1.5' },
  deepseek: { color: '#8B5CF6', icon: Brain, label: 'DeepSeek V3' },
  grok: { color: '#EF4444', icon: Cpu, label: 'Grok-2' },
  user: { color: '#6B5E4C', icon: User, label: 'Siz' },
}

export const ModelAvatar = ({ model, className }: ModelAvatarProps) => {
  const config = modelConfig[model] || modelConfig.gpt
  const Icon = config.icon

  return (
    <div 
      className={cn(
        "flex h-6 w-6 shrink-0 select-none items-center justify-center rounded-md text-white shadow-sm",
        className
      )}
      style={{ backgroundColor: config.color }}
    >
      <Icon className="h-3.5 w-3.5" />
    </div>
  )
}
