import React from 'react'
import { ModelAvatar, ModelType, modelConfig } from './ModelAvatar'

interface ModelBadgeProps {
  model: ModelType
}

export const ModelBadge = ({ model }: ModelBadgeProps) => {
  const config = modelConfig[model] || modelConfig.gpt
  
  return (
    <div className="flex items-center gap-2 mb-1">
      <ModelAvatar model={model} className="h-4 w-4 grayscale opacity-70" />
      <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
        {config.label}
      </span>
    </div>
  )
}
