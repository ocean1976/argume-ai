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
      className="ml-8 my-4 bg-[#FEF3C7] border-l-4 border-[#F59E0B] rounded-r-xl p-4 shadow-sm max-w-[85%]"
    >
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="h-4 w-4 text-[#F59E0B]" />
        <span className="text-xs font-bold text-[#B45309]">
          💡 Dipnot • {modelName || 'AI'}
        </span>
      </div>
      <p className="text-sm text-slate-700 leading-relaxed">
        {content}
      </p>
    </motion.div>
  )
}
