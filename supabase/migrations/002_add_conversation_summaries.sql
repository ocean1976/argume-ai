-- Konuşma Özetleri Tablosu
-- Son 5 mesajdan eski olanların özetini saklamak için
CREATE TABLE conversation_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE UNIQUE,
  summary TEXT,
  message_count_summarized INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE conversation_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own conversation summaries" ON conversation_summaries
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update own conversation summaries" ON conversation_summaries
  FOR UPDATE USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

-- Messages tablosuna model_name sütunu ekle (eğer yoksa)
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS model_name TEXT;

-- Konuşma başına mesaj sayısını hızlı sorgulamak için index
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id 
ON messages(conversation_id);

-- Konuşma güncelleme zamanına göre sıralamak için index
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at 
ON conversations(updated_at DESC);
