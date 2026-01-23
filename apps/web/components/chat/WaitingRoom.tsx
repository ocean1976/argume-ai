'use client'

import { useEffect, useState } from 'react'
import JesterMessage from './JesterMessage'

interface JesterMessageType {
  id: string
  type: 'greeting' | 'question' | 'insight' | 'status' | 'humor'
  content: string
  timestamp: string
}

interface WaitingRoomProps {
  userMessage: string
  tier: 1 | 2 | 3
  isActive: boolean
  onComplete?: () => void
}

export default function WaitingRoom({
  userMessage,
  tier,
  isActive,
}: WaitingRoomProps) {
  const [jesterMessages, setJesterMessages] = useState<JesterMessageType[]>([])
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    if (!isActive) return

    // Smart Jester API'sından dinamik yorum al
    const fetchSmartJesterComment = async () => {
      try {
        const response = await fetch('/api/jester', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userMessage })
        })

        if (response.ok) {
          const data = await response.json()
          if (data.jesterComment) {
            setJesterMessages([
              {
                id: `jester_smart_${Date.now()}`,
                type: 'greeting',
                content: data.jesterComment,
                timestamp: new Date().toISOString(),
              },
            ])
          }
        }
      } catch (error) {
        console.error('Smart Jester error:', error)
        // Fallback to default greeting
        const greetings = [
          `Harika bir soru! Konseyi topluyorum... 🛡️`,
          `Bunu tartışmaya değer! Uzmanlar çağrılıyor... 🏛️`,
          `Derinlemesine bir analiz yapacağız. Biraz sabır... ⏳`,
          `Bu soru için en iyi beyinleri topladım! 🧠`,
          `Hmm, bu karmaşık görünüyor. Hazırlanıyoruz... 🤔`,
        ]

        const greeting = greetings[Math.floor(Math.random() * greetings.length)]
        setJesterMessages([
          {
            id: `jester_greeting_${Date.now()}`,
            type: 'greeting',
            content: greeting,
            timestamp: new Date().toISOString(),
          },
        ])
      }
    }

    fetchSmartJesterComment()

    // Timer başlat
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)

    // Zamanlanmış mesajlar
    const schedules = [
      {
        delay: 3000,
        type: 'question' as const,
        content: `Bu konuda senin ilk düşüncen neydi? 🤔`,
      },
      {
        delay: 8000,
        type: 'insight' as const,
        content: `💡 İlginç Gerçek: Bu konu aslında daha karmaşık olabilir...`,
      },
      {
        delay: 15000,
        type: 'status' as const,
        content: tier === 1
          ? `⚡ Hızlı modeller yanıt hazırlıyor...`
          : tier === 2
          ? `📚 Tartışma devam ediyor...`
          : `🧠 Opus derin bir analiz yapıyor...`,
      },
      {
        delay: 25000,
        type: 'humor' as const,
        content: `🤖 Şu an ${tier === 1 ? '1' : tier === 2 ? '2' : '3'} AI modeli birbirini dinliyor. İnsan ilişkilerinden daha iyi! 😄`,
      },
    ]

    const timeouts = schedules.map(schedule =>
      setTimeout(() => {
        setJesterMessages(prev => [
          ...prev,
          {
            id: `jester_${schedule.type}_${Date.now()}`,
            type: schedule.type,
            content: schedule.content,
            timestamp: new Date().toISOString(),
          },
        ])
      }, schedule.delay)
    )

    return () => {
      clearInterval(timer)
      timeouts.forEach(timeout => clearTimeout(timeout))
    }
  }, [isActive, tier, userMessage])

  if (!isActive) return null

  return (
    <div className="mb-4 space-y-2">
      {jesterMessages.map(msg => (
        <JesterMessage
          key={msg.id}
          type={msg.type}
          content={msg.content}
          timestamp={msg.timestamp}
        />
      ))}
    </div>
  )
}
