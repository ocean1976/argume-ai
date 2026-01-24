import React from 'react'
import { cn } from '@/lib/utils'
import { ModelType } from '../ModelAvatar'
import { ModelBadge } from '../ModelBadge'
import { getModelColor } from '@/lib/modelNames'
import { motion } from 'framer-motion'

export type MessageType = 
  | 'normal' 
  | 'thesis' 
  | 'antithesis' 
  | 'synthesis' 
  | 'warning' 
  | 'support' 
  | 'info' 
  | 'error' 
  | 'success' 
  | 'question'
  | 'waiting'

interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  model?: ModelType | string
  modelId?: string
  timestamp?: string
  type?: MessageType
}

const getMessageStyle = (type: MessageType = 'normal') => {
  const styles = {
    normal:     { icon: '🌷', label: null,        color: '#9CA3AF' },
    thesis:     { icon: '🛡️', label: 'TEZ',       color: '#4B5563' },
    antithesis: { icon: '⚔️', label: 'ANTİTEZ',   color: '#1F2937' },
    synthesis:  { icon: '◆',  label: 'SENTEZ',    color: '#111827' },
    warning:    { icon: '⚠️', label: 'UYARI',     color: '#D97706' },
    support:    { icon: '💬', label: 'DESTEK',    color: '#3B82F6' },
    info:       { icon: 'ℹ️', label: 'BİLGİ',     color: '#6B7280' },
    error:      { icon: '✕',  label: 'HATA',      color: '#EF4444' },
    success:    { icon: '✓',  label: 'ONAY',      color: '#10B981' },
    question:   { icon: '?',  label: 'SORU',      color: '#8B5CF6' },
    waiting:    { icon: '⏳',  label: null,        color: '#9CA3AF' },
  };
  return styles[type] || styles.normal;
};

export const MessageBubble = ({ role, content, model, modelId, timestamp, type = 'normal' }: MessageBubbleProps) => {
  const isUser = role === 'user'
  const style = getMessageStyle(isUser ? 'normal' : type)
  const modelColor = modelId ? getModelColor(modelId) : '#6B7280'

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
          {!isUser && (
            <div className="mb-3 flex items-center gap-3">
              {/* Symbol & Label System */}
              <div className="flex items-center gap-2">
                <span className="text-lg" style={{ color: style.color }}>{style.icon}</span>
                {style.label && (
                  <span 
                    className="text-[10px] font-black tracking-widest px-2 py-0.5 rounded-md border"
                    style={{ color: style.color, borderColor: `${style.color}40`, backgroundColor: `${style.color}10` }}
                  >
                    {style.label}
                  </span>
                )}
              </div>
              {/* Model adı (renkli nokta ile) */}
              {model && (
                <div className="flex items-center gap-2">
                  <span 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: modelColor }}
                  ></span>
                  <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                    {model}
                  </span>
                </div>
              )}
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
