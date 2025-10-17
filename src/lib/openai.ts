import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;

// Helper function to create chat completions
export async function createChatCompletion(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[], options?: {
  model?: string;
  temperature?: number;
  max_tokens?: number;
}) {
  try {
    const response = await openai.chat.completions.create({
      model: options?.model || 'gpt-4o-mini',
      messages,
      temperature: options?.temperature || 0.7,
      max_tokens: options?.max_tokens || 1000,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate response from OpenAI');
  }
}

// Helper function for embeddings
export async function createEmbedding(text: string) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return response.data[0]?.embedding || [];
  } catch (error) {
    console.error('OpenAI embedding error:', error);
    throw new Error('Failed to create embedding');
  }
}

// Helper function for moderation
export async function moderateContent(content: string) {
  try {
    const response = await openai.moderations.create({
      model: 'text-moderation-latest',
      input: content,
    });

    return response.results[0];
  } catch (error) {
    console.error('OpenAI moderation error:', error);
    throw new Error('Failed to moderate content');
  }
}