
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateResponse = async (
  prompt: string, 
  history: { role: string; parts: { text: string }[] }[]
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash-lite';
    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction: "You are Bryte AI, an advanced assistant inside the Bryte app. You help with music production, financial advice, and coding. Be cool, concise, and helpful.",
      },
      history: history as any,
    });

    const result = await chat.sendMessage({ message: prompt });
    return result.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Connection error. Please try again.";
  }
};

export const verifyIdentityWithAI = async (base64Image: string): Promise<boolean> => {
  try {
    const model = 'gemini-2.5-flash';
    // We send the image to Gemini to ask if it looks like a valid ID.
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming JPEG for simplicity from canvas/camera
              data: base64Image
            }
          },
          {
            text: "Analyze this image. Is this a valid government-issued ID card, driver's license, OR a valid School/Student ID card? It must look like a physical identification card with a photo. Respond strictly with 'YES' if it is a valid ID document (including student/school IDs), or 'NO' if it is not."
          }
        ]
      }
    });

    const text = response.text?.trim().toUpperCase();
    return text?.includes('YES') || false;
  } catch (error) {
    console.error("ID Verification Error:", error);
    return false;
  }
};
