'use client'

import React, { useState } from 'react'
import { ChatContainer } from '@/components/chat/ChatContainer'
import { Sidebar } from '@/components/chat/Sidebar'
import { Menu, Share2, Search, MessageSquare, Code, Lightbulb, Globe } from 'lucide-react'
import Image from 'next/image'

export default function ChatPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [hasMessages, setHasMessages] = useState(false)

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.share) {
      navigator.share({
        title: 'Argume AI Tartışması',
        text: 'Bu AI tartışmasına bir göz at!',
        url: window.location.href,
      }).catch(console.error);
    } else if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      alert('Bağlantı kopyalandı!');
    }
  }

  return (
    <div className="flex h-screen bg-[#F9F8F6] overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Area */}
      <main className="flex-1 flex flex-col relative min-w-0 bg-[#F9F8F6]">
        
        {/* Header - Sadece aktif chat sırasında görünür */}
        {hasMessages && (
          <header className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5] bg-[#F9F8F6]/80 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-xl md:hidden transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="w-7 h-7 flex items-center justify-center">
                <Image 
                  src="/logo.png" 
                  alt="Argu Me" 
                  width={28} 
                  height={28}
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-all border border-slate-200"
              >
                <Share2 className="h-4 w-4" />
                <span>Paylaş</span>
              </button>
            </div>
          </header>
        )}

        {/* Chat Content */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
              {!hasMessages ? (
                /* Central Chat Input Area */
                <div className="w-full">
                  <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-transparent overflow-hidden">
                        <Image 
                          src="/logo.png" 
                          alt="Argume" 
                          width={40} 
                          height={40}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <h2 className="text-3xl font-serif font-light text-slate-900 tracking-tight">
                        Ready to Argu Me?
                      </h2>
                    </div>
                    <p className="text-lg text-slate-500 font-normal max-w-2xl mx-auto leading-relaxed">
                      Orchestrate GPT, Claude, Gemini, Grok and DeepSeek to find the absolute truth.
                    </p>
                  </div>

                  <div className="max-w-2xl mx-auto">
                    <ChatContainer 
                      isInitial={true} 
                      onFirstMessage={() => setHasMessages(true)} 
                    />
                    
                    {/* Quick Actions */}
                    <div className="flex flex-wrap justify-center gap-2 mt-8">
                      {[
                        { icon: Code, label: 'Kod Yaz' },
                        { icon: Lightbulb, label: 'Fikir Üret' },
                        { icon: Search, label: 'Analiz Et' },
                        { icon: Globe, label: 'Çeviri Yap' }
                      ].map((action) => (
                        <button 
                          key={action.label}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition-all shadow-sm"
                        >
                          <action.icon className="h-4 w-4" />
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Active Chat Area */
                <ChatContainer isInitial={false} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
