import { HfInference } from "@huggingface/inference";
import { HuggingFaceStream } from "ai";
import { NextRequest } from 'next/server';


const Hf = new HfInference(process.env.HF_TOKEN);

export async function POST(req: NextRequest,) {
  const { prompt } = await req.json();

  const response = await Hf.textGenerationStream({
    model: process.env.HF_MODEL,
    inputs: `<|system|>\nYou are a color design app that returns a hex color based on a /user/ /input/</s>\n<|user|>\n${prompt}. Only return hex color code.</s>\n<|assistant|>`,
    parameters: {
      max_new_tokens: 250,
      typical_p: 0.2,
      repetition_penalty: 1,
      truncate: 100,
      return_full_text: true,
    },
  });

  const stream = HuggingFaceStream(response);

  return new Response(stream);
}
