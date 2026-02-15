
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

  async analyzeClinicalCase(patient: Patient, doctorName: string = "Doutor(a)") {
    // Calcular idade
    const today = new Date();
    const birthDate = new Date(patient.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    const systemInstruction = `
      Você é a RubIA, uma IA assistente de suporte à decisão clínica avançada. 
      Seu objetivo é auxiliar o ${doctorName} analisando dados do paciente para sugerir hipóteses diagnósticas e condutas.
      
      AVISO LEGAL: Você deve sempre lembrar que é uma IA e suas sugestões não substituem o julgamento clínico humano.
      
      ESTRUTURA DE RESPOSTA (Markdown):
      1. **Resumo do Caso**: Breve síntese dos dados relevantes.
      2. **Hipóteses Diagnósticas**: Lista de diagnósticos prováveis com justificativa curta baseada nos dados.
      3. **Sugestão de Exames/Conduta**: O que investigar a seguir.
      4. **Sinais de Alerta (Red Flags)**: Se houver algo crítico.
    `;

    const prompt = `
      Analise o seguinte caso clínico:
      
      PACIENTE: ${patient.name}
      IDADE: ${age} anos
      
      ANOTAÇÕES CLÍNICAS (ANAMNESE ATUAL):
      ${patient.notes || "Não informado."}
      
      HISTÓRICO DE EVOLUÇÕES:
      ${patient.history.map(h => `- [${h.date}] (${h.type}): ${h.content}`).join('\n')}
      
      Com base APENAS nestes dados, forneça uma análise clínica estruturada.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', // Uso do modelo Pro para maior capacidade de raciocínio clínico
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction,
          temperature: 0.4, // Temperatura mais baixa para maior precisão técnica
        },
      });

      return response.text || "Não foi possível gerar a análise clínica neste momento.";
    } catch (error) {
      console.error("Clinical Analysis Error:", error);
      return "Erro ao conectar com o módulo de inteligência clínica. Verifique sua conexão.";
    }
  }
}

export const secretaryService = new SecretaryService();
