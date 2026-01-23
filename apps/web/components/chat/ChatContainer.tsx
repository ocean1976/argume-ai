'use client'

import React, { useState, useRef, useEffect } from 'react'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { TypingIndicator } from './TypingIndicator'
import { InterjectionNote, InterjectionType } from './InterjectionNote'
import { ModelType } from './ModelAvatar'
import WaitingRoom from './WaitingRoom'

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

interface ChatContainerProps {
  onFirstMessage?: () => void
  isInitial?: boolean
}

export const ChatContainer = ({ onFirstMessage, isInitial = false }: ChatContainerProps) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showWaitingRoom, setShowWaitingRoom] = useState(false)
  const [currentTier, setCurrentTier] = useState<1 | 2 | 3>(1)
  const [lastUserMessage, setLastUserMessage] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, showWaitingRoom])

  const analyzeTier = (message: string): 1 | 2 | 3 => {
    const wordCount = message.split(' ').length
    const technicalTerms = [
      'algoritma', 'mimari', 'tasarım', 'etik', 'analiz', 'karmaşık',
      'algorithm', 'architecture', 'design', 'ethics', 'analysis', 'complex',
      'yapı', 'strateji', 'sistem', 'model', 'framework', 'pattern'
    ]
    const hasTechnicalTerms = technicalTerms.some(term => 
      message.toLowerCase().includes(term)
    )

    if (wordCount > 30 || hasTechnicalTerms) {
      return 3
    } else if (wordCount > 15) {
      return 2
    }
    return 1
  }

  const handleSend = async (content: string) => {
    if (!content.trim()) return

    // İlk mesaj gönderiliyorsa callback'i çağır
    if (messages.length === 0 && onFirstMessage) {
      onFirstMessage()
    }

    // Kullanıcı mesajını ekle
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    
    setMessages(prev => [...prev, newUserMessage])
    setLastUserMessage(content)

    const tier = analyzeTier(content)
    setCurrentTier(tier)
    
    if (tier >= 2) {
      setShowWaitingRoom(true)
    }

    await callOpenRouterAPI(content, [...messages, newUserMessage])
  }

  const callOpenRouterAPI = async (userMessage: string, allMessages: Message[]) => {
    setIsTyping(true)
    try {
      const conversationMessages = allMessages
        .filter(m => !m.is_interjection)
        .map(m => ({
          role: m.role,
          content: m.content
        }))

      // Modelleri sırayla çağıralım (Konsey mantığı)
      const models: ModelType[] = ['gpt', 'claude', 'deepseek']
      
      for (const model of models) {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: conversationMessages,
            model: model
          })
        })

        if (!response.ok) continue

        const reader = response.body?.getReader()
        if (!reader) continue

        const decoder = new TextDecoder()
        let fullContent = ''
        const aiMessageId = Math.random().toString(36).substring(7)
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
                      model: model,
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
              } catch (e) {}
            }
          }
        }
        // Her modelden sonra kısa bir bekleme (opsiyonel)
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      setShowWaitingRoom(false)
      setIsTyping(false)
    } catch (error) {
      console.error('API error:', error)
      setIsTyping(false)
      setShowWaitingRoom(false)
      
      const aiResponse: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        model: 'gpt',
        content: "API bağlantısında bir hata oluştu. Lütfen OpenRouter API anahtarınızı kontrol edin.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, aiResponse])
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-transparent">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
        </div>
      </div>
    )
  }

  if (isInitial) {
    return (
      <div className="w-full">
        <ChatInput onSend={handleSend} disabled={isTyping} isInitial={true} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#F9F8F6]">
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
                  type={msg.interjection_type as any} 
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
          
          {showWaitingRoom && (
            <WaitingRoom 
              userMessage={lastUserMessage}
              tier={currentTier}
              isActive={showWaitingRoom}
            />
          )}
          
          {isTyping && <TypingIndicator modelName="Konsey Tartışıyor..." />}
        </div>
      </div>
      <ChatInput onSend={handleSend} disabled={isTyping} />
    </div>
  )
}
