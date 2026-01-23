import React from 'react'
import { cn } from '@/lib/utils'
import { ModelType } from './ModelAvatar'
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

  // Farklı modeller için gri tonları tanımlayalım
  const getModelGrayScale = (modelType?: ModelType) => {
    switch (modelType) {
      case 'gpt': return 'bg-slate-100 border-slate-200';
      case 'claude': return 'bg-slate-50 border-slate-200';
      case 'gemini': return 'bg-gray-100 border-gray-200';
      case 'grok': return 'bg-zinc-100 border-zinc-200';
      case 'deepseek': return 'bg-neutral-100 border-neutral-200';
      default: return 'bg-white border-slate-200';
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex w-full mb-8",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn(
        "flex flex-col",
        isUser ? "max-w-[75%] items-end" : "max-w-[85%] items-start"
      )}>
        {!isUser && model && (
          <div className="mb-2 ml-1">
            <ModelBadge model={model} />
          </div>
        )}
        
        <div 
          className={cn(
            "relative rounded-2xl px-6 py-4 text-base shadow-sm transition-all",
            isUser 
              ? "bg-[#F3F4F6] text-slate-800 border border-[#E5E5E5] rounded-tr-none" 
              : cn("text-slate-800 border rounded-tl-none", getModelGrayScale(model))
          )}
        >
          {/* Sol taraftaki renkli border yerine artık sadece ince bir gri çizgi veya hiç yok */}
          {!isUser && (
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-slate-300 rounded-l-2xl" />
          )}
          
          <div className={cn(
            "leading-relaxed whitespace-pre-wrap text-[15px] text-slate-700",
            !isUser && "pl-2"
          )}>
            {content}
          </div>
          
          {timestamp && (
            <div className={cn(
              "text-[10px] mt-3 text-right font-medium opacity-40 select-none uppercase tracking-wider",
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
