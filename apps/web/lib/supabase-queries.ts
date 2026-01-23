import { createClient } from './supabase'
import { ModelType } from '@/components/chat/ModelAvatar'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  model?: ModelType
  timestamp: string
  is_interjection?: boolean
  interjection_type?: string
  modelName?: string
}

export interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
  message_count: number
}

/**
 * Yeni bir konuşma oluştur
 */
export async function createConversation(title: string) {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('conversations')
      .insert([
        {
          title: title || 'Yeni Sohbet',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Konuşma oluşturma hatası:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Konuşma oluşturma hatası:', error)
    return null
  }
}

/**
 * Konuşmaya mesaj ekle
 */
export async function addMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  model?: ModelType,
  modelName?: string
) {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversationId,
          role,
          content,
          model: model || null,
          model_name: modelName || null,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Mesaj ekleme hatası:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Mesaj ekleme hatası:', error)
    return null
  }
}

/**
 * Konuşmanın tüm mesajlarını getir
 */
export async function getConversationMessages(conversationId: string) {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Mesajları getirme hatası:', error)
      return []
    }

    return data.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      model: msg.model,
      modelName: msg.model_name,
      timestamp: new Date(msg.created_at).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      is_interjection: false,
    }))
  } catch (error) {
    console.error('Mesajları getirme hatası:', error)
    return []
  }
}

/**
 * Tüm konuşmaları getir
 */
export async function getConversations(): Promise<Conversation[]> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Konuşmaları getirme hatası:', error)
      return []
    }

    return data.map(conv => ({
      id: conv.id,
      title: conv.title,
      created_at: conv.created_at,
      updated_at: conv.updated_at,
      message_count: 0, // Opsiyonel olarak mesaj sayısı eklenebilir
    }))
  } catch (error) {
    console.error('Konuşmaları getirme hatası:', error)
    return []
  }
}

/**
 * Konuşmayı güncelle (başlık vb.)
 */
export async function updateConversation(conversationId: string, updates: any) {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('conversations')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId)
      .select()
      .single()

    if (error) {
      console.error('Konuşma güncelleme hatası:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Konuşma güncelleme hatası:', error)
    return null
  }
}

/**
 * Konuşmayı sil
 */
export async function deleteConversation(conversationId: string) {
  const supabase = createClient()
  
  try {
    // Önce mesajları sil (cascade olmadığı için)
    await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId)

    // Sonra konuşmayı sil
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)

    if (error) {
      console.error('Konuşma silme hatası:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Konuşma silme hatası:', error)
    return false
  }
}
