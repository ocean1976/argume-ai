'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { AlertTriangle, Edit3, Lightbulb, HelpCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export type InterjectionType = 'RISK_WARNING' | 'CORRECTION' | 'BETTER_APPROACH' | 'MISSING_CONSTRAINT'

interface InterjectionNoteProps {
  type: InterjectionType
  modelName: string
  content: string
}

const INTERJECTION_CONFIG = {
  RISK_WARNING: {
    icon: AlertTriangle,
    label: 'Risk Uyarısı',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50/50',
    borderColor: 'border-amber-100'
  },
  CORRECTION: {
    icon: Edit3,
    label: 'Hata Düzeltme',
    color: 'text-red-600',
    bgColor: 'bg-red-50/50',
    borderColor: 'border-red-100'
  },
  BETTER_APPROACH: {
    icon: Lightbulb,
    label: 'Daha İyi Yöntem',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50/50',
    borderColor: 'border-emerald-100'
  },
  MISSING_CONSTRAINT: {
    icon: HelpCircle,
    label: 'Eksik Bilgi',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50/50',
    borderColor: 'border-blue-100'
  }
}

export const InterjectionNote = ({ type, modelName, content }: InterjectionNoteProps) => {
  const config = INTERJECTION_CONFIG[type] || INTERJECTION_CONFIG.BETTER_APPROACH
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "mt-4 rounded-2xl border p-5 transition-all shadow-sm",
        config.bgColor,
        config.borderColor
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn("mt-1 shrink-0 p-2 rounded-lg bg-white shadow-sm", config.color)}>
          <Icon size={18} />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className={cn("text-[11px] font-bold uppercase tracking-[0.1em]", config.color)}>
              {config.label}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider opacity-70">
              • {modelName}
            </span>
          </div>
          <p className="text-[15px] leading-relaxed text-slate-700 font-medium italic">
            "{content}"
          </p>
        </div>
      </div>
    </motion.div>
  )
}
