import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSession } from '@/lib/auth';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key is missing' }, { status: 500 });
    }

    const { messages, context, mode } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages array' }, { status: 400 });
    }

    // Build the system instructions based on the mode and context
    let systemInstruction = `You are an expert AI Voice Agent Prompt Engineer named "Brain Builder". Your goal is to help the user craft an enterprise-grade, highly effective system prompt for a voice-based AI calling agent. Be friendly, concise, and highly intelligent.

    You must take into account the current configuration of the agent the user is building:
    - Agent Type: ${context?.type || 'Unknown'} (INBOUND, OUTBOUND, or HYBRID)
    - Agent Model: ${context?.model || 'Unknown'}
    - Agent Voice: ${context?.voiceId || 'Unknown'}
    - Agent Speaks First: ${context?.speaksFirst ? `Yes, with message: "${context?.firstMessage}"` : 'No'}
    - Voicemail Handling Instructions: ${context?.voicemailHandling || 'None provided'}
    - Enabled Tools: ${JSON.stringify(context?.tools || [])}
    - Transfer Destinations: ${JSON.stringify(context?.transferTargets || [])}
    - Tool Usage Context: ${JSON.stringify(context?.availableToolsContext || [])}

    CRITICAL RULE FOR ALL MODES:
    - The final output MUST be a complete system prompt wrapped in \`\`\`systemprompt and \`\`\` blocks, e.g.,
    \`\`\`systemprompt
    Your system prompt here...
    \`\`\`
    - You must incorporate exact instructions for how the agent should use the tools it has been given access to, relying strictly on the "Tool Usage Context" provided above.
    - If it's an outbound campaign, use the placeholder {{customer.name}} in the prompt.
    `;

    if (mode === 'questionnaire') {
      systemInstruction += `
    MODE: Questionnaire.
    You must ask the user a series of essential questions to build the prompt.
    Do NOT ask all questions at once. Ask ONE question at a time.
    Wait for the user's answer before asking the next question.
    Only ask questions about their business, the agent's specific goal, tone, objection handling, and unique selling points.
    Do NOT ask questions about things you already know from the context (like tools or voice).
    Once you have enough information (usually 3-4 questions), say "Great! Here is the prompt I built for you:" and output the final system prompt wrapped in \`\`\`systemprompt blocks.
    `;
    } else {
      systemInstruction += `
    MODE: Quick Chat.
    The user will tell you what they want. You should output the full system prompt wrapped in \`\`\`systemprompt blocks based on their initial input and the context.
    If their request is too vague, you can ask 1 or 2 clarifying questions before generating the prompt.
    `;
    }

    const openaiMessages = [
      { role: 'system', content: systemInstruction },
      ...messages
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Use GPT-4o for best results in prompt engineering
      messages: openaiMessages,
      temperature: 0.7,
    });

    return NextResponse.json({
      message: response.choices[0].message.content,
      role: 'assistant'
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error generating prompt:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate prompt' }, { status: 500 });
  }
}
