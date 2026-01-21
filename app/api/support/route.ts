import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: UIMessage[] };
  const modelMessages = await convertToModelMessages(messages.map(({ id: _id, ...m }) => m));

  const result = await streamText({
    model: openai("gpt-4o-mini"),
    system:
      "Tu és o Assistente Virtual da Frota+. Responde em português (pt-PT), com tom profissional e direto. Faz perguntas curtas quando faltar contexto. Se o pedido for sobre cartão/PIN/abastecimento/postos, dá passos práticos.",
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}

