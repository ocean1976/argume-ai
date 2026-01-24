import { NextRequest, NextResponse } from 'next/server'
import { MODELS } from '@/lib/models';

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const results: Record<string, { success: boolean; error?: string }> = {};
  
  // Test edilecek modeller
  const modelsToTest = [
    { name: 'fastWorker', id: MODELS.fastWorker },
    { name: 'librarian', id: MODELS.librarian },
    { name: 'architect', id: MODELS.architect },
    { name: 'prosecutor', id: MODELS.prosecutor },
    { name: 'newsAnchor', id: MODELS.newsAnchor },
    { name: 'judge', id: MODELS.judge },
    { name: 'reasoner', id: MODELS.reasoner },
    { name: 'visionary', id: MODELS.visionary },
  ];
  
  // OPENROUTER_API_KEY kontrolü
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      summary: 'HATA: OPENROUTER_API_KEY ortam değişkeni ayarlanmamış.',
      results: {}
    }, { status: 500 });
  }

  for (const model of modelsToTest) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://clashof.ai',
          'X-Title': 'Clash of AI - Model Test'
        },
        body: JSON.stringify({
          model: model.id,
          messages: [{ role: 'user', content: 'Test. Sadece "OK" yaz.' }],
          stream: false,
          max_tokens: 10,
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        results[model.name] = { 
          success: false, 
          error: data.error.message 
        };
      } else if (data.choices && data.choices[0]) {
        results[model.name] = { success: true };
      } else {
        results[model.name] = { 
          success: false, 
          error: 'Beklenmeyen yanıt veya boş seçim listesi' 
        };
      }
    } catch (error: any) {
      results[model.name] = { 
        success: false, 
        error: error.message 
      };
    }
  }
  
  // Özet ekle
  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(r => r.success).length;
  
  return NextResponse.json({
    summary: `${passed}/${total} model çalışıyor`,
    results
  });
}
