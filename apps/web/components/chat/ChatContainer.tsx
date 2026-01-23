'use client'

import React, { useState, useRef, useEffect } from 'react'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { TypingIndicator } from './TypingIndicator'
import { InterjectionNote, InterjectionType } from './InterjectionNote'
import { ModelType } from './ModelAvatar'
import WaitingRoom from './WaitingRoom'
import { useSearchParams } from 'next/navigation'

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
  const [showWaitingRoom, setShowWaitingRoom] = useState(false)
  const [currentTier, setCurrentTier] = useState<1 | 2 | 3>(1)
  const [lastUserMessage, setLastUserMessage] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()
  const initialMessageProcessed = useRef(false)

  // URL'den gelen mesajı kontrol et
  useEffect(() => {
    if (!isInitial && !initialMessageProcessed.current) {
      const q = searchParams.get('q')
      if (q) {
        initialMessageProcessed.current = true
        handleSend(decodeURIComponent(q))
      }
    }
  }, [searchParams, isInitial])

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
    if (wordCount > 30) return 3
    if (wordCount > 15) return 2
    return 1
  }

  const handleSend = async (content: string) => {
    if (!content.trim()) return

    if (isInitial) {
      // Ana sayfadaysak chat sayfasına yönlendir
      window.location.href = `/chat?q=${encodeURIComponent(content)}`
      return
    }

    if (messages.length === 0 && onFirstMessage) {
      onFirstMessage()
    }

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
    if (tier >= 2) setShowWaitingRoom(true)

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
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      setShowWaitingRoom(false)
      setIsTyping(false)
    } catch (error) {
      console.error('API error:', error)
      setIsTyping(false)
      setShowWaitingRoom(false)
    }
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
        className="flex-1 overflow-y-auto"
      >
        <div className="w-full">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
              model={msg.model}
              timestamp={msg.timestamp}
            />
          ))}
          
          {showWaitingRoom && (
            <div className="max-w-3xl mx-auto px-4 py-4">
              <WaitingRoom 
                userMessage={lastUserMessage}
                tier={currentTier}
                isActive={showWaitingRoom}
              />
            </div>
          )}
          
          {isTyping && (
            <div className="max-w-3xl mx-auto px-4 py-4">
              <TypingIndicator modelName="Konsey Tartışıyor..." />
            </div>
          )}
        </div>
      </div>
      <ChatInput onSend={handleSend} disabled={isTyping} />
    </div>
  )
}
