import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Send, Plus } from 'lucide-react'
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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  return (
    <div className="relative flex items-end gap-2 p-4 bg-slate-900/50 backdrop-blur-md border-t border-slate-800">
      <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full p-0 shrink-0">
        <Plus className="h-5 w-5" />
      </Button>
      
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Mesajınızı yazın..."
          disabled={disabled}
          className={cn(
            "w-full resize-none rounded-2xl border border-slate-700 bg-slate-800 px-4 py-2.5 pr-12 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50",
            "max-h-[200px] overflow-y-auto"
          )}
        />
        <Button
          size="sm"
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className="absolute right-1.5 bottom-1.5 h-7 w-7 rounded-full p-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
