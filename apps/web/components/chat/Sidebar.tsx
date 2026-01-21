import React from 'react'
import Image from 'next/image'
import { Plus, MessageSquare, Settings, CreditCard, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const conversations = [
    { id: '1', title: 'React State Management', date: 'Bugün, 14:20', active: true },
    { id: '2', title: 'Kuantum Fiziği Temelleri', date: 'Dün, 09:15', active: false },
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed md:relative inset-y-0 left-0 w-[260px] bg-[#F9F8F6] border-r border-[#E5E5E5] z-50 transition-transform duration-300 ease-in-out flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Logo Area */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
            <Image 
              src="/logo.png" 
              alt="Argume.ai" 
              width={32} 
              height={32}
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-bold text-slate-800 text-lg tracking-tight">Argume.ai</span>
        </div>

        {/* New Chat Button */}
        <div className="px-4 mb-6">
          <button className="w-full flex items-center justify-center gap-2 bg-white border border-[#E5E5E5] hover:bg-slate-50 text-slate-700 font-semibold py-2.5 px-4 rounded-xl shadow-sm transition-all active:scale-[0.98]">
            <Plus className="h-4 w-4" />
            <span>Yeni Sohbet</span>
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 scrollbar-thin">
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Sohbetler</p>
          {conversations.map((conv) => (
            <button
              key={conv.id}
              className={cn(
                "w-full flex flex-col items-start gap-1 px-4 py-3 rounded-xl transition-colors group",
                conv.active 
                  ? "bg-[#E6E1D6] text-slate-900 shadow-sm" 
                  : "text-slate-600 hover:bg-[#F0EDE4]"
              )}
            >
              <div className="flex items-center gap-2 w-full">
                <MessageSquare className={cn("h-4 w-4", conv.active ? "text-[#D97706]" : "text-slate-400")} />
                <span className="text-sm font-medium truncate flex-1 text-left">{conv.title}</span>
              </div>
              <span className="text-[10px] text-slate-400 ml-6">{conv.date}</span>
            </button>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-[#E5E5E5] space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-[#F0EDE4] rounded-xl transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E5E5] flex items-center justify-center group-hover:border-[#D97706] transition-colors">
              <CreditCard className="h-4 w-4 text-slate-400 group-hover:text-[#D97706]" />
            </div>
            <div className="flex flex-col items-start flex-1">
              <span className="font-medium">Krediler</span>
              <span className="text-[10px] text-slate-400">10 / 10 Kalan</span>
            </div>
            <ChevronRight className="h-3 w-3 text-slate-300" />
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-[#F0EDE4] rounded-xl transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E5E5] flex items-center justify-center group-hover:border-slate-400 transition-colors">
              <Settings className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
            </div>
            <span className="font-medium flex-1 text-left">Ayarlar</span>
          </button>
        </div>
      </aside>
    </>
  )
}
