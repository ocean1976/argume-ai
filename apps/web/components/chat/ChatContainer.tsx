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
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Otomatik scroll fonksiyonu
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Mesajlar veya yazma durumu değiştiğinde scroll yap
  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = async (content: string) => {
    if (!content.trim() || isTyping) return
    setError(null)

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
      // Konsey mantığı: GPT ve Claude'dan sırayla yanıt alalım
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
          const errData = await response.json().catch(() => ({ error: 'API Hatası' }))
          throw new Error(errData.details?.error?.message || errData.error || 'Bağlantı hatası')
        }

        // stream: false olduğu için doğrudan JSON yanıtı alıyoruz
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
        
        // Modeller arası kısa bekleme
        await new Promise(r => setTimeout(r, 500))
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
    <div className="flex flex-col h-screen bg-[#F9F8F6]">
      {/* Mesaj Alanı */}
      <div className="flex-1 overflow-y-auto pt-4">
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
              <TypingIndicator modelName="Konsey Tartışıyor..." />
            </div>
          )}
          {error && (
            <div className="px-4 py-4">
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                <strong>Hata:</strong> {error}
              </div>
            </div>
          )}
          {/* Scroll Hedefi */}
          <div ref={messagesEndRef} className="h-20" />
        </div>
      </div>
      
      {/* Sabit Input Alanı */}
      <div className="border-t border-slate-100 bg-white/80 backdrop-blur-md">
        <ChatInput onSend={handleSend} disabled={isTyping} />
      </div>
    </div>
  )
}
