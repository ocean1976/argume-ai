import React from 'react'
import { Plus, MessageSquare, Settings, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
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
        "fixed inset-y-0 left-0 z-50 w-[260px] bg-[#F9F8F6] border-r border-[#E5E5E5] flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header - Logo and Name Centered */}
        <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-center gap-2">
          <div className="w-8 h-8 bg-[#D97706] rounded-lg flex items-center justify-center font-bold text-white shadow-sm">A</div>
          <span className="text-lg font-bold text-slate-800 tracking-tight">Argume.ai</span>
        </div>

        {/* New Chat Button - Full Width */}
        <div className="p-4">
          <button className="w-full flex items-center justify-center gap-2 bg-white border border-[#E5E5E5] hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl transition-all font-medium shadow-sm">
            <Plus className="h-4 w-4" /> Yeni Sohbet
          </button>
        </div>

        {/* Conversations List - Padding Fixed */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">Sohbetler</div>
          <div className="space-y-2">
            <div className="group flex flex-col p-3 rounded-xl bg-[#E6E1D6]/50 text-slate-800 border border-[#E5E2DA] cursor-pointer">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="h-3.5 w-3.5 text-[#D97706]" />
                <span className="truncate font-semibold text-sm">React State Management</span>
              </div>
              <span className="text-[10px] text-slate-500 ml-5">Bugün, 14:20</span>
            </div>
            
            <div className="group flex flex-col p-3 rounded-xl hover:bg-slate-100 text-slate-600 transition-all cursor-pointer border border-transparent">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                <span className="truncate text-sm">Kuantum Fiziği Temelleri</span>
              </div>
              <span className="text-[10px] text-slate-400 ml-5">Dün, 09:15</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5E5E5] space-y-2">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-slate-600">
            <CreditCard className="h-4 w-4" />
            <span className="text-sm font-medium">Krediler: 10/10</span>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-slate-600">
            <Settings className="h-4 w-4" />
            <span className="text-sm font-medium">Ayarlar</span>
          </div>
        </div>
      </aside>
    </>
  )
}
