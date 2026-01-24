'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import MessageBubble from './MessageBubble';
import { ChatInput } from './ChatInput';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  type?: any;
}

interface ChatContainerProps {
  isInitial?: boolean;
  onFirstMessage?: () => void;
}

export default function ChatContainer({ isInitial = false, onFirstMessage }: ChatContainerProps = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loadingMessage]);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query && messages.length === 0) {
      handleSend(query);
    }
  }, [searchParams]);

  const handleSend = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
    };

    // Call onFirstMessage if this is the first message
    if (messages.length === 0 && onFirstMessage) {
      onFirstMessage();
    }

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setLoadingMessage("Analiz ediliyor... 🌷");

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      });

      if (!response.ok) throw new Error('Bağlantı hatası');
      
      const data = await response.json();
      
      // Tier'a göre bekletici mesajları simüle edebiliriz veya doğrudan sonuçları basabiliriz
      // Gerçek bir akışta her model için ayrı bekletici mesajlar backend'den stream edilebilir
      // Şimdilik basitçe sonuçları ekliyoruz
      
      if (data.responses && data.responses.length > 0) {
        const newAssistantMessages = data.responses.map((res: any, index: number) => ({
          id: (Date.now() + index + 1).toString(),
          role: 'assistant',
          content: res.content,
          model: res.model,
          type: res.type
        }));
        
        setMessages((prev) => [...prev, ...newAssistantMessages]);
      }
    } catch (error) {
      console.error('Hata:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
          type: 'error'
        },
      ]);
    } finally {
      setIsLoading(false);
      setLoadingMessage(null);
    }
  };

  // If isInitial, only show ChatInput
  if (isInitial) {
    return <ChatInput onSend={handleSend} disabled={isLoading} isInitial={true} />;
  }

  return (
    <div className="flex flex-col h-screen bg-[#F9F8F6]">
      <div className="flex-1 overflow-y-auto chat-messages scrollbar-hide">
        <div className="max-w-3xl mx-auto py-10 px-6 space-y-10">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {isLoading && loadingMessage && (
            <div className="animate-pulse">
              <MessageBubble 
                message={{
                  id: 'loading',
                  role: 'assistant',
                  content: loadingMessage,
                  type: 'waiting'
                }} 
              />
            </div>
          )}
          
          <div ref={messagesEndRef} className="h-20" />
        </div>
      </div>

      <div className="border-t border-gray-100 bg-white p-4 sticky bottom-0">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSend={handleSend} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
}
