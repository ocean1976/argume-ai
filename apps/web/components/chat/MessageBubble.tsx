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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "w-full py-8 border-b border-slate-100/50",
        isUser ? "bg-transparent" : "bg-slate-50/30"
      )}
    >
      <div className="max-w-3xl mx-auto px-4 flex gap-6">
        {/* Avatar/Icon Area */}
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 shadow-sm">
          {isUser ? (
            <span className="text-[10px] font-bold text-slate-400">YOU</span>
          ) : (
            <div className="w-5 h-5 grayscale opacity-70">
              <img src="/logo.png" alt="AI" className="w-full h-full object-contain" />
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {!isUser && model && (
            <div className="mb-2">
              <ModelBadge model={model} />
            </div>
          )}
          
          <div className={cn(
            "prose prose-slate max-w-none leading-relaxed text-[16px]",
            isUser ? "text-slate-800 font-medium" : "text-slate-700"
          )}>
            {content || (
              <div className="flex gap-1 items-center py-2">
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
          </div>
          
          {timestamp && (
            <div className="mt-4 text-[10px] text-slate-400 font-medium uppercase tracking-widest opacity-50">
              {timestamp}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
