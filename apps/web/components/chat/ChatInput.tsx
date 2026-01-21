import React, { useState, useRef, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim())
      setInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  return (
    <div className="sticky bottom-0 w-full bg-white border-t border-[#E5E5E5] p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-3 bg-[#F9F8F6] border border-[#E5E5E5] rounded-2xl p-3 shadow-sm focus-within:ring-1 focus-within:ring-indigo-100 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mesajınızı yazın..."
            disabled={disabled}
            className={cn(
              "flex-1 resize-none bg-transparent px-2 py-1 text-sm text-slate-800 placeholder-slate-400 focus:outline-none disabled:opacity-50",
              "max-h-[200px] overflow-y-auto"
            )}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || disabled}
            className="h-10 w-10 rounded-full bg-[#6366F1] hover:bg-[#5558E3] text-white flex items-center justify-center shrink-0 transition-colors disabled:opacity-50"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
