'use client'

import React, { useState, useRef, useEffect } from 'react'
import { MessageBubble, MessageType } from './MessageBubble'
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
  type?: MessageType
}

export const ChatContainer = ({ onFirstMessage, isInitial = false }: { onFirstMessage?: () => void, isInitial?: boolean }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [typingModel, setTypingModel] = useState<string>('Konsey Tartışıyor...')
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
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
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'normal'
    }
    
    setMessages(prev => [...prev, userMsg])
    if (messages.length === 0 && onFirstMessage) onFirstMessage()

    setIsTyping(true)

    try {
      const workflow = [
        { role: 'assistant', model: 'gpt' as ModelType, label: 'TEZ (🛡️)', type: 'thesis' as MessageType },
        { role: 'assistant', model: 'claude' as ModelType, label: 'ANTİTEZ (⚔️)', type: 'antithesis' as MessageType },
        { role: 'assistant', model: 'deepseek' as ModelType, label: 'SENTEZ (◆)', type: 'synthesis' as MessageType }
      ]

      let currentMessages = [...messages, userMsg]

      for (const step of workflow) {
        setTypingModel(`${step.label} hazırlanıyor...`)
        
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: currentMessages.map(m => ({ role: m.role, content: m.content })),
            model: step.model,
            workflowStep: step.type
          })
        })

        if (!response.ok) continue

        const data = await response.json()
        const aiContent = data.choices?.[0]?.message?.content || ''

        if (aiContent) {
          const newMsg: Message = {
            id: Math.random().toString(36).substring(7),
            role: 'assistant',
            model: step.model,
            content: aiContent,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: step.type
          }
          setMessages(prev => [...prev, newMsg])
          currentMessages.push(newMsg)
        }
        await new Promise(r => setTimeout(r, 800))
      }
    } catch (err: any) {
      setError('Konsey tartışması sırasında bir hata oluştu.')
    } finally {
      setIsTyping(false)
    }
  }

  if (isInitial) return <ChatInput onSend={handleSend} isInitial={true} />

  return (
    <div className="flex flex-col h-screen bg-[#F9F8F6] overflow-hidden">
      <div className="flex-1 overflow-y-auto pt-4 pb-10 chat-messages">
        <div className="w-full max-w-4xl mx-auto">
          {messages.map((msg) => (
            <div key={msg.id}>
              <MessageBubble 
                role={msg.role} 
                content={msg.content} 
                model={msg.model} 
                timestamp={msg.timestamp}
                type={msg.type}
              />
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
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>
      
      <div className="shrink-0 border-t border-slate-100 bg-white/80 backdrop-blur-md z-10 input-container">
        <div className="max-w-4xl mx-auto">
          <ChatInput onSend={handleSend} disabled={isTyping} />
        </div>
      </div>
    </div>
  )
}
