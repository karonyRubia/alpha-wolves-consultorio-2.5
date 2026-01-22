
import { GoogleGenAI } from "@google/genai";
import { Patient, Appointment } from "../types";

const MODEL_NAME = 'gemini-3-flash-preview';

// Fix: Always initialize GoogleGenAI using a direct reference to process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export class SecretaryService {
  async getChatResponse(
    userMessage: string, 
    history: { role: 'user' | 'assistant', content: string }[],
    context: { patients: Patient[], appointments: Appointment[] },
    doctorName: string = "Dr(a)"
  ) {
    const systemInstruction = `
      Você é a Rubia, a Secretária Virtual inteligente de elite do consultório.
      Seu objetivo é ser o cérebro operacional por trás do sucesso do(a) profissional.
      Refira-se ao usuário sempre como "Dr(a)".
      
      Você tem acesso total aos dados (em tempo real):
      Pacientes: ${JSON.stringify(context.patients)}
      Agenda: ${JSON.stringify(context.appointments)}

      Suas diretrizes de personalidade:
      1. TOM: Executivo, sofisticado, direto e ultra-eficiente. 
      2. IDENTIDADE: Você é a Rubia.
      3. CAPACIDADES: Você analisa métricas, sugere textos de lembrete via WhatsApp, resume prontuários e ajuda a priorizar o dia.
      4. WHATSAPP: Se o usuário pedir para enviar uma mensagem, escreva o texto PRONTO para copiar e colar, com emojis profissionais e links de confirmação.

      Exemplo de resposta ao pedir lembrete:
      "Dr(a), preparei este lembrete para a Ana Silva (Consulta às 09:00):
      'Olá Ana! 🌸 Confirmamos sua consulta hoje às 09:00. Aguardamos você. Confirme com OK.'"

      Nunca saia do personagem. Você é Rubia.
    `;

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: history.map(h => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }]
        })).concat([{ role: 'user', parts: [{ text: userMessage }] }]),
        config: {
          systemInstruction,
          temperature: 0.6,
        },
      });

      return response.text || "Rubia encontrou uma interferência. Tentando reconectar...";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Sistema Rubia offline. Verifique a chave de integração Gemini.";
    }
  }
}

export const secretaryService = new SecretaryService();
