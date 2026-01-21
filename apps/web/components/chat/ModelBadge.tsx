import React from 'react'
import { ModelAvatar, ModelType, modelConfig } from './ModelAvatar'

interface ModelBadgeProps {
  model: ModelType
}

export const ModelBadge = ({ model }: ModelBadgeProps) => {
  const config = modelConfig[model] || modelConfig.gpt
  
  return (
    <div className="flex items-center gap-2 mb-2">
      <ModelAvatar model={model} className="h-5 w-5" />
      <span className="text-sm font-bold text-slate-700" style={{ color: config.color }}>
        {config.label}
      </span>
    </div>
  )
}
