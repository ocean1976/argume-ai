/**
 * Smart Jester - Akıllı Jester Mantığı
 * 
 * Kullanıcı mesajını anlık olarak analiz edip:
 * 1. Duygu durumunu (sentiment) tespit et
 * 2. Konu karmaşıklığını anla
 * 3. Bağlamsal ve empathetic yorumlar yap
 * 4. Konseyi hazırlamaya başla
 */

export interface SmartJesterAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral' | 'curious' | 'concerned'
  complexity: 'simple' | 'moderate' | 'complex'
  topics: string[]
  urgency: 'low' | 'medium' | 'high'
  firstReaction: string
  contextualComment: string
}

/**
 * Duygu Analizi - Sentiment Detection
 */
export function analyzeSentiment(message: string): SmartJesterAnalysis['sentiment'] {
  const lowerMessage = message.toLowerCase()

  // Pozitif göstergeler
  const positiveIndicators = [
    'harika', 'mükemmel', 'süper', 'fena değil', 'güzel', 'iyi', 'başarılı',
    'amazing', 'great', 'excellent', 'wonderful', 'fantastic', 'perfect'
  ]

  // Negatif göstergeler
  const negativeIndicators = [
    'kötü', 'berbat', 'sorun', 'hata', 'başarısız', 'çökmek', 'endişe',
    'bad', 'terrible', 'awful', 'problem', 'issue', 'fail', 'broken'
  ]

  // Meraklı göstergeler
  const curiousIndicators = [
    'nasıl', 'neden', 'ne', 'merak', 'öğrenmek', 'anlamak', 'bilmek',
    'how', 'why', 'what', 'curious', 'wonder', 'understand', 'learn'
  ]

  // Endişeli göstergeler
  const concernedIndicators = [
    'endişe', 'kaygı', 'risk', 'tehlike', 'dikkat', 'uyarı', 'güvenlik',
    'concern', 'worry', 'risk', 'danger', 'careful', 'warning', 'security'
  ]

  const hasPositive = positiveIndicators.some(ind => lowerMessage.includes(ind))
  const hasNegative = negativeIndicators.some(ind => lowerMessage.includes(ind))
  const hasCurious = curiousIndicators.some(ind => lowerMessage.includes(ind))
  const hasConcerned = concernedIndicators.some(ind => lowerMessage.includes(ind))

  if (hasConcerned) return 'concerned'
  if (hasCurious) return 'curious'
  if (hasPositive) return 'positive'
  if (hasNegative) return 'negative'
  return 'neutral'
}

/**
 * Karmaşıklık Analizi
 */
export function analyzeComplexity(message: string): SmartJesterAnalysis['complexity'] {
  const wordCount = message.split(' ').length
  const technicalTerms = [
    'algoritma', 'mimari', 'tasarım', 'etik', 'analiz', 'karmaşık',
    'algorithm', 'architecture', 'design', 'ethics', 'analysis', 'complex'
  ]

  const hasTechnical = technicalTerms.some(term => 
    message.toLowerCase().includes(term)
  )

  if (wordCount > 30 || hasTechnical) {
    return 'complex'
  } else if (wordCount > 15) {
    return 'moderate'
  }
  return 'simple'
}

/**
 * Konuları Çıkar
 */
export function extractTopics(message: string): string[] {
  const topics: string[] = []
  const topicKeywords: Record<string, string[]> = {
    'Teknoloji': ['kod', 'yazılım', 'web', 'app', 'database', 'api', 'framework'],
    'İş': ['şirket', 'proje', 'ekip', 'yönetim', 'strateji', 'pazarlama'],
    'Tasarım': ['ui', 'ux', 'renk', 'tipografi', 'layout', 'responsive'],
    'Bilim': ['araştırma', 'teori', 'deney', 'hipotez', 'sonuç'],
    'Felsefe': ['etik', 'ahlak', 'anlam', 'var', 'bilinç', 'gerçeklik'],
  }

  const lowerMessage = message.toLowerCase()

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(kw => lowerMessage.includes(kw))) {
      topics.push(topic)
    }
  }

  return topics.length > 0 ? topics : ['Genel']
}

