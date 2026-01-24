import { NextRequest, NextResponse } from 'next/server'
import { MODELS } from '@/lib/models'
import { getTier } from '@/lib/orchestrator'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

async function callModel(modelId: string, prompt: string, systemPrompt?: string, fallbackModelId?: string): Promise<string> {
  const API_KEY = process.env.OPENROUTER_API_KEY || ''
  
  const modelsToTry = [modelId];
  if (fallbackModelId) {
    modelsToTry.push(fallbackModelId);
  }

  let lastError: Error | null = null;

  for (const currentModelId of modelsToTry) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://clashof.ai',
      'X-Title': 'Clash of AI'
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt }
      ],
      stream: false,
    }),
  });
  
  const data = await response.json();

  if (!response.ok) {
    // OpenRouter'dan gelen hata mesajını yakala
    const errorMessage = data.error ? data.error.message : `HTTP Error ${response.status}`;
    throw new Error(`OpenRouter Error: ${errorMessage}`);
  }
  
  if (!data.choices || data.choices.length === 0) {
    throw new Error('OpenRouter Error: Model yanıt vermedi veya boş bir seçim listesi döndürdü.');
  }

  return data.choices[0].message.content;
} catch (error: any) {
      lastError = error;
      console.error(`Model ${currentModelId} failed. Trying fallback if available. Error: ${error.message}`);
      // Eğer bu son denemeyse, hatayı fırlat
      if (currentModelId === modelsToTry[modelsToTry.length - 1]) {
        throw lastError;
      }
      // Aksi takdirde, bir sonraki modele geç
    }
  }

  // Bu kısma normalde ulaşılmamalı, ancak TypeScript'i mutlu etmek için
  if (lastError) {
    throw lastError;
  }
  throw new Error('Tüm model denemeleri başarısız oldu.');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;
    const lastMessage = messages[messages.length - 1].content;
    
    const tier = getTier(lastMessage);
    
    if (tier === 'T1') {
      const response = await callModel(MODELS.fastWorker, lastMessage, undefined, MODELS.fastWorker); // T1'de fallback'e gerek yok, zaten en hızlı model
      return NextResponse.json({
        tier: 'T1',
        responses: [{ type: 'normal', model: 'DeepSeek', content: response }]
      });
    }
    
    if (tier === 'T2') {
      const mainResponse = await callModel(
        MODELS.architect, 
        lastMessage, 
        "You are the Architect. Provide a detailed and structured answer.",
        MODELS.fastWorker // Architect için fallback
      );
      
      const interjection = await callModel(
        MODELS.prosecutor,
        `User Question: ${lastMessage}\nArchitect's Answer: ${mainResponse}\n\nTask: Critically analyze the answer. If there is a mistake, a better approach, or a missing constraint, provide a VERY SHORT note (max 2 sentences). If the answer is perfect, reply ONLY with 'OK'.`,
        "You are the Prosecutor. Be critical and concise."
      );
      
      const responses = [
        { type: 'normal', model: 'Claude', content: mainResponse }
      ];
      
      if (interjection.trim().toUpperCase() !== 'OK') {
        responses.push({ type: 'info', model: 'Prosecutor', content: interjection });
      }
      
      return NextResponse.json({ tier: 'T2', responses });
    }

    if (tier === 'T2.5') {
      const thesis = await callModel(
        MODELS.architect,
        lastMessage,
        "You are the Architect. Your role is to present a strong THESIS (🛡️). Provide a clear and well-supported argument.",
        MODELS.fastWorker // Architect için fallback
      );

      const antithesis = await callModel(
        MODELS.prosecutor,
        `User Question: ${lastMessage}\n\n🛡️ THESIS TO CHALLENGE:\n${thesis}\n\nTask: Present a strong ANTITHESIS (⚔️). Do NOT repeat the thesis. Challenge its weaknesses and offer a compelling counter-argument.`,
        "You are the Prosecutor. Be sharp and provide a strong counter-view."
      );

      return NextResponse.json({
        tier: 'T2.5',
        responses: [
          { type: 'thesis', model: 'Claude', content: thesis },
          { type: 'antithesis', model: 'DeepSeek-R', content: antithesis }
        ]
      });
    }

    if (tier === 'T3') {
      const thesis = await callModel(
        MODELS.architect,
        lastMessage,
        "You are the Architect. Present a deep and comprehensive THESIS (🛡️). Consider all major factors.",
        MODELS.fastWorker // Architect için fallback
      );

      const antithesis = await callModel(
        MODELS.prosecutor,
        `User Question: ${lastMessage}\n\n🛡️ THESIS TO CHALLENGE:\n${thesis}\n\nTask: Present a sharp ANTITHESIS (⚔️). Highlight risks and provide a strong counter-perspective.`,
        "You are the Prosecutor. Be highly critical and analytical.",
        MODELS.fastWorker // Prosecutor için fallback
      );

      const synthesis = await callModel(
        MODELS.judge,
        `User Question: ${lastMessage}\n\n🛡️ THESIS:\n${thesis}\n\n⚔️ ANTITHESIS:\n${antithesis}\n\nTask: You are the High Judge. Provide the final SYNTHESIS (◆). Weigh both arguments, resolve the conflict, and provide the most balanced and definitive answer.`,
        "You are the High Judge. Be wise, balanced, and decisive."
      );

      return NextResponse.json({
        tier: 'T3',
        responses: [
          { type: 'thesis', model: 'Claude', content: thesis },
          { type: 'antithesis', model: 'DeepSeek-R', content: antithesis },
          { type: 'synthesis', model: 'Claude Opus', content: synthesis }
        ]
      });
    }
    
    const response = await callModel(MODELS.fastWorker, lastMessage, undefined, MODELS.fastWorker);
    return NextResponse.json({
      tier: tier,
      responses: [{ type: 'normal', model: 'DeepSeek', content: response }]
    });
    
  } catch (error: any) {
    // Hata mesajını temizle ve kullanıcıya göster
    let errorMessage = error.message || 'Bilinmeyen bir sunucu hatası oluştu.';
    
    // API Key hatası gibi hassas bilgileri temizle
    if (errorMessage.includes('Authorization')) {
      errorMessage = 'API Key Hatası: OpenRouter API Key geçersiz veya eksik.';
    } else if (errorMessage.includes('HTTP Error 404')) {
      errorMessage = 'Model Bulunamadı Hatası: Kullanılan model ID\'si OpenRouter\'da mevcut değil.';
    } else if (errorMessage.includes('HTTP Error 429')) {
      errorMessage = 'Hız Limiti Hatası: Çok fazla istek gönderildi. Lütfen bir süre sonra tekrar deneyin.';
    } else if (errorMessage.includes('HTTP Error 400')) {
      errorMessage = 'Geçersiz İstek Hatası: İstek formatı veya parametreleri hatalı.';
    } else if (errorMessage.includes('OpenRouter Error:')) {
      // OpenRouter'dan gelen spesifik hatayı koru
      errorMessage = errorMessage.replace('OpenRouter Error: ', '');
    }

    return new NextResponse(JSON.stringify({ 
      error: errorMessage,
      type: 'error' // Frontend'in bu mesajı hata olarak işlemesi için
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
