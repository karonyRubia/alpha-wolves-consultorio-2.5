
import { GoogleGenAI } from "@google/genai";
import { Patient, Appointment } from "../types";
import { db } from "../db/storage";

const MODEL_NAME = 'gemini-3-flash-preview';
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export class SecretaryService {
  async getChatResponse(
    userMessage: string, 
    history: { role: 'user' | 'assistant', content: string }[],
    context: { patients: Patient[], appointments: Appointment[] },
    doctorName: string = "Dr(a)"
  ) {
    const globalConfig = db.getGlobalConfig();
    
    // Combina a instrução base definida pelo Master Admin com os dados em tempo real do usuário
    const systemInstruction = `
      ${globalConfig.rubiaBaseInstruction}
      
      Você está atendendo o(a) Dr(a) ${doctorName}.
      
      DADOS DO CONSULTÓRIO DESTE USUÁRIO:
      Pacientes Cadastrados: ${JSON.stringify(context.patients.map(p => ({name: p.name, phone: p.phone, lastVisit: p.lastVisit})))}
      Agenda de Atendimentos: ${JSON.stringify(context.appointments)}

      DIRETRIZES TÉCNICAS:
      - Responda sempre em português.
      - Seja proativa ao sugerir textos de WhatsApp.
      - Se o Dr(a) pedir resumo de um paciente, analise os dados fornecidos acima.
      - Se você for questionada sobre quem te criou, responda que faz parte do ecossistema Alpha Wolves, projetado por Karony Rubia.
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
          temperature: 0.7,
        },
      });

      return response.text || "Desculpe Dr(a), tive um problema na conexão. Pode repetir?";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Sinto muito Dr(a), meu cérebro de IA está temporariamente offline. Verifique a API Key.";
    }
  }
}

export const secretaryService = new SecretaryService();
