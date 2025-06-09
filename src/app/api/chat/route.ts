import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';
import { z } from 'zod';

// Request schema
const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })),
  model: z.string().optional().default('openai/gpt-4o-mini'),
  maxTokens: z.number().optional().default(1000),
  temperature: z.number().optional().default(0.7),
  stream: z.boolean().optional().default(true),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const { messages, model, maxTokens, temperature } = ChatRequestSchema.parse(body);

    // Check for OpenRouter API key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'OpenRouter API key not configured. Please set OPENROUTER_API_KEY environment variable.' 
        }), 
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create OpenRouter provider instance
    const openrouter = createOpenRouter({
      apiKey,
    });

    // Stream response using Vercel AI SDK
    const result = streamText({
      model: openrouter.chat(model),
      messages,
      maxTokens,
      temperature,
      onError: (error) => {
        console.error('Streaming error:', error);
      },
    });

    // Return the streaming response
    return result.toDataStreamResponse({
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request format', 
          details: error.errors 
        }), 
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Handle other errors
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to process chat request' 
      }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 