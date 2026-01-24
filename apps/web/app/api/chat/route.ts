import { NextRequest, NextResponse } from 'next/server'
import { MODELS } from '@/lib/models'
import { getTier } from '@/lib/orchestrator'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

async function callModel(modelId: string, prompt: string): Promise<string> {
  const API_KEY = process.env.OPENROUTER_API_KEY || ''
  
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
      messages: [{ role: 'user', content: prompt }],
      stream: false,
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter Error: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;
    const lastMessage = messages[messages.length - 1].content;
    
    const tier = getTier(lastMessage);
    
    if (tier === 'T1') {
      const response = await callModel(MODELS.fastWorker, lastMessage);
      
      return NextResponse.json({
        tier: 'T1',
        responses: [
          {
            type: 'normal',
            model: 'deepseek',
            content: response
          }
        ]
      });
    }
    
    const response = await callModel(MODELS.fastWorker, lastMessage);
    return NextResponse.json({
      tier: tier,
      responses: [
        {
          type: 'normal',
          model: 'deepseek',
          content: response
        }
      ]
    });
    
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
