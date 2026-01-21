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
        isUser ? "max-w-[75%] items-end" : "max-w-[85%] items-start"
      )}>
        {!isUser && model && <ModelBadge model={model} />}
        
        <div 
          className={cn(
            "relative rounded-2xl px-5 py-4 text-[15px] shadow-sm transition-shadow hover:shadow-md",
            isUser 
              ? "bg-[#F3F4F6] text-slate-800 border border-[#E5E5E5] rounded-tr-none" 
              : "bg-white text-slate-800 border border-[#E5E5E5] rounded-tl-none"
          )}
        >
          {/* Sol renkli border - Sadece AI mesajları için */}
          {!isUser && (
            <div 
              className="absolute left-0 top-0 bottom-0 w-[4px] rounded-l-2xl"
              style={{ backgroundColor: config.color }}
            />
          )}
          
          <p className={cn(
            "leading-relaxed whitespace-pre-wrap",
            !isUser && "pl-2"
          )}>
            {content}
          </p>
          
          {timestamp && (
            <div className={cn(
              "text-[10px] mt-2 text-right font-medium opacity-40 select-none",
              isUser ? "text-slate-600" : "text-slate-500"
            )}>
              {timestamp}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
