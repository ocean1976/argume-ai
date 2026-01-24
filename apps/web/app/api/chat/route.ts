import { NextRequest, NextResponse } from 'next/server'
import { MODELS } from '@/lib/models'
import { getTier } from '@/lib/orchestrator'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

async function callModel(modelId: string, prompt: string, systemPrompt?: string): Promise<string> {
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
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt }
      ],
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
        responses: [{ type: 'normal', model: 'DeepSeek', content: response }]
      });
    }
    
    if (tier === 'T2') {
      const mainResponse = await callModel(
        MODELS.architect, 
        lastMessage, 
        "You are the Architect. Provide a detailed and structured answer."
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
        "You are the Architect. Your role is to present a strong THESIS (🛡️). Provide a clear and well-supported argument."
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
        "You are the Architect. Present a deep and comprehensive THESIS (🛡️). Consider all major factors."
      );

      const antithesis = await callModel(
        MODELS.prosecutor,
        `User Question: ${lastMessage}\n\n🛡️ THESIS TO CHALLENGE:\n${thesis}\n\nTask: Present a sharp ANTITHESIS (⚔️). Highlight risks and provide a strong counter-perspective.`,
        "You are the Prosecutor. Be highly critical and analytical."
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
    
    const response = await callModel(MODELS.fastWorker, lastMessage);
    return NextResponse.json({
      tier: tier,
      responses: [{ type: 'normal', model: 'DeepSeek', content: response }]
    });
    
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
