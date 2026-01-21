import React from 'react'
import { motion } from 'framer-motion'

interface TypingIndicatorProps {
  modelName?: string
}

export const TypingIndicator = ({ modelName }: TypingIndicatorProps) => {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            className="h-1.5 w-1.5 rounded-full bg-slate-500"
          />
        ))}
      </div>
      {modelName && (
        <span className="text-xs text-slate-500 font-medium">
          {modelName} yazıyor...
        </span>
      )}
    </div>
  )
}
