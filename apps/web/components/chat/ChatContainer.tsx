"use client"

import React, { useState, useRef, useEffect } from 'react'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { TypingIndicator } from './TypingIndicator'
import { InterjectionNote, InterjectionType } from './InterjectionNote'
import { ModelType } from './ModelAvatar'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  model?: ModelType
  timestamp: string
  is_interjection?: boolean
  interjection_type?: InterjectionType
  modelName?: string
}

const MOCK_MESSAGES: Message[] = [
  {
    id: "1",
    role: "user",
    content: "React'ta state management için ne önerirsiniz?",
    timestamp: "09:30 PM"
  },
  {
    id: "2", 
    role: "assistant",
    content: "Küçük-orta projeler için Zustand öneriyorum. Minimal API, kolay öğrenme eğrisi ve Redux'a göre çok daha az boilerplate.",
    model: "deepseek",
    timestamp: "09:31 PM"
  },
  {
    id: "3",
    role: "assistant", 
    content: "DeepSeek'e katılıyorum. Ancak büyük ekiplerde Redux Toolkit da değerlendirilebilir - DevTools ve middleware ekosistemi güçlü.",
    model: "claude",
    timestamp: "09:32 PM"
  },
  {
    id: "4",
    role: "assistant",
    content: "Dikkat: Takımda Redux deneyimi varsa öğrenme eğrisi avantajı olabilir. Karar vermeden önce takım yetkinliklerini değerlendirin.",
    model: "claude",
    modelName: "Claude 3 Opus",
    is_interjection: true,
    interjection_type: "RISK_WARNING",
    timestamp: "09:32 PM"
  },
  {
    id: "5",
    role: "assistant",
    content: "Ek bilgi: Zustand, React Server Components ile de tam uyumlu çalışır.",
    model: "gpt",
    modelName: "GPT-4o",
    is_interjection: true,
    interjection_type: "INFO",
    timestamp: "09:33 PM"
  }
];

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
    
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        model: 'gpt',
        content: "Bu harika bir soru! State management seçimi projenizin ihtiyaçlarına göre değişir. Zustand modern bir tercih olsa da, yerleşik çözümleri (Context API) küçümsememek gerekir.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, aiResponse])
    }, 2000)
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages Area - Max Width 768px and Centered */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200"
      >
        <div className="max-w-[768px] mx-auto p-6 space-y-2">
          {messages.map((msg) => (
            <React.Fragment key={msg.id}>
              {msg.is_interjection ? (
                <InterjectionNote 
                  content={msg.content} 
                  modelName={msg.modelName} 
                  type={msg.interjection_type} 
                />
              ) : (
                <MessageBubble
                  role={msg.role}
                  content={msg.content}
                  model={msg.model}
                  timestamp={msg.timestamp}
                />
              )}
            </React.Fragment>
          ))}
          {isTyping && <TypingIndicator modelName="GPT-4o" />}
        </div>
      </div>

      {/* Input Area */}
      <ChatInput onSend={handleSend} disabled={isTyping} />
    </div>
  )
}
