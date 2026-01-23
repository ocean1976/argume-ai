"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Plus, MessageSquare, Settings, CreditCard, ChevronRight, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getConversations, deleteConversation } from '@/lib/supabase-queries'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  currentConversationId?: string
  onSelectConversation?: (id: string) => void
}

interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
  message_count: number
}

export const Sidebar = ({ isOpen, onClose, currentConversationId, onSelectConversation }: SidebarProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    setIsLoading(true)
    try {
      const data = await getConversations()
      setConversations(data)
    } catch (error) {
      console.error('Konuşmaları yükleme hatası:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (confirm('Bu konuşmayı silmek istediğinizden emin misiniz?')) {
      try {
        const success = await deleteConversation(id)
        if (success) {
          setConversations(prev => prev.filter(c => c.id !== id))
        }
      } catch (error) {
        console.error('Konuşma silme hatası:', error)
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return `Bugün, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Dün, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return date.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })
    }
  }

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
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
            <Image 
              src="/logo.png" 
              alt="Argume AI" 
              width={40} 
              height={40}
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-bold text-slate-800 text-lg tracking-tight">argu me</span>
        </div>

        {/* New Chat Button */}
        <div className="px-4 mb-6">
          <button 
            onClick={() => {
              window.location.reload()
              onClose()
            }}
            className="w-full flex items-center justify-center gap-2 bg-white border border-[#E5E5E5] hover:bg-slate-50 text-slate-700 font-semibold py-2.5 px-4 rounded-xl shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Yeni Sohbet</span>
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 scrollbar-thin">
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Sohbetler</p>
          
          {isLoading ? (
            <div className="px-4 py-3 text-center text-sm text-slate-400">
              Yükleniyor...
            </div>
          ) : conversations.length === 0 ? (
            <div className="px-4 py-3 text-center text-sm text-slate-400">
              Henüz sohbet yok
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className="group relative"
              >
                <button
                  onClick={() => {
                    onSelectConversation?.(conv.id)
                    onClose()
                  }}
                  className={cn(
                    "w-full flex flex-col items-start gap-1 px-4 py-3 rounded-xl transition-colors",
                    currentConversationId === conv.id
                      ? "bg-[#E6E1D6] text-slate-900 shadow-sm" 
                      : "text-slate-600 hover:bg-[#F0EDE4]"
                  )}
                >
                  <div className="flex items-center gap-2 w-full">
                    <MessageSquare className={cn("h-4 w-4", currentConversationId === conv.id ? "text-[#D97706]" : "text-slate-400")} />
                    <span className="text-sm font-medium truncate flex-1 text-left">{conv.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 ml-6">{formatDate(conv.updated_at)}</span>
                </button>
                
                {/* Delete Button - Hover'da görünür */}
                <button
                  onClick={(e) => handleDeleteConversation(conv.id, e)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  title="Sohbeti sil"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
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
            <div className="w-8 h-8 rounded-lg bg-transparent border border-[#E5E5E5] flex items-center justify-center group-hover:border-slate-400 transition-colors">
              <Settings className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
            </div>
            <span className="font-medium flex-1 text-left">Ayarlar</span>
          </button>
        </div>
      </aside>
    </>
  )
}
