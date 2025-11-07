// FIX: Replaced incorrect React component with a proper Gemini service to resolve JSX parsing errors.
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedDevotional } from '../types';

// As per guidelines, apiKey is from process.env.
// The app should ensure process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

/**
 * Generates content using the Gemini API.
 * This is a basic implementation for text-only prompts.
 *
 * @param prompt The text prompt to send to the model.
 * @returns A promise that resolves to the generated text.
 */
export async function generateGeminiContent(prompt: string): Promise<string> {
  try {
    // Using gemini-2.5-flash for basic text tasks as per guidelines.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    // Extracting text directly from the response object as per guidelines.
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Provide a user-friendly error message.
    return "An error occurred while trying to get a response from the AI.";
  }
}

const devotionalThemes = [
  { theme: "esperança em meio às dificuldades", verse: "Salmos 34:18 (NVI)" },
  { theme: "a força do perdão", verse: "Colossenses 3:13 (NVI)" },
  { theme: "encontrando alegria nas pequenas coisas", verse: "1 Tessalonicenses 5:16-18 (NVI)" },
  { theme: "o poder da gratidão", verse: "Salmos 100:4 (NVI)" },
  { theme: "confiando no plano de Deus", verse: "Provérbios 3:5-6 (NVI)" },
  { theme: "a importância da comunidade na fé", verse: "Hebreus 10:24-25 (NVI)" },
  { theme: "vencendo o medo com a fé", verse: "Isaías 41:10 (NVI)" },
  { theme: "o propósito do sofrimento", verse: "Romanos 5:3-5 (NVI)" },
];

export async function generateDevotional(): Promise<GeneratedDevotional> {
    try {
        const randomTopic = devotionalThemes[Math.floor(Math.random() * devotionalThemes.length)];
        
        const prompt = `
          Crie um devocional cristão para mulheres, com tom acolhedor e pastoral, baseado nas seguintes diretrizes:
          - Tema: "${randomTopic.theme}"
          - Versículo base: ${randomTopic.verse}
          - Público: Mulheres
          - Foco: Vida emocional e espiritualidade prática.
          - Formato de saída: Siga EXATAMENTE a estrutura JSON definida no schema.
          - Conteúdo:
            - **Contexto**: Explique brevemente (2-4 linhas) quem escreveu, para quem e o cenário da passagem bíblica.
            - **Reflexão**: Conecte o versículo com a vida real em 6-10 linhas, de forma honesta e empática.
            - **Aplicação Prática**: Forneça uma lista com 3 passos objetivos e simples.
            - **Oração**: Escreva uma oração curta (4-6 linhas), reverente e em primeira pessoa do plural ("nós").
            - **Desafio da Semana**: Uma ação mensurável e simples.
            - **Anotações/Diário**: Uma lista de 3 perguntas para autoexame.
            - **Palavras-chave**: Uma lista de 5 a 7 palavras-chave relevantes.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "Título curto e marcante (máx. 60 caracteres)." },
                        verseReference: { type: Type.STRING, description: "Referência do versículo (ex: 'Salmos 34:18 (NVI)')." },
                        context: { type: Type.STRING, description: "Contexto bíblico em 2 a 4 linhas." },
                        reflection: { type: Type.STRING, description: "Reflexão de 6 a 10 linhas conectando com a vida real." },
                        application: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista com 3 passos práticos e objetivos." },
                        prayer: { type: Type.STRING, description: "Oração curta de 4 a 6 linhas." },
                        weeklyChallenge: { type: Type.STRING, description: "Um desafio simples e mensurável para a semana." },
                        journalPrompts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista com 3 perguntas para autoexame." },
                        keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de 5 a 7 palavras-chave." },
                    },
                    required: ["title", "verseReference", "context", "reflection", "application", "prayer", "weeklyChallenge", "journalPrompts", "keywords"],
                },
            },
        });
        
        const jsonStr = response.text.trim();
        const devotional = JSON.parse(jsonStr) as GeneratedDevotional;
        return devotional;

    } catch (error) {
        console.error("Error calling Gemini API for devotional:", error);
        return {
            title: "Erro ao Gerar Devocional",
            verseReference: "Tente Novamente",
            context: "Não foi possível conectar com a IA para gerar o devocional. Por favor, tente novamente mais tarde.",
            reflection: "Ocasionalmente, a conexão pode falhar. Agradecemos sua paciência.",
            application: [],
            prayer: "",
            weeklyChallenge: "",
            journalPrompts: [],
            keywords: ["erro"],
        };
    }
}