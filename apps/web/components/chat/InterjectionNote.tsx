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
        return <AlertTriangle className="h-4 w-4 text-[#D97706]" />
      case 'INFO':
        return <Info className="h-4 w-4 text-[#3B82F6]" />
      default:
        return <Lightbulb className="h-4 w-4 text-[#F59E0B]" />
    }
  }

  const getLabel = () => {
    switch (type) {
      case 'RISK_WARNING':
        return '⚠️ Uyarı'
      case 'INFO':
        return 'ℹ️ Bilgi'
      default:
        return '💡 Dipnot'
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
      className={`ml-8 my-4 border-l-4 rounded-r-xl p-4 shadow-sm max-w-[85%] ${getColors()}`}
    >
      <div className="flex items-center gap-2 mb-2">
        {getIcon()}
        <span className="text-xs font-bold">
          {getLabel()} • {modelName || 'AI'}
        </span>
      </div>
      <p className="text-sm leading-relaxed opacity-90">
        {content}
      </p>
    </motion.div>
  )
}
