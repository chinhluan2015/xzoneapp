
import { GoogleGenAI, Type } from "@google/genai";
import { NewsEvent, ImpactAnalysis } from "../types";
import { getMockNews } from "./mockNews";

// API Key loading with fallback for different environments
const API_KEY = typeof process !== 'undefined' && process.env?.API_KEY
  ? process.env.API_KEY
  : (import.meta.env?.VITE_GEMINI_API_KEY || '');

if (!API_KEY) {
  console.warn('⚠️ Gemini API Key not found. Set VITE_GEMINI_API_KEY in .env file.');
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const searchStockNews = async (symbol: string, startDate: string, endDate: string): Promise<NewsEvent[]> => {
  // Check if API key exists
  if (!API_KEY) {
    console.warn('⚠️ No API key found, using mock data');
    return getMockNews(symbol, startDate, endDate);
  }

  try {
    const query = `Trích xuất tin tức quan trọng có tác động đến giá cổ phiếu ${symbol} (Việt Nam) từ ngày ${startDate} đến ${endDate}. Yêu cầu tập trung vào các sự kiện doanh nghiệp, vĩ mô, hoặc báo cáo tài chính.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING, description: "YYYY-MM-DD" },
              title: { type: Type.STRING },
              source: { type: Type.STRING },
              summary: { type: Type.STRING },
              url: { type: Type.STRING }
            },
            required: ["date", "title", "source", "summary"]
          }
        }
      }
    });

    const rawData = JSON.parse(response.text || "[]");
    return rawData.map((item: any, index: number) => ({
      ...item,
      id: `news-${index}-${Date.now()}`
    }));
  } catch (e: any) {
    console.error("Gemini API error:", e);

    // Fallback to mock data on API errors (quota exceeded, network issues, etc.)
    if (e?.message?.includes('quota') || e?.message?.includes('RESOURCE_EXHAUSTED') || e?.status === 429) {
      console.warn('⚠️ API quota exceeded, using mock data');
    } else {
      console.warn('⚠️ API error, using mock data as fallback');
    }

    return getMockNews(symbol, startDate, endDate);
  }
};

/**
 * Generates a neutral market observation based strictly on quantitative metrics.
 */
export const generateMarketObservation = async (headline: string, impact: ImpactAnalysis): Promise<string> => {
  const statsString = `
    Headline: ${headline}
    XIS Score: ${impact.xisScore}
    Z-Max: ${impact.zMax}
    Volume Ratio: ${impact.volRatio}
    Range Ratio: ${impact.rangeRatio}
    CAR [0,1]: ${(impact.returns.imm * 100).toFixed(2)}%
    CAR [0,3]: ${(impact.returns.short * 100).toFixed(2)}%
    CAR [0,5]: ${(impact.returns.med * 100).toFixed(2)}%
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: statsString,
    config: {
      systemInstruction: `You are a professional market commentator with a quantitative background. 
      Generate a neutral market observation paragraph based ONLY on the provided metrics. 
      No prediction. No investment advice. No emotional language. 
      Clearly distinguish: Immediate reaction, Short-term follow-through, and Market hesitation or confirmation.
      Output format: One concise paragraph (3–5 sentences) in Vietnamese. Objective tone. Data-driven explanation.`,
      temperature: 0.1, // Low temperature for high objectivity
    }
  });

  return response.text || "Không thể khởi tạo bình luận thị trường.";
};
