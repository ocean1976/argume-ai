import React from 'react'
import { ChatContainer } from '@/components/chat/ChatContainer'
import { Sidebar } from '@/components/chat/Sidebar' // Sidebar'ı basitçe aşağıda tanımlayacağız veya placeholder bırakacağız

export default function ChatPage() {
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Desktop Sidebar Placeholder */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 bg-slate-900/50">
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white">A</div>
            <span className="text-lg font-bold text-slate-200">Argume.ai</span>
          </div>
        </div>
        <div className="flex-1 p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Konuşmalar</div>
          <div className="space-y-2">
            <div className="p-2 rounded-lg bg-slate-800 text-sm text-slate-200 border border-slate-700">
              React State Management
            </div>
            <div className="p-2 rounded-lg hover:bg-slate-800/50 text-sm text-slate-400 transition-colors cursor-pointer">
              Kuantum Fiziği Temelleri
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">Kullanıcı</p>
              <p className="text-xs text-slate-500 truncate">Ücretsiz Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center font-bold text-xs text-white">A</div>
            <span className="font-bold text-slate-200">Argume.ai</span>
          </div>
          <button className="p-2 text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
          </button>
        </header>

        <ChatContainer />
      </main>
    </div>
  )
}
