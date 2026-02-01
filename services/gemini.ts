
import { GoogleGenAI } from "@google/genai";

// Initialize the GoogleGenAI client according to the SDK guidelines.
// Assume process.env.API_KEY is pre-configured and valid.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export class GeminiService {
  static async summarizeNote(content: string): Promise<string> {
    try {
      // Basic Text Task: Summarization uses the gemini-3-flash-preview model.
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Summarize the following note content into a concise paragraph: ${content}`,
        config: {
          systemInstruction: "You are a helpful study assistant. Provide clear, concise summaries."
        }
      });
      // Extract the generated text using the .text property as per guidelines.
      return response.text || "Failed to generate summary.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "An error occurred while communicating with Gemini.";
    }
  }

  static async expandNote(content: string): Promise<string> {
    try {
      // Complex Text Task: Tutoring and expansion use the gemini-3-pro-preview model.
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Expand on the following note and provide more detail, context, or examples: ${content}`,
        config: {
          systemInstruction: "You are a knowledgeable academic tutor. Help students expand their thoughts."
        }
      });
      // Extract the generated text using the .text property as per guidelines.
      return response.text || content;
    } catch (error) {
      console.error("Gemini Error:", error);
      return content;
    }
  }
}
