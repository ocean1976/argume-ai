import React from 'react'
import { Lightbulb, AlertTriangle, Info } from 'lucide-react'
import { motion } from 'framer-motion'

export type InterjectionType = 'RISK_WARNING' | 'INFO' | 'GENERAL'

interface InterjectionNoteProps {
  content: string
  modelName?: string
  type?: InterjectionType
}

export const InterjectionNote = ({ content, modelName, type = 'GENERAL' }: InterjectionNoteProps) => {
  const getIcon = () => {
    switch (type) {
      case 'RISK_WARNING':
        return <AlertTriangle className="h-4 w-4" />
      case 'INFO':
        return <Info className="h-4 w-4" />
      default:
        return <Lightbulb className="h-4 w-4" />
    }
  }

  const getLabel = () => {
    switch (type) {
      case 'RISK_WARNING':
        return 'Uyarı'
      case 'INFO':
        return 'Bilgi'
      default:
        return 'Dipnot'
    }
  }

  const getColors = () => {
    switch (type) {
      case 'RISK_WARNING':
        return 'bg-[#FEF3C7] border-[#F59E0B] text-[#B45309]'
      case 'INFO':
        return 'bg-[#EFF6FF] border-[#3B82F6] text-[#1E40AF]'
      default:
        return 'bg-[#FEF3C7] border-[#F59E0B] text-[#B45309]'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`ml-12 my-6 border-l-4 rounded-r-2xl p-5 shadow-sm max-w-[80%] ${getColors()}`}
    >
      <div className="flex items-center gap-2 mb-2 opacity-80">
        {getIcon()}
        <span className="text-[11px] font-bold uppercase tracking-wider">
          {getLabel()} • {modelName || 'AI'}
        </span>
      </div>
      <p className="text-[14px] leading-relaxed font-medium">
        {content}
      </p>
    </motion.div>
  )
}
