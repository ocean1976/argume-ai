import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
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
    <div className="sticky bottom-0 w-full bg-[#F9F8F6] pt-2 pb-6 px-4">
      <div className="max-w-3xl mx-auto relative flex items-end gap-2 bg-white border border-[#E5E5E5] rounded-[24px] p-2 shadow-sm focus-within:ring-1 focus-within:ring-slate-200 transition-all">
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Mesajınızı yazın..."
          disabled={disabled}
          className={cn(
            "flex-1 resize-none bg-transparent px-4 py-2 text-sm text-slate-800 focus:outline-none disabled:opacity-50",
            "max-h-[200px] overflow-y-auto"
          )}
        />
        <Button
          size="sm"
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className="h-8 w-8 rounded-full p-0 bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 mb-0.5 mr-0.5"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
