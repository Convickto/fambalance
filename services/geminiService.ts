
import { GoogleGenAI } from "@google/genai";
import { AI_RECOMMENDATIONS_MOCK } from '../constants';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const geminiService = {
  async getAiRecommendations(familyMoodSummary: any, individualMoodSummary: any, familyName: string, memberNames: string[]): Promise<string[]> {
    await delay(1500); // Simulate API call latency

    // This section demonstrates how the Gemini API would be called.
    // For this mock implementation, we return static data.
    try {
      // Ensure API_KEY is available as per instructions
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        console.warn("API_KEY not found. Please ensure it's configured.");
        return AI_RECOMMENDATIONS_MOCK; // Fallback to mock data
      }

      // Create a new instance for each call to ensure the latest API key is used
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        Você é um especialista em bem-estar familiar, com foco em equilíbrio mental e conexão.
        Analise o seguinte resumo de humor semanal da família "${familyName}" e seus membros (${memberNames.join(', ')}).
        
        Resumo de Humor Familiar: ${JSON.stringify(familyMoodSummary)}
        Resumo de Humor Individual: ${JSON.stringify(individualMoodSummary)}

        Com base nisso, forneça 3-5 recomendações automáticas para a família, em linguagem simples e empática, sem julgamentos. As recomendações devem focar em:
        - Priorizar descanso (se houver estresse/ansiedade)
        - Buscar conversas leves (se houver tristeza/neutralidade)
        - Sugestões de atividades que promovam alegria e conexão.
        - Fomentar a gratidão e o autocuidado.

        Responda apenas com uma lista numerada das recomendações.
      `;

      // const response = await ai.models.generateContent({
      //   model: 'gemini-2.5-flash', // As per guidelines for text tasks
      //   contents: prompt,
      //   config: {
      //     systemInstruction: "Você é um especialista em bem-estar familiar.",
      //     temperature: 0.8,
      //     topP: 0.95,
      //     topK: 64,
      //     maxOutputTokens: 200,
      //     thinkingConfig: { thinkingBudget: 100 },
      //   },
      // });

      // const textResponse = response.text;
      // console.log("Gemini API Response:", textResponse);
      // return textResponse.split('\n').filter(line => line.trim().length > 0);

      // --- Mocked behavior for demonstration ---
      return AI_RECOMMENDATIONS_MOCK;

    } catch (error) {
      console.error("Erro ao chamar a API Gemini:", error);
      // Implement robust error handling and retry logic here in a real scenario
      // For now, fall back to mock data
      return AI_RECOMMENDATIONS_MOCK;
    }
  }
};
