"use client"

import React from 'react'
import { ChatContainer } from '@/components/chat/ChatContainer'
import { MessageSquare, History, Settings, LogOut, Plus } from 'lucide-react'

export default function ChatPage() {
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col border-r border-slate-800 bg-slate-900/50">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">A</div>
            <span className="text-xl font-bold text-slate-100 tracking-tight">Argume.ai</span>
          </div>
        </div>
        
        <div className="p-4">
          <button className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl transition-all font-medium shadow-lg shadow-indigo-500/10">
            <Plus className="h-4 w-4" /> Yeni Tartışma
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Geçmiş Tartışmalar</div>
          <div className="space-y-1">
            <div className="group flex items-center gap-3 p-3 rounded-xl bg-slate-800 text-sm text-slate-200 border border-slate-700 cursor-pointer">
              <MessageSquare className="h-4 w-4 text-indigo-400" />
              <span className="truncate font-medium">React State Management</span>
            </div>
            <div className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 text-sm text-slate-400 transition-all cursor-pointer border border-transparent hover:border-slate-800">
              <History className="h-4 w-4 text-slate-500" />
              <span className="truncate">Kuantum Fiziği Temelleri</span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">U</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">Demo Kullanıcı</p>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-tighter">Ücretsiz Plan</p>
            </div>
            <Settings className="h-4 w-4 text-slate-500" />
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm text-white">A</div>
            <span className="font-bold text-slate-100">Argume.ai</span>
          </div>
          <button className="p-2 text-slate-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
          </button>
        </header>

        <ChatContainer />
      </main>
    </div>
  )
}
