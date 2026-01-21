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
      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-[#E5E5E5] bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg md:hidden transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 md:hidden">
              <div className="w-6 h-6 bg-[#D97706] rounded flex items-center justify-center font-bold text-xs text-white">A</div>
              <span className="font-bold text-slate-800 text-sm">Argume.ai</span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-sm font-semibold text-slate-700">React State Management</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-[#E5E5E5] bg-white shadow-sm"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Paylaş</span>
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
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
