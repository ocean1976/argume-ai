'use client'

import React, { useState, useRef, useEffect } from 'react'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { TypingIndicator } from './TypingIndicator'
import { ModelType } from './ModelAvatar'
import { useSearchParams } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  model?: ModelType
  timestamp: string
}

export const ChatContainer = ({ onFirstMessage, isInitial = false }: { onFirstMessage?: () => void, isInitial?: boolean }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()
  const initialProcessed = useRef(false)

  useEffect(() => {
    if (!isInitial && !initialProcessed.current) {
      const q = searchParams.get('q')
      if (q) {
        initialProcessed.current = true
        handleSend(decodeURIComponent(q))
      }
    }
  }, [searchParams, isInitial])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSend = async (content: string) => {
    if (!content.trim() || isTyping) return
    setError(null)

    if (isInitial) {
      window.location.href = `/chat?q=${encodeURIComponent(content.trim())}`
      return
    }

    if (messages.length === 0 && onFirstMessage) onFirstMessage()

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)

    try {
      const models: ModelType[] = ['gpt', 'claude']
      
      for (const model of models) {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
            model: model
          })
        })

        if (!response.ok) {
          const errData = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }))
          throw new Error(errData.details || errData.error || `API Hatası (${response.status})`)
        }

        const data = await response.json()
        
        if (data.choices?.[0]?.message?.content) {
          const aiMsg: Message = {
            id: Math.random().toString(36),
            role: 'assistant',
            model: model,
            content: data.choices[0].message.content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
          setMessages(prev => [...prev, aiMsg])
        }
      }
    } catch (err: any) {
      console.error('Chat Error:', err)
      setError(err.message)
    } finally {
      setIsTyping(false)
    }
  }

  if (isInitial) return <ChatInput onSend={handleSend} isInitial={true} />

  return (
    <div className="flex flex-col h-full bg-[#F9F8F6]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="w-full">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} role={msg.role} content={msg.content} model={msg.model} timestamp={msg.timestamp} />
          ))}
          {isTyping && <div className="max-w-3xl mx-auto px-4 py-4"><TypingIndicator modelName="Konsey Tartışıyor..." /></div>}
          {error && (
            <div className="max-w-3xl mx-auto px-4 py-4">
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                <strong>Hata:</strong> {error}
              </div>
            </div>
          )}
        </div>
      </div>
      <ChatInput onSend={handleSend} disabled={isTyping} />
    </div>
  )
}
