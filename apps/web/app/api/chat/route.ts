import { NextRequest, NextResponse } from 'next/server'
import { MODELS, FALLBACK_MODELS } from '@/lib/models'
import { getTier } from '@/lib/orchestrator'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

// Model ID'den görünen isim
function getModelDisplayName(modelId: string): string {
  const names: Record<string, string> = {
    'deepseek/deepseek-chat': 'DeepSeek',
    'google/gemini-2.0-flash-001': 'Gemini Flash',
    'anthropic/claude-sonnet-4': 'Claude Sonnet',
    'deepseek/deepseek-reasoner': 'DeepSeek Reasoner',
    'x-ai/grok-2-1212': 'Grok',
    'anthropic/claude-opus-4': 'Claude Opus',
    'openai/o1': 'GPT o1',
    'google/gemini-2.5-pro': 'Gemini Pro',
    'openai/gpt-4o-mini': 'GPT-4o Mini',
    'openai/gpt-4o': 'GPT-4o',
  };
  return names[modelId] || modelId;
}

async function callModel(
  modelId: string, 
  prompt: string, 
  systemPrompt?: string,
  allowFallback: boolean = true
): Promise<{ content: string; usedModel: string }> {
  
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
      }),
    });
    
    const data = await response.json();
    
    // Hata varsa fallback dene
    if (data.error || !data.choices || !data.choices[0]) {
      console.error(`Model hatası (${modelId}):`, data.error?.message || 'Bilinmeyen hata');
      
      // Fallback izni varsa ve yedek model varsa
      if (allowFallback && FALLBACK_MODELS[modelId]) {
        const fallbackId = FALLBACK_MODELS[modelId];
        console.log(`Fallback deneniyor: ${modelId} → ${fallbackId}`);
        
        // Yedek modeli çağır (fallback = false, sonsuz döngü olmasın)
        return await callModel(fallbackId, prompt, systemPrompt, false);
      }
      
      return { 
        content: '[Model yanıt veremedi]', 
        usedModel: modelId 
      };
    }
    
    return { 
      content: data.choices[0].message.content, 
      usedModel: modelId 
    };
    
  } catch (error: any) {
    console.error(`Model çağrı hatası (${modelId}):`, error.message);
    
    // Fallback dene
    if (allowFallback && FALLBACK_MODELS[modelId]) {
      const fallbackId = FALLBACK_MODELS[modelId];
      console.log(`Fallback deneniyor (catch): ${modelId} → ${fallbackId}`);
      return await callModel(fallbackId, prompt, systemPrompt, false);
    }
    
    return { 
      content: '[Bağlantı hatası]', 
      usedModel: modelId 
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;
    const lastMessage = messages[messages.length - 1].content;
    
    const tier = getTier(lastMessage);
    
    if (tier === 'T1') {
      const { content, usedModel } = await callModel(MODELS.fastWorker, lastMessage);
      return NextResponse.json({
        tier: 'T1',
        responses: [{ type: 'normal', model: getModelDisplayName(usedModel), content: content }]
      });
    }
    
    if (tier === 'T2') {
      const { content: mainResponse, usedModel: architectModel } = await callModel(
        MODELS.architect, 
        lastMessage, 
        "You are the Architect. Provide a detailed and structured answer."
      );
      
      const { content: interjection, usedModel: prosecutorModel } = await callModel(
        MODELS.prosecutor,
        `User Question: ${lastMessage}\nArchitect's Answer: ${mainResponse}\n\nTask: Critically analyze the answer. If there is a mistake, a better approach, or a missing constraint, provide a VERY SHORT note (max 2 sentences). If the answer is perfect, reply ONLY with 'OK'.`,
        "You are the Prosecutor. Be critical and concise."
      );
      
      const responses = [
        { type: 'normal', model: getModelDisplayName(architectModel), content: mainResponse }
      ];
      
      if (interjection.trim().toUpperCase() !== 'OK') {
        responses.push({ type: 'info', model: getModelDisplayName(prosecutorModel), content: interjection });
      }
      
      return NextResponse.json({ tier: 'T2', responses });
    }

    if (tier === 'T2.5') {
      const { content: thesis, usedModel: thesisModel } = await callModel(
        MODELS.architect,
        lastMessage,
        "You are the Architect. Your role is to present a strong THESIS (🛡️). Provide a clear and well-supported argument."
      );

      const { content: antithesis, usedModel: antithesisModel } = await callModel(
        MODELS.prosecutor,
        `User Question: ${lastMessage}\n\n🛡️ THESIS TO CHALLENGE:\n${thesis}\n\nTask: Present a strong ANTITHESIS (⚔️). Do NOT repeat the thesis. Challenge its weaknesses and offer a compelling counter-argument.`,
        "You are the Prosecutor. Be sharp and provide a strong counter-view."
      );

      return NextResponse.json({
        tier: 'T2.5',
        responses: [
          { type: 'thesis', model: getModelDisplayName(thesisModel), content: thesis },
          { type: 'antithesis', model: getModelDisplayName(antithesisModel), content: antithesis }
        ]
      });
    }

    if (tier === 'T3') {
      const { content: thesis, usedModel: thesisModel } = await callModel(
        MODELS.architect,
        lastMessage,
        "You are the Architect. Present a deep and comprehensive THESIS (🛡️). Consider all major factors."
      );

      const { content: antithesis, usedModel: antithesisModel } = await callModel(
        MODELS.prosecutor,
        `User Question: ${lastMessage}\n\n🛡️ THESIS TO CHALLENGE:\n${thesis}\n\nTask: Present a sharp ANTITHESIS (⚔️). Highlight risks and provide a strong counter-perspective.`,
        "You are the Prosecutor. Be highly critical and analytical."
      );

      const { content: synthesis, usedModel: synthesisModel } = await callModel(
        MODELS.judge,
        `User Question: ${lastMessage}\n\n🛡️ THESIS:\n${thesis}\n\n⚔️ ANTITHESIS:\n${antithesis}\n\nTask: You are the High Judge. Provide the final SYNTHESIS (◆). Weigh both arguments, resolve the conflict, and provide the most balanced and definitive answer.`,
        "You are the High Judge. Be wise, balanced, and decisive."
      );

      return NextResponse.json({
        tier: 'T3',
        responses: [
          { type: 'thesis', model: getModelDisplayName(thesisModel), content: thesis },
          { type: 'antithesis', model: getModelDisplayName(antithesisModel), content: antithesis },
          { type: 'synthesis', model: getModelDisplayName(synthesisModel), content: synthesis }
        ]
      });
    }
    
    const { content, usedModel } = await callModel(MODELS.fastWorker, lastMessage);
    return NextResponse.json({
      tier: tier,
      responses: [{ type: 'normal', model: getModelDisplayName(usedModel), content: content }]
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
