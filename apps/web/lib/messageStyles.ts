// Her mesaj tipinin sembolü, label'ı ve rengi

export type MessageType = 
  | 'normal'
  | 'thesis'
  | 'antithesis'
  | 'synthesis'
  | 'warning'
  | 'support'
  | 'info'
  | 'error'
  | 'success'
  | 'question'
  | 'waiting';

interface MessageStyle {
  icon: string;
  label: string | null;
  color: string;
}

export const getMessageStyle = (type: MessageType): MessageStyle => {
  const styles: Record<MessageType, MessageStyle> = {
    // Normal yanıt
    normal: { 
      icon: '🌷', 
      label: null, 
      color: '#9CA3AF' 
    },
    
    // Kapışma modları
    thesis: { 
      icon: '🛡️', 
      label: 'TEZ', 
      color: '#4B5563' 
    },
    antithesis: { 
      icon: '⚔️', 
      label: 'ANTİTEZ', 
      color: '#1F2937' 
    },
    synthesis: { 
      icon: '◆', 
      label: 'SENTEZ', 
      color: '#111827' 
    },
    
    // Özel durumlar
    warning: { 
      icon: '⚠️', 
      label: 'UYARI', 
      color: '#D97706' 
    },
    support: { 
      icon: '💬', 
      label: 'DESTEK', 
      color: '#3B82F6' 
    },
    info: { 
      icon: 'ℹ️', 
      label: 'BİLGİ', 
      color: '#6B7280' 
    },
    error: { 
      icon: '✕', 
      label: 'HATA', 
      color: '#EF4444' 
    },
    success: { 
      icon: '✓', 
      label: 'ONAY', 
      color: '#10B981' 
    },
    question: { 
      icon: '?', 
      label: 'SORU', 
      color: '#8B5CF6' 
    },
    
    // Bekletici mesaj
    waiting: { 
      icon: '🌷', 
      label: null, 
      color: '#D1D5DB' // Daha soluk gri
    },
  };
  
  return styles[type] || styles.normal;
};
