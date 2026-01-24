'use client'

import React, { useState, useRef, useEffect } from 'react'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { TypingIndicator } from './TypingIndicator'
import { ModelType } from './ModelAvatar'

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
  const [typingModel, setTypingModel] = useState<string>('Konsey Tartışıyor...')
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleSend = async (content: string) => {
    if (!content.trim() || isTyping) return
    setError(null)

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    
    setMessages(prev => [...prev, userMsg])
    
    if (messages.length === 0 && onFirstMessage) {
      onFirstMessage()
    }

    setIsTyping(true)

    try {
      // TÜM MODELLER: GPT, Claude, Gemini, Grok, DeepSeek
      const models: ModelType[] = ['gpt', 'claude', 'gemini', 'grok', 'deepseek']
      
      for (const model of models) {
        setTypingModel(`${model.toUpperCase()} yanıtlıyor...`)
        
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
            model: model
          })
        })

        if (!response.ok) {
          const errData = await response.json().catch(() => ({ error: 'API Hatası' }))
          // Bir model hata verirse diğerlerine devam et, ama hatayı logla
          console.error(`${model} Error:`, errData)
          continue 
        }

        const data = await response.json()
        const aiContent = data.choices?.[0]?.message?.content || ''

        if (aiContent) {
          setMessages(prev => [...prev, {
            id: Math.random().toString(36).substring(7),
            role: 'assistant',
            model: model,
            content: aiContent,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }])
        }
        
        // Modeller arası geçişte doğal bir bekleme
        await new Promise(r => setTimeout(r, 800))
      }
    } catch (err: any) {
      console.error('Chat Error:', err)
      setError('Konsey tartışması sırasında bir hata oluştu.')
    } finally {
      setIsTyping(false)
      setTypingModel('Konsey Tartışıyor...')
    }
  }

  if (isInitial) return <ChatInput onSend={handleSend} isInitial={true} />

  return (
    <div className="flex flex-col h-screen bg-[#F9F8F6]">
      <div className="flex-1 overflow-y-auto pt-4 pb-32">
        <div className="w-full max-w-4xl mx-auto">
          {messages.map((msg) => (
            <MessageBubble 
              key={msg.id} 
              role={msg.role} 
              content={msg.content} 
              model={msg.model} 
              timestamp={msg.timestamp} 
            />
          ))}
          {isTyping && (
            <div className="px-4 py-4">
              <TypingIndicator modelName={typingModel} />
            </div>
          )}
          {error && (
            <div className="px-4 py-4">
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                <strong>Hata:</strong> {error}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 md:left-64 border-t border-slate-100 bg-white/80 backdrop-blur-md z-10">
        <div className="max-w-4xl mx-auto">
          <ChatInput onSend={handleSend} disabled={isTyping} />
        </div>
      </div>
    </div>
  )
}
