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
        "w-full py-10 border-b border-slate-100/60",
        isUser ? "bg-transparent" : "bg-slate-50/40"
      )}
    >
      <div className="max-w-3xl mx-auto px-6 flex gap-8">
        {/* Avatar/Icon Area */}
        <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm mt-1">
          {isUser ? (
            <span className="text-[10px] font-bold text-slate-400">YOU</span>
          ) : (
            <div className="w-6 h-6 grayscale opacity-60">
              <img src="/logo.png" alt="AI" className="w-full h-full object-contain" />
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {!isUser && model && (
            <div className="mb-3">
              <ModelBadge model={model} />
            </div>
          )}
          
          <div className={cn(
            "prose prose-slate max-w-none leading-relaxed text-[16px] tracking-tight",
            isUser ? "text-slate-900 font-medium" : "text-slate-700"
          )}>
            {content || (
              <div className="flex gap-1.5 items-center py-2">
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
          </div>
          
          {timestamp && (
            <div className="mt-6 text-[10px] text-slate-400 font-semibold uppercase tracking-[0.15em] opacity-40">
              {timestamp}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
