"use client"

import React, { useState, useRef, useEffect } from 'react'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { TypingIndicator } from './TypingIndicator'
import { InterjectionNote, InterjectionType } from './InterjectionNote'
import { ModelType } from './ModelAvatar'
import WaitingRoom from './WaitingRoom'
import { 
  createConversation, 
  addMessage, 
  getConversationMessages,
  updateConversation 
} from '@/lib/supabase-queries'

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
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showWaitingRoom, setShowWaitingRoom] = useState(false)
  const [currentTier, setCurrentTier] = useState<1 | 2 | 3>(1)
  const [lastUserMessage, setLastUserMessage] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Sayfa açıldığında yeni konuşma oluştur ve geçmişi yükle
  useEffect(() => {
    initializeConversation()
  }, [])

  const initializeConversation = async () => {
    setIsLoading(true)
    try {
      // Yeni konuşma oluştur
      const conversation = await createConversation('Yeni Sohbet')
      
      if (conversation) {
        setConversationId(conversation.id)
        
        // Eğer veritabanında mesajlar varsa yükle
        const savedMessages = await getConversationMessages(conversation.id)
        if (savedMessages.length > 0) {
          setMessages(savedMessages)
          if (onFirstMessage) onFirstMessage()
        }
      }
    } catch (error) {
      console.error('Konuşma başlatma hatası:', error)
    } finally {
      setIsLoading(false)
    }
  }

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
    if (!conversationId) return

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

    // Kullanıcı mesajını Supabase'e kaydet
    await addMessage(conversationId, 'user', content)

    // Konuşma başlığını ilk mesajdan güncelle
    if (messages.length === 0) {
      const title = content.substring(0, 50) + (content.length > 50 ? '...' : '')
      await updateConversation(conversationId, { title })
    }

    const tier = analyzeTier(content)
    setCurrentTier(tier)
    
    if (tier >= 2) {
      setShowWaitingRoom(true)
    }

    await callOpenRouterAPI(content)
  }

  const callOpenRouterAPI = async (userMessage: string) => {
    if (!conversationId) return

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

      if (!response.ok) throw new Error('API request failed')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let fullContent = ''
      const aiMessageId = (Date.now() + 1).toString()
      let messageAdded = false
      let dbMessageId: string | null = null

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

                  const dbMessage = await addMessage(
                    conversationId,
                    'assistant',
                    fullContent,
                    'deepseek'
                  )
                  if (dbMessage) dbMessageId = dbMessage.id
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

      setShowWaitingRoom(false)

      if (dbMessageId && fullContent) {
        await updateConversation(conversationId, {
          updated_at: new Date().toISOString()
        })
      }

      setIsTyping(false)
    } catch (error) {
      console.error('API error:', error)
      setIsTyping(false)
      setShowWaitingRoom(false)
      
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-transparent">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
        </div>
      </div>
    )
  }

  // Eğer ilk aşamadaysak (isInitial), sadece input'u göster
  if (isInitial) {
    return (
      <div className="w-full">
        <ChatInput onSend={handleSend} disabled={isTyping} isInitial={true} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#F9F8F6]">
      {/* Messages Area */}
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
          
          {showWaitingRoom && (
            <WaitingRoom 
              userMessage={lastUserMessage}
              tier={currentTier}
              isActive={showWaitingRoom}
            />
          )}
          
          {isTyping && <TypingIndicator modelName="AI Model" />}
        </div>
      </div>

      {/* Input Area */}
      <ChatInput onSend={handleSend} disabled={isTyping} />
    </div>
  )
}
