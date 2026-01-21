import React from 'react'
import { cn } from '@/lib/utils'
import { ModelAvatar, ModelType } from './ModelAvatar'
import { motion } from 'framer-motion'

interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  model?: ModelType
  modelName?: string
  timestamp?: string
}

export const MessageBubble = ({ role, content, model, modelName, timestamp }: MessageBubbleProps) => {
  const isUser = role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex w-full gap-3 mb-6",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <ModelAvatar model={isUser ? 'user' : (model || 'gpt')} />
      
      <div className={cn(
        "flex flex-col max-w-[80%]",
        isUser ? "items-end" : "items-start"
      )}>
        {!isUser && modelName && (
          <span className="text-xs font-bold text-slate-500 mb-1 ml-1">
            {modelName}
          </span>
        )}
        
        <div className={cn(
          "rounded-2xl px-4 py-2.5 text-sm shadow-sm",
          isUser 
            ? "bg-indigo-600 text-white rounded-tr-none" 
            : "bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none"
        )}>
          <p className="leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
        
        {timestamp && (
          <span className="text-[10px] text-slate-600 mt-1 px-1">
            {timestamp}
          </span>
        )}
      </div>
    </motion.div>
  )
}
