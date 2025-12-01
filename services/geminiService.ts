
import { GoogleGenAI } from "@google/genai";
import { SPOSProduct, AIPromotionSuggestion, QueueJob } from "../types";

const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const generateProductDetails = async (productName: string, category: string): Promise<{ description: string, marketingTagline: string }> => {
  if (!apiKey) {
    return { 
      description: "Auto-generated description via SPOS Intelligence Layer.", 
      marketingTagline: "Premium Quality" 
    };
  }

  try {
    const prompt = `
      You are the AI engine for SPOS (Sunmart POS).
      Generate a professional, high-converting product description (max 2 sentences) and a punchy marketing tagline.
      Product: ${productName}, Category: ${category}.
      Tone: Professional, enticing, trustworthy.
      Return JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return { description: "Standard quality item.", marketingTagline: "Select Choice" };
  }
};

export const analyzeBusinessAndSuggestPromotions = async (
  salesHistory: any[], // Adapted to accept raw order objects
  inventory: SPOSProduct[]
): Promise<AIPromotionSuggestion[]> => {
  
  if (!apiKey) {
    return [
      {
        title: "Mock AI Strategy",
        rationale: "API Key missing. Showing demo data.",
        suggestedAction: "Enable API Key.",
        targetAudience: "Admin",
        expectedUplift: "N/A",
        priority: "LOW"
      }
    ];
  }

  try {
    const prompt = `
      Act as Retail Strategy AI for Sunmart. Analyze sales.
      Inventory Count: ${inventory.length}.
      Sales Count: ${salesHistory.length}.
      Suggest 3 promotions in JSON.
    `;
     const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text || "[]");
  } catch (e) {
    return [];
  }
};
