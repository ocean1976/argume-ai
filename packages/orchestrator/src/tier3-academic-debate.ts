/**
 * Tier 3 - Akademik Tartışma Mekanizması
 * 
 * Üç model arasında yapılandırılmış bir tartışma:
 * 1. Savunucu (Advocate): Soruya yanıt verir, pozisyonunu savunur
 * 2. Eleştirmen (Critic): Savunucuyu eleştirir, zayıf noktaları bulur
 * 3. Arabulucu (Mediator): İki model arasında konsensüs sağlar
 */

export interface AcademicDebateRound {
  round: number
  advocate: {
    model: string
    position: string
    timestamp: string
  }
  critic: {
    model: string
    criticism: string
    counterArguments: string[]
    timestamp: string
  }
  mediator: {
    model: string
    consensus: string
    keyPoints: string[]
    timestamp: string
  }
}

export interface AcademicDebateFlow {
  userMessage: string
  rounds: AcademicDebateRound[]
  finalConsensus: string
  totalCost: number
  executionTime: number
}

/**
 * Savunucu Prompt - Soruya yanıt ver ve pozisyonunu savun
 */
export function buildAdvocatePrompt(userMessage: string): string {
  return `
Sen bir Akademik Tartisma Savunucusu (Advocate) sin. Gorev:

1. YANIT: Asagidaki soruya kapsamli ve detayli bir yanit ver.
2. SAVUNMA: Kendi pozisyonunu net ve ikna edici argümanlarla savun.
3. KAYNAKLAR: Mümkünse kaynaklar ve kanıtlar sunarak pozisyonunu güçlendir.

SORU:
${userMessage}

Lütfen açık, net ve ikna edici bir yanıt sun. Pozisyonunu güçlü argümanlarla savun.
`
}

/**
 * Eleştirmen Prompt - Savunucuyu eleştir ve karşı argümanlar sun
 */
export function buildCriticPrompt(
  userMessage: string,
  advocatePosition: string
): string {
  return `
Sen bir Akademik Tartisma Elestirmeni (Critic) sin. Gorev:

1. ANALIZ: Asagidaki savunucu pozisyonunu dikkatle analiz et.
2. ELESTIRI: Zayif noktalari, tutarsizliklari ve eksiklikleri bul.
3. KARSIT ARGÜMANLAR: Savunucunun pozisyonuna karşı güçlü argümanlar sun.
4. SORULAR: Savunucunun cevap vermesi gereken kritik sorular sor.

ORİJİNAL SORU:
${userMessage}

SAVUNUCU POZISYONU:
${advocatePosition}

Lütfen bu pozisyonu eleştir, zayıf noktalarını bul ve güçlü karşı argümanlar sun.
Yapıcı ama keskin bir eleştiri yap.
`
}

/**
 * Arabulucu Prompt - İki pozisyon arasında konsensüs sağla
 */
export function buildMediatorPrompt(
  userMessage: string,
  advocatePosition: string,
  criticPosition: string
): string {
  return `
Sen bir Akademik Tartisma Arabulucusu (Mediator) sin. Gorev:

1. ANALIZ: Her iki pozisyonun da güçlü ve zayıf yönlerini analiz et.
2. UZLASMA: İki pozisyon arasında ortak noktalar bul.
3. KONSENSUS: Her iki tarafın da kabul edebileceği dengeli bir sonuca var.
4. KARAR: Nihai kararı açık ve net bir şekilde sun.

ORİJİNAL SORU:
${userMessage}

SAVUNUCU POZISYONU:
${advocatePosition}

ELEŞTİRMEN POZİSYONU:
${criticPosition}

Lütfen her iki pozisyonun da haklı noktalarını dikkate alarak dengeli bir konsensüs oluştur.
Sonucunu "⚖️ AKADEMIK KONSENSUS" başlığı altında sun.
`
}

/**
 * Tartışma Turunu Yönet
 */
