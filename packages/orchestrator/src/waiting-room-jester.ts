/**
 * Waiting Room Jester - Bekleme Odası Etkileşimi
 * 
 * Büyük modeller (Tier 3) derin düşünürken, hızlı bir model (Jester)
 * kullanıcıyla sohbet ederek bekleme süresini eğlenceli hale getirir.
 * 
 * Bu, UX açısından "loading" ekranlarını öldüren yıkıcı bir özelliktir.
 */

export interface JesterMessage {
  id: string
  type: 'greeting' | 'question' | 'insight' | 'status' | 'humor'
  content: string
  timestamp: string
  model: 'grok-4-heavy' | 'gpt-4o-mini'
}

export interface WaitingRoomContext {
  userMessage: string
  tier: 1 | 2 | 3
  jesterMessages: JesterMessage[]
  mainModelStatus: 'thinking' | 'analyzing' | 'debating' | 'synthesizing'
  elapsedTime: number
}

/**
 * Jester Selamlama - İlk Tepki
 */
export function generateJesterGreeting(userMessage: string): JesterMessage {
  const greetings = [
    `Harika bir soru! Konseyi topluyorum... 🛡️`,
    `Bunu tartışmaya değer! Uzmanlar çağrılıyor... 🏛️`,
    `Derinlemesine bir analiz yapacağız. Biraz sabır... ⏳`,
    `Bu soru için en iyi beyinleri topladım! 🧠`,
    `Hmm, bu karmaşık görünüyor. Hazırlanıyoruz... 🤔`,
  ]

  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)]

  return {
    id: `jester_greeting_${Date.now()}`,
    type: 'greeting',
    content: randomGreeting,
    timestamp: new Date().toISOString(),
    model: 'gpt-4o-mini',
  }
}

/**
 * Jester Sorusu - Kullanıcıyla Etkileşim
 */
export function generateJesterQuestion(userMessage: string): JesterMessage {
  const questions = [
    `Bu konuda senin ilk düşüncen neydi? 🤔`,
    `Bunu daha önce düşündün mü? 💭`,
    `Hangi yönü seni en çok meraklandırıyor? 🎯`,
    `Bu sorunun en önemli kısmı ne sence? ⚡`,
    `Başka hangi açılardan bakmak isterdin? 🔍`,
  ]

  const randomQuestion = questions[Math.floor(Math.random() * questions.length)]

  return {
    id: `jester_question_${Date.now()}`,
    type: 'question',
    content: randomQuestion,
    timestamp: new Date().toISOString(),
    model: 'gpt-4o-mini',
  }
}

/**
 * Jester İçgörüsü - Hızlı Bilgi
 */
export function generateJesterInsight(userMessage: string): JesterMessage {
  const insights = [
    `💡 İlginç Gerçek: Bu konu aslında daha karmaşık olabilir...`,
    `🔬 Bilim Açısından: Araştırmalar gösteriyor ki...`,
    `📊 İstatistiksel Bakış: Çoğu insan bu konuda yanılıyor...`,
    `🎓 Tarihsel Perspektif: Bu tartışma aslında eski bir sorun...`,
    `🌍 Global Bakış: Farklı kültürlerde bu konuya farklı yaklaşılıyor...`,
  ]

  const randomInsight = insights[Math.floor(Math.random() * insights.length)]

  return {
    id: `jester_insight_${Date.now()}`,
    type: 'insight',
    content: randomInsight,
    timestamp: new Date().toISOString(),
    model: 'gpt-4o-mini',
  }
}

/**
 * Jester Durum Güncellemesi - Ne Yapıyor?
 */
export function generateJesterStatus(
  elapsedSeconds: number,
  tier: 1 | 2 | 3
): JesterMessage {
  const statuses: Record<number, string[]> = {
    1: [
      `⚡ Hızlı modeller yanıt hazırlıyor... (~${elapsedSeconds}s)`,
      `🚀 Tier 1 işçileri çalışıyor... (~${elapsedSeconds}s)`,
    ],
    2: [
      `📚 Primary model analiz yapıyor... (~${elapsedSeconds}s)`,
      `⚖️ Tartışma devam ediyor... (~${elapsedSeconds}s)`,
      `🔄 Modeller birbirini dinliyor... (~${elapsedSeconds}s)`,
    ],
    3: [
      `🧠 Opus derin bir analiz yapıyor... (~${elapsedSeconds}s)`,
      `🏛️ Akademik tartışma sürüyor... (~${elapsedSeconds}s)`,
      `⚖️ Hakem kararı vermeye hazırlanıyor... (~${elapsedSeconds}s)`,
      `🎓 Uzmanlar tartışıyor... (~${elapsedSeconds}s)`,
    ],
  }

  const statusList = statuses[tier] || statuses[1]
  const randomStatus = statusList[Math.floor(Math.random() * statusList.length)]

  return {
    id: `jester_status_${Date.now()}`,
    type: 'status',
    content: randomStatus,
    timestamp: new Date().toISOString(),
    model: 'gpt-4o-mini',
  }
}

