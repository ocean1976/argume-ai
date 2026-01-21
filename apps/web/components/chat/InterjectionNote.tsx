import React from 'react'
import { Lightbulb } from 'lucide-react'
import { motion } from 'framer-motion'

interface InterjectionNoteProps {
  content: string
}

export const InterjectionNote = ({ content }: InterjectionNoteProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative ml-auto max-w-[250px] my-2"
    >
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-1 text-yellow-500">
          <Lightbulb className="h-3.5 w-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">💡 Dipnot</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {content}
        </p>
      </div>
      {/* Connector line for visual flair */}
      <div className="absolute -left-4 top-1/2 h-px w-4 bg-yellow-500/20" />
    </motion.div>
  )
}