export async function runAcademicDebateRound(
  userMessage: string,
  advocateModel: string,
  criticModel: string,
  mediatorModel: string,
  callModel: (model: string, prompt: string) => Promise<string>
): Promise<AcademicDebateRound> {
  const round = 1

  // 1. Savunucu konuşsun
  const advocatePrompt = buildAdvocatePrompt(userMessage)
  const advocatePosition = await callModel(advocateModel, advocatePrompt)

  // 2. Eleştirmen konuşsun
  const criticPrompt = buildCriticPrompt(userMessage, advocatePosition)
  const criticPosition = await callModel(criticModel, criticPrompt)

  // 3. Arabulucu konsensüs sağlasın
  const mediatorPrompt = buildMediatorPrompt(
    userMessage,
    advocatePosition,
    criticPosition
  )
  const consensus = await callModel(mediatorModel, mediatorPrompt)

  return {
    round,
    advocate: {
      model: advocateModel,
      position: advocatePosition,
      timestamp: new Date().toISOString(),
    },
    critic: {
      model: criticModel,
      criticism: criticPosition,
      counterArguments: extractCounterArguments(criticPosition),
      timestamp: new Date().toISOString(),
    },
    mediator: {
      model: mediatorModel,
      consensus,
      keyPoints: extractKeyPoints(consensus),
      timestamp: new Date().toISOString(),
    },
  }
}

/**
 * Karşı argümanları metinden çıkar
 */
function extractCounterArguments(text: string): string[] {
  const arguments: string[] = []
  const lines = text.split('\n')

  for (const line of lines) {
    if (
      line.includes('-') ||
      line.includes('•') ||
      line.includes('1.') ||
      line.includes('2.')
    ) {
      const cleaned = line.replace(/^[-•0-9.]\s*/, '').trim()
      if (cleaned.length > 10) {
        arguments.push(cleaned)
      }
    }
  }

  return arguments.slice(0, 5) // En önemli 5 argümanı al
}

/**
 * Anahtar noktaları metinden çıkar
 */
function extractKeyPoints(text: string): string[] {
  const keyPoints: string[] = []
  const lines = text.split('\n')

  for (const line of lines) {
    if (
      line.includes('KONSENSUS') ||
      line.includes('KARAR') ||
      line.includes('SONUC')
    ) {
      const nextLines = lines.slice(lines.indexOf(line) + 1, lines.indexOf(line) + 4)
      for (const nextLine of nextLines) {
        if (nextLine.trim().length > 10) {
          keyPoints.push(nextLine.trim())
        }
      }
    }
  }

  return keyPoints.slice(0, 3) // En önemli 3 noktayı al
}

/**
 * Akademik Tartışmayı Çalıştır
 */
export async function executeAcademicDebate(
  userMessage: string,
  advocateModel: string,
  criticModel: string,
  mediatorModel: string,
  callModel: (model: string, prompt: string) => Promise<string>
): Promise<AcademicDebateFlow> {
  const startTime = Date.now()

  console.log(
    `[Academic Debate] Starting with Advocate: ${advocateModel}, Critic: ${criticModel}, Mediator: ${mediatorModel}`
  )

  // Tartışma turunu çalıştır
  const round = await runAcademicDebateRound(
    userMessage,
    advocateModel,
    criticModel,
    mediatorModel,
    callModel
  )

  const executionTime = Date.now() - startTime

  return {
    userMessage,
    rounds: [round],
    finalConsensus: round.mediator.consensus,
    totalCost: 0, // Maliyet hesaplaması API tarafından yapılacak
    executionTime,
  }
}

/**
 * Tartışma İstatistikleri
 */
export function getDebateStats(debate: AcademicDebateFlow) {
  return {
    totalRounds: debate.rounds.length,
    advocateModel: debate.rounds[0]?.advocate.model,
    criticModel: debate.rounds[0]?.critic.model,
    mediatorModel: debate.rounds[0]?.mediator.model,
    executionTime: debate.executionTime,
    consensusLength: debate.finalConsensus.length,
  }
}
