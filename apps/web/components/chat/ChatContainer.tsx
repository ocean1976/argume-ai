'use client'

import React, { useState, useRef, useEffect } from 'react'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { TypingIndicator } from './TypingIndicator'
import { ModelType } from './ModelAvatar'
import { InterjectionNote, InterjectionType } from './InterjectionNote'

export const dynamic = 'force-dynamic'

interface Interjection {
  type: InterjectionType
  modelName: string
  content: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  model?: ModelType
  timestamp: string
  interjection?: Interjection
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
    if (messages.length === 0 && onFirstMessage) onFirstMessage()

    setIsTyping(true)

    try {
      const workflow = [
        { role: 'assistant', model: 'deepseek' as ModelType, label: 'Fast Worker' },
        { role: 'assistant', model: 'claude' as ModelType, label: 'Architect' },
        { role: 'interjection', model: 'prosecutor' as ModelType, label: 'Prosecutor' }
      ]

      let currentMessages = [...messages, userMsg]

      for (const step of workflow) {
        setTypingModel(`${step.label} yanıtlıyor...`)
        
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: currentMessages.map(m => ({ role: m.role, content: m.content })),
            model: step.model
          })
        })

        if (!response.ok) continue

        const data = await response.json()
        const aiContent = data.choices?.[0]?.message?.content || ''

        if (aiContent) {
          if (step.role === 'interjection') {
            setMessages(prev => {
              const newMessages = [...prev]
              const lastAiIdx = newMessages.map(m => m.role).lastIndexOf('assistant')
              if (lastAiIdx !== -1) {
                newMessages[lastAiIdx] = {
                  ...newMessages[lastAiIdx],
                  interjection: {
                    type: 'BETTER_APPROACH',
                    modelName: 'Prosecutor (DeepSeek-R)',
                    content: aiContent.substring(0, 200) + (aiContent.length > 200 ? '...' : '')
                  }
                }
              }
              return newMessages
            })
          } else {
            const newMsg: Message = {
              id: Math.random().toString(36).substring(7),
              role: 'assistant',
              model: step.model,
              content: aiContent,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
            setMessages(prev => [...prev, newMsg])
            currentMessages.push(newMsg)
          }
        }
        await new Promise(r => setTimeout(r, 600))
      }
    } catch (err: any) {
      setError('Konsey tartışması sırasında bir hata oluştu.')
    } finally {
      setIsTyping(false)
    }
  }

  if (isInitial) return <ChatInput onSend={handleSend} isInitial={true} />

  return (
    <div className="flex flex-col h-screen bg-[#F9F8F6]">
      <div className="flex-1 overflow-y-auto pt-4 pb-32">
        <div className="w-full max-w-4xl mx-auto">
          {messages.map((msg) => (
            <div key={msg.id}>
              <MessageBubble 
                role={msg.role} 
                content={msg.content} 
                model={msg.model} 
                timestamp={msg.timestamp} 
              />
              {msg.interjection && (
                <div className="max-w-3xl mx-auto px-6 -mt-4 mb-8">
                  <InterjectionNote 
                    type={msg.interjection.type}
                    modelName={msg.interjection.modelName}
                    content={msg.interjection.content}
                  />
                </div>
              )}
            </div>
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
