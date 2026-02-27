import { GoogleGenAI } from "@google/genai";
import { ExpenseItem, Person } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key is missing. Gemini features will not work.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeSpending = async (items: ExpenseItem[], people: Person[]): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "API Key not configured.";

  const peopleMap = people.reduce((acc, p) => ({ ...acc, [p.id]: p.name }), {} as Record<string, string>);

  const dataSummary = items.map(item => {
    const sharers = item.sharedBy.map(id => peopleMap[id]).join(", ");
    return `- ${item.name}: ${item.price.toLocaleString()} won (Shared by: ${sharers})`;
  }).join("\n");

  const prompt = `
    Analyze the following receipt data for a group split.
    
    Data:
    ${dataSummary}

    Please provide a fun, brief, and witty summary (in Korean) of the spending. 
    1. Who seems to be the "big spender" or involved in the most expensive items?
    2. Any interesting patterns?
    3. A joke about the total cost.
    
    Keep it lighthearted and under 300 characters.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "분석을 완료할 수 없습니다.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
};