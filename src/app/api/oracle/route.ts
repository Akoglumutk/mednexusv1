import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  const { mode, documentIds, message } = await req.json();
  const supabase = await createClient();

  // 1. Fetch the actual content for the selected IDs
  const { data: docs, error } = await supabase
    .from('documents')
    .select('title, content')
    .in('id', documentIds);

  if (error || !docs) return NextResponse.json({ error: "Context not found" }, { status: 404 });

  const contextBlock = docs.map(d => `--- DOCUMENT: ${d.title} ---\n${d.content}`).join("\n\n");

  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  // 2. Define System Instructions based on Mode
  let systemPrompt = "";
  if (mode === 'chat') {
    systemPrompt = `You are The Oracle, a medical study assistant. Use the following context to answer the user: \n${contextBlock}`;
  } else if (mode === 'quiz') {
    systemPrompt = `Generate 5 high-yield multiple choice questions based ONLY on this context: \n${contextBlock}. Return ONLY a JSON array of objects with: question, options[], correctAnswerIndex, and explanation.`;
  } else if (mode === 'audio') {
    systemPrompt = `Create a 2-minute engaging podcast script summarizing these medical notes. Use a professional yet conversational tone. Start with "Welcome to your MedNexus Briefing." Context: \n${contextBlock}`;
  }

  const result = await model.generateContent(mode === 'chat' ? [systemPrompt, message] : systemPrompt);
  const response = await result.response;
  
  return NextResponse.json({ text: response.text() });
}