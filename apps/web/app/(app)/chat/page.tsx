"use client"

import React, { useState } from 'react'
import { ChatContainer } from '@/components/chat/ChatContainer'
import { Sidebar } from '@/components/chat/Sidebar'
import { Menu, Settings, Share2 } from 'lucide-react'

export default function ChatPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Argume.ai Tartışması',
        text: 'Bu AI tartışmasına bir göz at!',
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Bağlantı kopyalandı!');
    }
  }

  return (
    <div className="flex h-screen bg-[#F9F8F6] overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative min-w-0 bg-[#F9F8F6]">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5] bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-xl md:hidden transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-base font-bold text-slate-800 leading-tight">React State Management</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Canlı Tartışma</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-[#E5E5E5] hover:border-[#D97706] hover:text-[#D97706] rounded-xl transition-all shadow-sm active:scale-95"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Paylaş</span>
            </button>
            <button className="p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-xl transition-all border border-transparent hover:border-[#E5E5E5]">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Chat Container */}
        <div className="flex-1 overflow-hidden">
          <ChatContainer />
        </div>
      </main>
    </div>
  )
}
