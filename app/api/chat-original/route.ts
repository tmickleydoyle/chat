import { HfInference } from "@huggingface/inference";
import { NextRequest } from 'next/server';

const Hf = new HfInference(process.env.HF_TOKEN);

export async function POST(req: NextRequest,) {
  const { prompt } = await req.json();

  const response = await Hf.chatCompletionStream({
    model: process.env.HF_CHAT_ORIGINAL,
    messages: prompt,
    temperature: 0.5,
    max_tokens: 250,
    top_p: 0.5
  });

  let out = "";

  for await (const chunk of response) {
    if (chunk.choices && chunk.choices.length > 0) {
      const newContent = chunk.choices[0].delta.content;
      out += newContent;
    }  
  }

  return new Response(out);
}
