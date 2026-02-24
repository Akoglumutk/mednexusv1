// src/app/api/oracle/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Server Configuration Error: API Key missing." }, { status: 500 });
    }

    const { prompt } = await req.json();
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // THE FIX: We force HTML output and teach it your custom component syntax
    const structuredPrompt = `
      SYSTEM INSTRUCTION:
      You are the MedNexus Oracle, a specialized medical protocol architect.
      Your task is to transform raw, messy notes into a structured HTML document compatible with a rich-text editor.

      OUTPUT RULES:
      1. RETURN ONLY RAW HTML. Do not wrap in \`\`\`html code blocks. Start directly with <h2>.
      2. Use <h2> for Main Sections, <h3> for Subsections.
      3. Use <ul> and <li> for lists.
      4. Use <strong> for emphasis (drugs, critical values).
      5. Use <table>, <tr>, <th>, and <td> for comparative data (differential diagnoses, dosage charts).
      
      CRITICAL - USE CUSTOM COMPONENTS:
      Identify key medical concepts and wrap them in this specific HTML tag:
      <span data-type="med-tag" label="LABEL_NAME" color="HEX_CODE"></span>
        
      Use these specific tags:
      - For Exams/Boards importance -> label="EXAM" color="#ef4444"
      - For Clinical Warnings -> label="WARN" color="#f59e0b"
      - For Drug/Dosage info -> label="DRUG" color="#10b981"
      - For General Notes -> label="NOTE" color="#3b82f6"
        
      STRICT RULES FOR TAGGING:
      1. ONLY tag actual pharmaceutical agents (e.g., Aspirin, Warfarin) as "DRUG". 
      2. DO NOT tag anatomical structures (e.g., Lamina lucida, epithelial tissue, aorta) as drugs.
      3. If a term is just a body part or biological layer, do not tag it.

      EXAMPLE INPUT:
      "Patient on warfarin needs INR check. Warning: don't give with aspirin."

      EXAMPLE OUTPUT:
      <p>Patient on <strong>warfarin</strong> <span data-type="med-tag" label="DRUG" color="#10b981"></span> needs INR check.</p>
      <p><span data-type="med-tag" label="WARN" color="#f59e0b"></span> <strong>Do not administer with aspirin.</strong></p>

      USER RAW TEXT TO PROCESS:
      ${prompt}
    `;

    const result = await model.generateContent(structuredPrompt);
    const text = result.response.text();

    // Cleanup: Sometimes LLMs still wrap in markdown code blocks despite instructions
    const cleanHtml = text.replace(/```html/g, '').replace(/```/g, '').trim();

    return NextResponse.json({ output: cleanHtml });

  } catch (error: any) {
    console.error("Oracle API Crash:", error);
    return NextResponse.json({ error: "The Oracle is silent.", details: error.message }, { status: 500 });
  }
}