/**
 * Aciliyet Seviyesi
 */
export function analyzeUrgency(message: string): SmartJesterAnalysis['urgency'] {
  const lowerMessage = message.toLowerCase()

  const urgentIndicators = [
    'acil', 'hemen', 'şimdi', 'derhal', 'urgent', 'asap', 'immediately'
  ]

  const highIndicators = [
    'kritik', 'önemli', 'critical', 'important', 'crucial'
  ]

  if (urgentIndicators.some(ind => lowerMessage.includes(ind))) {
    return 'high'
  } else if (highIndicators.some(ind => lowerMessage.includes(ind))) {
    return 'medium'
  }
  return 'low'
}

/**
 * İlk Tepki (First Reaction) Oluştur
 */
export function generateFirstReaction(
  sentiment: SmartJesterAnalysis['sentiment'],
  complexity: SmartJesterAnalysis['complexity'],
  topics: string[]
): string {
  const reactions: Record<string, Record<string, string[]>> = {
    positive: {
      simple: [
        '✨ Harika bir bakış açısı!',
        '👍 Kesinlikle katılıyorum!',
        '🎯 Tam doğru!',
      ],
      moderate: [
        '🧠 İyi bir gözlem!',
        '💡 Bunu daha derinlemesine tartışmaya değer!',
        '📚 Güzel bir perspektif!',
      ],
      complex: [
        '🏆 Çok sofistike bir soru!',
        '🎓 Bu gerçekten akademik düzeyde bir tartışma!',
        '⚡ Vay canına, bu çok derin!',
      ],
    },
    negative: {
      simple: [
        '⚠️ Anladığım kadarıyla sorun var...',
        '🤔 Bu çok sorunlu görünüyor...',
        '😟 Endişe verici bir durum...',
      ],
      moderate: [
        '🔍 Bu sorunun kökünü bulmamız gerekiyor...',
        '⚙️ Teknik açıdan karmaşık bir problem...',
        '📊 Detaylı bir analiz yapalım...',
      ],
      complex: [
        '🏛️ Bu çok katmanlı bir sorun...',
        '🔬 Sistematik bir yaklaşım gerekli...',
        '⚖️ Birden fazla perspektiften bakmamız lazım...',
      ],
    },
    curious: {
      simple: [
        '🤓 Harika bir soru!',
        '🔍 Merak ettirici!',
        '💭 Bunu araştırmaya değer!',
      ],
      moderate: [
        '🧪 Derinlemesine bir inceleme yapabiliriz!',
        '📖 Çok ilginç bir konu!',
        '🎯 Bu sorunun birden fazla cevabı olabilir!',
      ],
      complex: [
        '🌟 Bu çok ilginç bir araştırma alanı!',
        '🚀 Multidisipliner bir yaklaşım gerekli!',
        '🏛️ Konsey bu konuda çok fikir üretecek!',
      ],
    },
    concerned: {
      simple: [
        '⚠️ Güvenlik endişesi var mı?',
        '🛡️ Riskleri göz önünde bulunduralım...',
        '🔒 Dikkatli olmalıyız...',
      ],
      moderate: [
        '⚖️ Risk analizi yapmamız gerekiyor...',
        '🚨 Potansiyel tehlikeler var...',
        '📋 Önlemler almalıyız...',
      ],
      complex: [
        '🏛️ Etik ve güvenlik açısından derinlemesine tartışma gerekli...',
        '⚖️ Çok boyutlu bir risk değerlendirmesi yapmalıyız...',
        '🔍 Tüm yönlerini incelememiz lazım...',
      ],
    },
    neutral: {
      simple: [
        '👂 Dinliyorum...',
        '📝 Anladım...',
        '🤔 Hmmm...',
      ],
      moderate: [
        '📚 İlginç bir konu...',
        '🧠 Bunu tartışmaya değer...',
        '💡 Farklı açılardan bakalım...',
      ],
      complex: [
        '🏛️ Konsey bu konuda tartışmalı...',
        '🎓 Multidisipliner bir yaklaşım gerekli...',
        '⚡ Derin bir analiz yapacağız...',
      ],
    },
  }

  const reactionList = reactions[sentiment]?.[complexity] || reactions.neutral.simple
  return reactionList[Math.floor(Math.random() * reactionList.length)]
}