/**
 * Jester Mizahı - Hafif Espri
 */
export function generateJesterHumor(): JesterMessage {
  const jokes = [
    `🤖 Şu an 3 AI modeli birbirini dinliyor. İnsan ilişkilerinden daha iyi! 😄`,
    `⏳ Biliyorsun, AI'lar "düşünüyor" diye söylüyor ama aslında çok hızlı hesap yapıyorlar. 🧮`,
    `🎭 Bir Claude, bir DeepSeek ve bir GPT bir barda... Hayır, tartışma salonunda! 🍻`,
    `💭 Modellerin de kendi aralarında tartışması gerekiyordu. Biz de yapıyoruz! 🎪`,
    `🚀 Eğer bu kadar uzun sürüyorsa, muhtemelen çok iyi bir cevap hazırlanıyor! 🎯`,
  ]

  const randomJoke = jokes[Math.floor(Math.random() * jokes.length)]

  return {
    id: `jester_humor_${Date.now()}`,
    type: 'humor',
    content: randomJoke,
    timestamp: new Date().toISOString(),
    model: 'grok-4-heavy',
  }
}

/**
 * Jester Mesaj Akışını Yönet
 */
export function generateJesterMessageSequence(
  userMessage: string,
  tier: 1 | 2 | 3,
  maxWaitSeconds: number = 30
): JesterMessage[] {
  const messages: JesterMessage[] = []

  // 1. İlk selamlama (hemen)
  messages.push(generateJesterGreeting(userMessage))

  // 2. 3 saniye sonra soru
  if (maxWaitSeconds > 3) {
    messages.push(generateJesterQuestion(userMessage))
  }

  // 3. 8 saniye sonra içgörü
  if (maxWaitSeconds > 8) {
    messages.push(generateJesterInsight(userMessage))
  }

  // 4. 15 saniye sonra durum
  if (maxWaitSeconds > 15) {
    messages.push(generateJesterStatus(15, tier))
  }

  // 5. 25 saniye sonra mizah
  if (maxWaitSeconds > 25) {
    messages.push(generateJesterHumor())
  }

  return messages
}

/**
 * Jester Mesajlarını Zamanla (Asenkron)
 */
export async function scheduleJesterMessages(
  userMessage: string,
  tier: 1 | 2 | 3,
  onMessage: (msg: JesterMessage) => void,
  maxWaitSeconds: number = 30
): Promise<void> {
  const messages = generateJesterMessageSequence(userMessage, tier, maxWaitSeconds)
  const timings = [0, 3000, 8000, 15000, 25000] // Milisaniye cinsinden

  for (let i = 0; i < messages.length; i++) {
    await new Promise(resolve => setTimeout(resolve, timings[i]))
    onMessage(messages[i])
  }
}

/**
 * Jester Bağlamı Oluştur
 */
export function createWaitingRoomContext(
  userMessage: string,
  tier: 1 | 2 | 3
): WaitingRoomContext {
  return {
    userMessage,
    tier,
    jesterMessages: [generateJesterGreeting(userMessage)],
    mainModelStatus: tier === 1 ? 'analyzing' : tier === 2 ? 'debating' : 'synthesizing',
    elapsedTime: 0,
  }
}

/**
 * Jester Mesajlarını Temizle (Ana Cevap Gelince)
 */
export function finalizeWaitingRoom(
  context: WaitingRoomContext,
  mainResponse: string
): {
  jesterMessages: JesterMessage[]
  mainResponse: string
  totalWaitTime: number
} {
  return {
    jesterMessages: context.jesterMessages,
    mainResponse,
    totalWaitTime: context.elapsedTime,
  }
}
