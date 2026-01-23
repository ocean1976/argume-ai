import { NextRequest, NextResponse } from 'next/server'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

export async function POST(req: NextRequest) {
  try {
    const { userMessage } = await req.json()

    if (!userMessage) {
      return NextResponse.json(
        { error: 'User message is required' },
        { status: 400 }
      )
    }

    // Basit duygu analizi
    const sentiment = analyzeSentiment(userMessage)
    const complexity = analyzeComplexity(userMessage)

    // Jester'ın ilk tepkisini oluştur
    const jesterResponse = generateJesterResponse(sentiment, complexity)

    return NextResponse.json({
      sentiment,
      complexity,
      jesterComment: jesterResponse,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Jester API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function analyzeSentiment(message: string): string {
  const lowerMessage = message.toLowerCase()

  const positiveIndicators = [
    'harika', 'mükemmel', 'süper', 'fena değil', 'güzel', 'iyi',
    'amazing', 'great', 'excellent', 'wonderful', 'fantastic'
  ]

  const negativeIndicators = [
    'kötü', 'berbat', 'sorun', 'hata', 'başarısız', 'çökmek',
    'bad', 'terrible', 'awful', 'problem', 'issue', 'fail'
  ]

  const curiousIndicators = [
    'nasıl', 'neden', 'ne', 'merak', 'öğrenmek', 'anlamak',
    'how', 'why', 'what', 'curious', 'wonder', 'understand'
  ]

  const concernedIndicators = [
    'endişe', 'kaygı', 'risk', 'tehlike', 'dikkat', 'uyarı',
    'concern', 'worry', 'risk', 'danger', 'careful', 'warning'
  ]

  if (concernedIndicators.some(ind => lowerMessage.includes(ind))) return 'concerned'
  if (curiousIndicators.some(ind => lowerMessage.includes(ind))) return 'curious'
  if (positiveIndicators.some(ind => lowerMessage.includes(ind))) return 'positive'
  if (negativeIndicators.some(ind => lowerMessage.includes(ind))) return 'negative'
  return 'neutral'
}

function analyzeComplexity(message: string): string {
  const wordCount = message.split(' ').length
  const technicalTerms = [
    'algoritma', 'mimari', 'tasarım', 'etik', 'analiz',
    'algorithm', 'architecture', 'design', 'ethics', 'analysis'
  ]

  const hasTechnical = technicalTerms.some(term =>
    message.toLowerCase().includes(term)
  )

  if (wordCount > 30 || hasTechnical) return 'complex'
  if (wordCount > 15) return 'moderate'
  return 'simple'
}

function generateJesterResponse(sentiment: string, complexity: string): string {
  const responses: Record<string, Record<string, string[]>> = {
    positive: {
      simple: [
        '✨ Harika bir bakış açısı! Konsey bunu tartışacak.',
        '👍 Kesinlikle katılıyorum! Uzmanları çağırıyorum.',
        '🎯 Tam doğru! Konsey seni destekleyecek.',
      ],
      moderate: [
        '🧠 İyi bir gözlem! Konsey bunu derinlemesine inceleyecek.',
        '💡 Bunu tartışmaya değer! Hemen başlıyoruz.',
        '📚 Güzel bir perspektif! Diğer görüşleri de dinleyelim.',
      ],
      complex: [
        '🏆 Çok sofistike bir soru! Konsey bunu sevecek.',
        '🎓 Akademik düzeyde bir tartışma! Başlıyoruz.',
        '⚡ Vay canına! Bu çok derin bir konu.',
      ],
    },
    negative: {
      simple: [
        '⚠️ Sorun var mı? Konsey bunu çözmek için hazır.',
        '🤔 Bu çok sorunlu görünüyor. Analiz edelim.',
        '😟 Endişe verici. Uzmanlar bunu inceleyecek.',
      ],
      moderate: [
        '🔍 Sorunun kökünü bulmamız gerekiyor. Başlıyoruz.',
        '⚙️ Teknik açıdan karmaşık. Konsey tartışacak.',
        '📊 Detaylı bir analiz yapmalıyız.',
      ],
      complex: [
        '🏛️ Çok katmanlı bir sorun. Konsey hazır.',
        '🔬 Sistematik bir yaklaşım gerekli.',
        '⚖️ Birden fazla perspektiften bakmalıyız.',
      ],
    },
    curious: {
      simple: [
        '🤓 Harika bir soru! Konsey cevap bulacak.',
        '🔍 Merak ettirici! Hemen araştırıyoruz.',
        '💭 Bunu araştırmaya değer! Başlıyoruz.',
      ],
      moderate: [
        '🧪 Derinlemesine inceleyeceğiz! Konsey hazır.',
        '📖 Çok ilginç bir konu! Tartışmaya başlıyoruz.',
        '🎯 Birden fazla cevabı olabilir! Dinleyelim.',
      ],
      complex: [
        '🌟 Çok ilginç bir araştırma alanı! Konsey başlıyor.',
        '🚀 Multidisipliner bir yaklaşım gerekli!',
        '🏛️ Konsey bu konuda çok fikir üretecek!',
      ],
    },
    concerned: {
      simple: [
        '⚠️ Güvenlik endişesi var. Konsey dikkatli inceleyecek.',
        '🛡️ Riskleri göz önünde bulunduralım.',
        '🔒 Dikkatli olmalıyız. Analiz edelim.',
      ],
      moderate: [
        '⚖️ Risk analizi yapmalıyız. Başlıyoruz.',
        '🚨 Potansiyel tehlikeler var. Konsey inceleyecek.',
        '📋 Önlemler almalıyız. Tartışıyoruz.',
      ],
      complex: [
        '🏛️ Etik ve güvenlik açısından derinlemesine tartışma gerekli.',
        '⚖️ Çok boyutlu bir risk değerlendirmesi yapmalıyız.',
        '🔍 Tüm yönlerini incelememiz lazım.',
      ],
    },
    neutral: {
      simple: [
        '👂 Dinliyorum. Konsey başlıyor.',
        '📝 Anladım. Tartışmaya başlıyoruz.',
        '🤔 İlginç. Konsey bunu inceleyecek.',
      ],
      moderate: [
        '📚 İlginç bir konu. Tartışmaya değer.',
        '🧠 Bunu tartışmaya değer. Başlıyoruz.',
        '💡 Farklı açılardan bakalım. Konsey hazır.',
      ],
      complex: [
        '🏛️ Konsey bu konuda tartışmalı. Başlıyoruz.',
        '🎓 Multidisipliner bir yaklaşım gerekli.',
        '⚡ Derin bir analiz yapacağız.',
      ],
    },
  }

  const responseList = responses[sentiment]?.[complexity] || responses.neutral.simple
  return responseList[Math.floor(Math.random() * responseList.length)]
}
