import React from 'react'
import { Lightbulb } from 'lucide-react'
import { motion } from 'framer-motion'

interface InterjectionNoteProps {
  content: string
  modelName?: string
}

export const InterjectionNote = ({ content, modelName }: InterjectionNoteProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="ml-5 max-w-[80%] my-4"
    >
      <div className="bg-[#FEF3C7] border-l-4 border-[#F59E0B] rounded-r-xl p-3 shadow-sm">
        <div className="flex items-center gap-2 mb-1 text-[#F59E0B]">
          <Lightbulb className="h-3.5 w-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            💡 Dipnot {modelName ? `• ${modelName}` : ''}
          </span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed">
          {content}
        </p>
      </div>
    </motion.div>
  )
}
