import React from 'react'
import { cn } from '@/lib/utils'
import { ModelType, modelConfig } from './ModelAvatar'
import { ModelBadge } from './ModelBadge'
import { motion } from 'framer-motion'

interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  model?: ModelType
  timestamp?: string
}

export const MessageBubble = ({ role, content, model, timestamp }: MessageBubbleProps) => {
  const isUser = role === 'user'
  const config = model && modelConfig[model] ? modelConfig[model] : modelConfig.gpt

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex w-full mb-6",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn(
        "flex flex-col",
        isUser ? "max-w-[70%] items-end" : "max-w-[85%] items-start"
      )}>
        {!isUser && model && <ModelBadge model={model} />}
        
        <div 
          className={cn(
            "relative rounded-xl px-4 py-3 text-sm shadow-sm",
            isUser 
              ? "bg-[#F3F4F6] text-slate-800" 
              : "bg-white text-slate-800 border border-[#E5E5E5]"
          )}
          style={!isUser ? { borderLeft: `3px solid ${config.color}` } : {}}
        >
          <p className="leading-relaxed whitespace-pre-wrap">{content}</p>
          
          {timestamp && (
            <div className="text-[10px] text-slate-400 mt-2 text-right">
              {timestamp}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
