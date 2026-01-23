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

const MODEL_MAPPING: Record<string, ModelType> = {
  'deepseek/deepseek-chat': 'deepseek',
  'openai/gpt-4-turbo': 'gpt',
  'claude-3-opus': 'claude',
  'google/gemini-2.0-flash-exp': 'gemini',
  'grok-2': 'grok'
}

export const ChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES)
  const [isTyping, setIsTyping] = useState(false)
  const [useRealAPI, setUseRealAPI] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = async (content: string) => {
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    
    setMessages(prev => [...prev, newUserMessage])
    
    if (!useRealAPI) {
      // Mock response
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
    } else {
      // Real API call with streaming
      await callOpenRouterAPI(content)
    }
  }

  const callOpenRouterAPI = async (userMessage: string) => {
    setIsTyping(true)
    try {
      const conversationMessages = messages
        .filter(m => !m.is_interjection)
        .map(m => ({
          role: m.role,
          content: m.content
        }))
        .concat([{ role: 'user', content: userMessage }])

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationMessages,
          model: 'deepseek/deepseek-chat'
        })
      })

      if (!response.ok) {
        throw new Error('API request failed')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let fullContent = ''
      const aiMessageId = (Date.now() + 1).toString()
      let messageAdded = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.choices?.[0]?.delta?.content) {
                fullContent += data.choices[0].delta.content

                if (!messageAdded) {
                  const aiResponse: Message = {
                    id: aiMessageId,
                    role: 'assistant',
                    model: 'deepseek',
                    content: fullContent,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  }
                  setMessages(prev => [...prev, aiResponse])
                  messageAdded = true
                } else {
                  setMessages(prev =>
                    prev.map(m =>
                      m.id === aiMessageId ? { ...m, content: fullContent } : m
                    )
                  )
                }
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }

      setIsTyping(false)
    } catch (error) {
      console.error('API error:', error)
      setIsTyping(false)
      
      // Fallback to mock response
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        model: 'gpt',
        content: "API bağlantısında bir hata oluştu. Lütfen OpenRouter API anahtarınızı kontrol edin.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, aiResponse])
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#F9F8F6]">
      {/* Messages Area - Max Width 900px and Centered */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300"
      >
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-4">
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
          {isTyping && <TypingIndicator modelName="AI Model" />}
        </div>
      </div>

      {/* Input Area */}
      <ChatInput onSend={handleSend} disabled={isTyping} />
    </div>
  )
}
