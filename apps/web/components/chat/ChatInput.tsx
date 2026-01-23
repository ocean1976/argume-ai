import React, { useState, useRef, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  isInitial?: boolean
}

export const ChatInput = ({ onSend, disabled, isInitial = false }: ChatInputProps) => {
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

  // Eğer ana sayfadaki merkezi input ise farklı bir stil kullan
  if (isInitial) {
    return (
      <div className="w-full">
        <div className="flex items-end gap-3 bg-white p-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ready to argue me?"
            disabled={disabled}
            className={cn(
              "flex-1 resize-none bg-transparent px-4 py-3 text-lg text-slate-800 placeholder-slate-400 focus:outline-none disabled:opacity-50",
              "max-h-[200px] overflow-y-auto"
            )}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || disabled}
            className="h-12 w-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shrink-0 transition-colors disabled:opacity-50 shadow-sm"
          >
            <ArrowUp className="h-6 w-6" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="sticky bottom-0 w-full bg-[#F9F8F6] p-4 pb-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-3 bg-white border border-[#E5E5E5] rounded-2xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-slate-200 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mesajınızı yazın..."
            disabled={disabled}
            className={cn(
              "flex-1 resize-none bg-transparent px-4 py-3 text-base text-slate-800 placeholder-slate-400 focus:outline-none disabled:opacity-50",
              "max-h-[200px] overflow-y-auto"
            )}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || disabled}
            className="h-10 w-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shrink-0 transition-colors disabled:opacity-50"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
