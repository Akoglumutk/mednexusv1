import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    // 1. Parse Body
    const body = await req.json();
    const { mode, documentIds, message } = body;

    // 2. Fetch Documents
    const supabase = await createClient();
    const { data: docs, error } = await supabase
      .from('documents')
      .select('title, content')
      .in('id', documentIds);

    if (error) {
      return NextResponse.json({ error: `Database Error: ${error.message}` }, { status: 500 });
    }
    
    if (!docs || docs.length === 0) {
      return NextResponse.json({ error: "No documents found with these IDs." }, { status: 404 });
    }

    // 3. Robust Content Extraction
    const contextParts = docs.map((d) => {
      let contentStr = "";
      
      if (!d.content) {
        contentStr = "[Empty Document]";
      } else if (typeof d.content === 'string') {
        contentStr = d.content;
      } else {
        // Force JSON objects (like Tiptap/Slate) into string format
        contentStr = JSON.stringify(d.content);
      }

      // Truncate massively long docs to prevent token limits (approx 20k chars per doc)
      if (contentStr.length > 20000) contentStr = contentStr.substring(0, 20000) + "...[TRUNCATED]";

      return `--- DOCUMENT: ${d.title} ---\n${contentStr}`;
    });

    const contextBlock = contextParts.join("\n\n");

    // 4. Gemini Call
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    let prompt = "";
    if (mode === 'chat') {
      prompt = `
      You are a medical study assistant. Answer the user based ONLY on the context below.
      
      CONTEXT:
      ${contextBlock}
      
      USER QUESTION:
      ${message}
      `;
    } else if (mode === 'quiz') {
      prompt = `
      Generate 5 multiple-choice questions based on this context.
      Return ONLY a raw JSON array. No markdown code blocks.
      Format: [{"question": "...", "options": ["..."], "correctAnswerIndex": 0, "explanation": "..."}]
      
      CONTEXT:
      ${contextBlock}
      `;
    } else if (mode === 'mnemonic') {
      prompt = `
        ROLE: Strict Medical Scribe & Memory Expert.
        TASK: Analyze ONLY the provided source text.
        CONSTRAINT: Do NOT use outside knowledge. If the text is about "Carpal Bones", do NOT generate a mnemonic for "Cranial Nerves".

        ACTION:
        1. Identify the hardest list/sequence IN THE TEXT (e.g., Scaphoid, Lunate...).
        2. Create a Turkish mnemonic (Akrostiş/Tekerleme) specifically for those terms.
        3. If the text is empty or unclear, return { "error": "Kaynak yetersiz." }

        SOURCE TEXT:
        ${contextBlock}

        JSON STRUCTURE:
        {
          "concept": "Carpal Bones (Proximal -> Distal)",
          "mnemonic": "Sandallı Laz Topu Patlattı...", // Example: Scaphoid, Lunate, Triquetrum, Pisiform
          "breakdown": ["S -> Scaphoid", "L -> Lunate"]
        }
      `;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });

  } catch (err: any) {
    console.error("Oracle Server Error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}