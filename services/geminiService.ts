import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedDevotional, ReadingPlan } from '../types';
import { uploadAudio } from './storageService';

// CORREÇÃO APLICADA:
// A chave da API é agora lida da variável de ambiente GEMINI_API_KEY,
// que é o nome que você configurou no Vercel.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

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
    return response.text || "";
  } catch (error: any) {
    console.error("Error calling Gemini API:", error.message || error);
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

export async function generateDevotional(): Promise<GeneratedDevotional | null> {
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
        
        let jsonStr = response.text?.trim() || "{}";
        // The API can sometimes wrap the JSON in markdown, so we clean it up.
        const jsonMatch = jsonStr.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
            jsonStr = jsonMatch[1];
        }
        const devotional = JSON.parse(jsonStr) as GeneratedDevotional;
        
        return devotional;

    } catch (error: any) {
        console.error("Error calling Gemini API for devotional:", error.message || error);
        return null;
    }
}

export async function generateDevotionalImage(title: string): Promise<File | null> {
    try {
        const prompt = `Uma imagem hiper-realista e serena de uma paisagem natural, sem a presença de pessoas, representando o conceito espiritual de: "${title}". Estilo fotografia cinematográfica detalhada, iluminação natural suave, cores quentes e acolhedoras.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image', // Using generic image generation model as per instructions for simple requests
            contents: prompt,
        });

        // Iterate parts to find image
        if (response.candidates && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64Data = part.inlineData.data;
                    const byteCharacters = atob(base64Data);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: "image/png" });
                    return new File([blob], "devotional-cover.png", { type: "image/png" });
                }
            }
        }
        return null;
    } catch (error) {
        console.error("Failed to generate devotional image:", error);
        return null;
    }
}

export async function generateReadingPlan(topic: string): Promise<Omit<ReadingPlan, 'id' | 'imageUrl'> | null> {
    try {
        const prompt = `
            Crie um plano de leitura bíblico para mulheres cristãs sobre o tema "${topic}".
            O plano deve ter um tom acolhedor e focar em aplicação prática para a vida diária.
            A duração deve ser entre 5 e 7 dias.
            Retorne a resposta EXATAMENTE no formato JSON definido no schema.
            O campo 'content' para cada dia deve ser uma reflexão de 2 a 4 parágrafos em markdown simples, usando ** para negrito.
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "Título criativo e inspirador para o plano de leitura." },
                        description: { type: Type.STRING, description: "Descrição curta (2-3 linhas) sobre o propósito do plano." },
                        durationDays: { type: Type.INTEGER, description: "O número total de dias do plano (entre 5 e 7)." },
                        days: {
                            type: Type.ARRAY,
                            description: "Uma lista de objetos, um para cada dia do plano.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    day: { type: Type.INTEGER, description: "O número do dia (1, 2, 3...)." },
                                    title: { type: Type.STRING, description: "Um título curto para a reflexão do dia." },
                                    passage: { type: Type.STRING, description: "A referência bíblica principal para o dia (ex: 'Salmos 23:1-3')." },
                                    content: { type: Type.STRING, description: "A reflexão do dia com 2-4 parágrafos, em markdown simples (**negrito**)." },
                                },
                                required: ["day", "title", "passage", "content"]
                            }
                        }
                    },
                    required: ["title", "description", "durationDays", "days"]
                },
            },
        });
        
        const jsonStr = response.text?.trim() || "{}";
        const planData = JSON.parse(jsonStr) as Omit<ReadingPlan, 'id' | 'imageUrl'>;
        
        // Data sanitization and validation to make the feature more robust.
        if (!planData || !planData.days || !Array.isArray(planData.days)) {
            console.error("AI did not return a valid 'days' array.", planData);
            throw new Error("A IA retornou dados em um formato inesperado.");
        }

        // Correct the duration to match the actual number of days returned by the AI.
        // This prevents errors if the AI is inconsistent.
        planData.durationDays = planData.days.length;

        // Ensure each day has the required fields and correct day number.
        planData.days = planData.days.map((day, index) => ({
            day: index + 1, // Overwrite day number for consistency
            title: day.title || `Reflexão para o Dia ${index + 1}`,
            passage: day.passage || "A ser definido",
            content: day.content || "Conteúdo a ser adicionado.",
        }));

        if (!planData.title || planData.days.length === 0) {
            console.error("AI returned malformed plan data:", planData);
            throw new Error("Dados do plano gerado pela IA estão incompletos ou malformados.");
        }

        return planData;

    } catch (error: any) {
        console.error("Error calling Gemini API for reading plan:", error.message || error);
        return null;
    }
}
