"use client"

import React, { useState } from 'react'
import { ChatContainer } from '@/components/chat/ChatContainer'
import { Sidebar } from '@/components/chat/Sidebar'
import { Menu, Share2, Search, MessageSquare, Code, Lightbulb, Globe } from 'lucide-react'
import Image from 'next/image'

export default function ChatPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [hasMessages, setHasMessages] = useState(false)

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Argume AI Tartışması',
        text: 'Bu AI tartışmasına bir göz at!',
        url: window.location.href,
      }).catch(console.error);
    } else {
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
              <span className="font-semibold text-slate-800">argu me</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-[#E5E5E5] hover:border-[#D97706] hover:text-[#D97706] rounded-xl transition-all shadow-sm active:scale-95"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Paylaş</span>
              </button>
            </div>
          </header>
        )}

        {/* Empty State - Claude Style Merkezi Giriş */}
        {!hasMessages && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
            <div className="w-full max-w-3xl flex flex-col items-center gap-8">
              
              {/* Logo & Title */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 flex items-center justify-center">
                  <Image 
                    src="/logo.png" 
                    alt="Argume AI" 
                    width={48} 
                    height={48}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h1 className="text-4xl font-serif font-medium text-slate-800 tracking-tight">
                  argu me
                </h1>
              </div>

              {/* Central Chat Input Area */}
              <div className="w-full">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-serif text-slate-700">
                    Size nasıl yardımcı olabilirim?
                  </h2>
                </div>
                
                <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm p-2 focus-within:ring-2 focus-within:ring-slate-200 transition-all">
                  <ChatContainer onFirstMessage={() => setHasMessages(true)} isInitial={true} />
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap justify-center gap-3 mt-6">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E5E5] rounded-full text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                    <Code className="w-4 h-4" />
                    <span>Kod Yaz</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E5E5] rounded-full text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                    <Lightbulb className="w-4 h-4" />
                    <span>Fikir Üret</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E5E5] rounded-full text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                    <Search className="w-4 h-4" />
                    <span>Analiz Et</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E5E5] rounded-full text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                    <Globe className="w-4 h-4" />
                    <span>Çeviri Yap</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Chat State */}
        {hasMessages && (
          <div className="flex-1 overflow-hidden">
            <ChatContainer onFirstMessage={() => setHasMessages(true)} isInitial={false} />
          </div>
        )}

      </main>
    </div>
  )
}
