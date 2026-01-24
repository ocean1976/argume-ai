import { NextRequest, NextResponse } from 'next/server'
import { MODELS, FALLBACK_MODELS } from '@/lib/models'
import { getModelDisplayName } from '@/lib/modelNames'
import { getTier } from '@/lib/orchestrator'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

async function callModel(
  modelId: string, 
  prompt: string, 
  systemPrompt?: string,
  allowFallback: boolean = true
): Promise<{ content: string; usedModel: string }> {
  
  // 30 saniye timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://clashof.ai',
        'X-Title': 'Clash of AI',
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt }
        ],
        stream: false,
        max_tokens: 1000,
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // HTTP hatası kontrolü
    if (!response.ok) {
      console.error(`HTTP hatası (${modelId}): ${response.status}`);
      
      // Fallback dene
      if (allowFallback && FALLBACK_MODELS[modelId]) {
        console.log(`Fallback: ${modelId} → ${FALLBACK_MODELS[modelId]}`);
        return await callModel(FALLBACK_MODELS[modelId], prompt, systemPrompt, false);
      }
      
      return { content: '[Model yanıt veremedi]', usedModel: modelId };
    }
    
    const data = await response.json();
    
    // API hatası kontrolü
    if (data.error) {
      console.error(`API hatası (${modelId}):`, data.error.message);
      
      // Fallback dene
      if (allowFallback && FALLBACK_MODELS[modelId]) {
        console.log(`Fallback: ${modelId} → ${FALLBACK_MODELS[modelId]}`);
        return await callModel(FALLBACK_MODELS[modelId], prompt, systemPrompt, false);
      }
      
      return { content: '[Model hatası]', usedModel: modelId };
    }
    
    // Yanıt formatı kontrolü
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error(`Beklenmeyen yanıt (${modelId})`);
      return { content: '[Beklenmeyen yanıt]', usedModel: modelId };
    }
    
    return { 
      content: data.choices[0].message.content, 
      usedModel: modelId 
    };
    
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    // Timeout hatası
    if (error.name === 'AbortError') {
      console.error(`TIMEOUT (${modelId}): 30 saniye aşıldı`);
      
      // Fallback dene
      if (allowFallback && FALLBACK_MODELS[modelId]) {
        console.log(`Timeout fallback: ${modelId} → ${FALLBACK_MODELS[modelId]}`);
        return await callModel(FALLBACK_MODELS[modelId], prompt, systemPrompt, false);
      }
      
      return { content: '[Zaman aşımı - Model çok yavaş]', usedModel: modelId };
    }
    
    // Diğer hatalar
    console.error(`Bağlantı hatası (${modelId}):`, error.message);
    
    // Fallback dene
    if (allowFallback && FALLBACK_MODELS[modelId]) {
      console.log(`Hata fallback: ${modelId} → ${FALLBACK_MODELS[modelId]}`);
      return await callModel(FALLBACK_MODELS[modelId], prompt, systemPrompt, false);
    }
    
    return { content: '[Bağlantı hatası]', usedModel: modelId };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Mesaj gerekli' }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage.content;

    // Tier belirleme
    const tier = getTier(userMessage);
    console.log(`Tier: ${tier} | Mesaj: "${userMessage}"`);

    const responses: any[] = [];

    if (tier === 'T1') {
      // T1: Tek model (DeepSeek)
      const { content, usedModel } = await callModel(MODELS.fastWorker, userMessage);
      responses.push({
        type: 'normal',
        model: getModelDisplayName(usedModel),
        content: content
      });
    } else if (tier === 'T2') {
      // T2: Tek model (hızlı cevap)
      const { content, usedModel } = await callModel(MODELS.fastWorker, userMessage);
      
      responses.push({
        type: 'normal',
        model: getModelDisplayName(usedModel),
        content: content
      });
    } else if (tier === 'T2.5') {
      // T2.5: Tez + Antitez
      
      // TEZ
      const { content: thesisContent, usedModel: thesisModel } = await callModel(
        MODELS.architect,
        userMessage,
        "Sen bir tez savunucususun. Kullanıcının sorusuna güçlü bir argüman sun. Net, ikna edici ve yapıcı ol."
      );
      
      responses.push({
        type: 'thesis',
        model: getModelDisplayName(thesisModel),
        content: thesisContent
      });

      // ANTİTEZ (Tez'i bilerek)
      const antithesisPrompt = `Kullanıcı şunu sordu: "${userMessage}"\n\nBir başka model şu tezi savundu:\n\n${thesisContent}\n\nŞimdi sen bu teze karşı güçlü bir antitez sun. Farklı bir bakış açısı getir.`;
      const { content: antithesisContent, usedModel: antithesisModel } = await callModel(
        MODELS.reasoner,
        antithesisPrompt,
        "Sen bir antitez savunucususun. Karşı argümanlar geliştirirsin. Eleştirel, sorgulayıcı ve alternatif bakış açıları sunan bir yaklaşım benimsersin."
      );
      
      responses.push({
        type: 'antithesis',
        model: getModelDisplayName(antithesisModel),
        content: antithesisContent
      });
    } else if (tier === 'T3') {
      // T3: Tez + Antitez + Sentez
      
      // TEZ
      const { content: thesisContent, usedModel: thesisModel } = await callModel(
        MODELS.architect,
        userMessage,
        "Sen bir tez savunucususun. Kullanıcının sorusuna güçlü bir argüman sun. Net, ikna edici ve yapıcı ol."
      );
      
      responses.push({
        type: 'thesis',
        model: getModelDisplayName(thesisModel),
        content: thesisContent
      });

      // ANTİTEZ (Tez'i bilerek)
      const antithesisPrompt = `Kullanıcı şunu sordu: "${userMessage}"\n\nBir başka model şu tezi savundu:\n\n${thesisContent}\n\nŞimdi sen bu teze karşı güçlü bir antitez sun. Farklı bir bakış açısı getir.`;
      const { content: antithesisContent, usedModel: antithesisModel } = await callModel(
        MODELS.reasoner,
        antithesisPrompt,
        "Sen bir antitez savunucususun. Karşı argümanlar geliştirirsin. Eleştirel, sorgulayıcı ve alternatif bakış açıları sunan bir yaklaşım benimsersin."
      );
      
      responses.push({
        type: 'antithesis',
        model: getModelDisplayName(antithesisModel),
        content: antithesisContent
      });

      // SENTEZ (Hem Tez hem Antitez'i bilerek)
      const synthesisPrompt = `Kullanıcı şunu sordu: "${userMessage}"\n\nİki farklı model şu argümanları sundu:\n\nTEZ:\n${thesisContent}\n\nANTİTEZ:\n${antithesisContent}\n\nŞimdi sen bu iki görüşü sentezleyerek dengeli, bütüncül ve nihai bir yanıt ver.`;
      const { content: synthesisContent, usedModel: synthesisModel } = await callModel(
        MODELS.judge,
        synthesisPrompt,
        "Sen yüksek bir yargıç gibisin. Farklı argümanları dinler, analiz eder ve dengeli bir sentez sunar. Tarafsız, adil ve bilgece karar verirsin."
      );
      
      responses.push({
        type: 'synthesis',
        model: getModelDisplayName(synthesisModel),
        content: synthesisContent
      });
    }

    return NextResponse.json({ responses });
  } catch (error) {
    console.error('POST /api/chat hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
