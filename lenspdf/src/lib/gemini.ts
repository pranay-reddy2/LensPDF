import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function queryPdf(pdfBase64: string, message: string, chatHistory: any[] = []) {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    You are LensPDF, a strictly grounded conversational agent. 
    Your ONLY source of truth is the provided PDF document.
    
    STRICT RULES:
    1. Answer ONLY using information found in the PDF.
    2. If the user asks a question that cannot be answered using the PDF, you MUST explicitly refuse by saying: "I'm sorry, I cannot find that information in the uploaded document. I am only authorized to answer based on the provided content."
    3. For every answer, you MUST provide a citation in the format [Page X] or [Section X] if available. If specific pages are not detectable, refer to sections.
    4. Maintain a professional, technical, and helpful tone.
    5. Support multiple languages: If the user queries in a different language, respond in that language but still follow grounding rules.
    6. Do NOT hallucinate. If you aren't 100% sure the info is in the PDF, refuse to answer.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        ...chatHistory,
        {
          parts: [
            {
              inlineData: {
                mimeType: "application/pdf",
                data: pdfBase64,
              },
            },
            { text: message },
          ],
        },
      ],
      config: {
        systemInstruction,
        temperature: 0.1, // Low temperature for higher grounding accuracy
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