/**
 * Bağlamsal Yorum (Contextual Comment) Oluştur
 */
export function generateContextualComment(
  sentiment: SmartJesterAnalysis['sentiment'],
  topics: string[],
  urgency: SmartJesterAnalysis['urgency']
): string {
  const comments: Record<string, string[]> = {
    positive: [
      '🎯 Bu perspektif konseyde çok değerli olacak.',
      '✨ Böyle yapıcı fikirler tartışmayı zenginleştiriyor.',
      '👍 Bu yaklaşımı detaylandırmaya değer.',
    ],
    negative: [
      '⚠️ Bu sorunları çözmek için uzmanlar gerekli.',
      '🔧 Teknik destek ve analiz yapmalıyız.',
      '📊 Sorunu kökünden çözmemiz gerekiyor.',
    ],
    curious: [
      '🔍 Konsey bu soruya çok iyi cevaplar bulacak.',
      '🧠 Farklı bakış açıları bu konuyu aydınlatacak.',
      '💡 Tartışma sırasında yeni fikirler ortaya çıkacak.',
    ],
    concerned: [
      '⚖️ Riskleri dikkatle değerlendireceğiz.',
      '🛡️ Güvenlik ve etik açısından inceleyeceğiz.',
      '🚨 Tüm olası sonuçları göz önünde bulunduracağız.',
    ],
    neutral: [
      '📝 Tüm yönlerini inceleyeceğiz.',
      '🎯 Konsey bu konuda kapsamlı bir tartışma yapacak.',
      '💭 Farklı perspektifler ortaya çıkacak.',
    ],
  }

  const commentList = comments[sentiment] || comments.neutral
  return commentList[Math.floor(Math.random() * commentList.length)]
}

/**
 * Tam Analiz ve Tepki Oluştur
 */
export function analyzeAndRespond(message: string): SmartJesterAnalysis {
  const sentiment = analyzeSentiment(message)
  const complexity = analyzeComplexity(message)
  const topics = extractTopics(message)
  const urgency = analyzeUrgency(message)
  const firstReaction = generateFirstReaction(sentiment, complexity, topics)
  const contextualComment = generateContextualComment(sentiment, topics, urgency)

  return {
    sentiment,
    complexity,
    topics,
    urgency,
    firstReaction,
    contextualComment,
  }
}

/**
 * Jester Prompt'u Oluştur (API çağrısı için)
 */
export function buildSmartJesterPrompt(userMessage: string, analysis: SmartJesterAnalysis): string {
  return `
Sen bir Akıllı Jester (Smart Jester) sin. Kullanıcı şu mesajı gönderdi:

"${userMessage}"

Analiz:
- Duygu Durumu: ${analysis.sentiment}
- Karmaşıklık: ${analysis.complexity}
- Konular: ${analysis.topics.join(', ')}
- Aciliyet: ${analysis.urgency}

Görevin:
1. Kullanıcının mesajını kısaca yorum yap (1-2 cümle)
2. Konseyin bu konuda ne yapacağını kısaca özetle
3. Kullanıcıyı heyecanlandır ve sabırlı olmasını söyle

Lütfen çok kısa ve eğlenceli bir cevap ver. Maksimum 2 cümle.
`
}
