
import { GoogleGenAI, Type } from "@google/genai";
import { NewsEvent, PricePoint, ImpactAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const searchStockNews = async (symbol: string, startDate: string, endDate: string): Promise<NewsEvent[]> => {
  const query = `Tìm tin tức chính thống về cổ phiếu ${symbol} (HOSE/HNX) từ ngày ${startDate} đến ${endDate}. Trả về danh sách các sự kiện tin tức quan trọng.`;
  
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
            date: { type: Type.STRING, description: "Ngày công bố tin (YYYY-MM-DD)" },
            title: { type: Type.STRING, description: "Tiêu đề tin" },
            source: { type: Type.STRING, description: "Nguồn tin" },
            summary: { type: Type.STRING, description: "Tóm tắt ngắn gọn nội dung tin" },
            url: { type: Type.STRING, description: "Link bài viết" }
          },
          required: ["date", "title", "source", "summary"]
        }
      }
    }
  });

  try {
    const rawData = JSON.parse(response.text || "[]");
    return rawData.map((item: any, index: number) => ({
      ...item,
      id: `news-${index}-${Date.now()}`
    }));
  } catch (e) {
    console.error("Failed to parse news response", e);
    return [];
  }
};

export const analyzeNewsImpact = async (
  symbol: string,
  event: NewsEvent,
  priceData: PricePoint[]
): Promise<ImpactAnalysis> => {
  const prompt = `
    Phân tích phản ứng thị trường sau tin tức cho mã cổ phiếu ${symbol}.
    Sự kiện: ${event.title} (${event.date})
    Dữ liệu giá gần đây: ${JSON.stringify(priceData.slice(-15))}
    
    Yêu cầu:
    1. Tính biến động giá sau 1 ngày, 3 ngày, 5 ngày.
    2. So sánh khối lượng phiên đó với trung bình 10 phiên trước.
    3. Đưa ra quan sát trung lập.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          plus1d: { type: Type.STRING },
          plus3d: { type: Type.STRING },
          plus5d: { type: Type.STRING },
          volVsAvg: { type: Type.STRING },
          volStatus: { type: Type.STRING, enum: ["Spike", "Normal", "Low"] },
          observation: { type: Type.STRING }
        },
        required: ["plus1d", "plus3d", "plus5d", "volVsAvg", "volStatus", "observation"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};
