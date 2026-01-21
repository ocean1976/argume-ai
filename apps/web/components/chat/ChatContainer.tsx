"use client"

import React, { useState, useRef, useEffect } from 'react'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { TypingIndicator } from './TypingIndicator'
import { InterjectionNote } from './InterjectionNote'
import { ModelType } from './ModelAvatar'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  model?: ModelType
  modelName?: string
  timestamp: string
  interjection?: string
}

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'user',
    content: "React'ta state management önerisi?",
    timestamp: '14:20',
  },
  {
    id: '2',
    role: 'assistant',
    model: 'deepseek',
    modelName: 'DeepSeek V3',
    content: "Küçük ve orta ölçekli projeler için Zustand'ı öneririm. Redux'a göre çok daha az boilerplate gerektirir ve öğrenme eğrisi düşüktür.",
    timestamp: '14:21',
  },
  {
    id: '3',
    role: 'assistant',
    model: 'claude',
    modelName: 'Claude 3.5 Sonnet',
    content: "DeepSeek'e katılıyorum, ancak projeniz çok büyükse ve karmaşık veri akışları varsa Redux Toolkit hâlâ endüstri standardıdır. Ayrıca Context API da basit durumlar için yeterli olabilir.",
    timestamp: '14:21',
    interjection: "Dikkat: Takım deneyimini ve projenin gelecekteki ölçeğini de düşünmelisiniz."
  }
]

export const ChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES)
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = (content: string) => {
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    
    setMessages(prev => [...prev, newUserMessage])
    
    // Simulate AI response
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        model: 'gpt',
        modelName: 'GPT-4o',
        content: "Bu harika bir soru! State management seçimi projenizin ihtiyaçlarına göre değişir. Zustand modern bir tercih olsa da, yerleşik çözümleri (Context API) küçümsememek gerekir.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, aiResponse])
    }, 2000)
  }

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2 scrollbar-thin scrollbar-thumb-slate-800"
      >
        <div className="max-w-3xl mx-auto">
          {messages.map((msg) => (
            <React.Fragment key={msg.id}>
              <MessageBubble
                role={msg.role}
                content={msg.content}
                model={msg.model}
                modelName={msg.modelName}
                timestamp={msg.timestamp}
              />
              {msg.interjection && (
                <InterjectionNote content={msg.interjection} />
              )}
            </React.Fragment>
          ))}
          {isTyping && <TypingIndicator modelName="GPT-4o" />}
        </div>
      </div>

      {/* Input Area */}
      <div className="max-w-3xl w-full mx-auto">
        <ChatInput onSend={handleSend} disabled={isTyping} />
      </div>
    </div>
  )
}
