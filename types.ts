
export enum View {
  DASHBOARD = 'DASHBOARD',
  PATIENTS = 'PATIENTS',
  AGENDA = 'AGENDA',
  FINANCES = 'FINANCES',
  SECRETARY = 'SECRETARY',
  SETTINGS = 'SETTINGS',
  PRONTUARIOS = 'PRONTUARIOS',
  GET_CODE = 'GET_CODE',
  ADMIN = 'ADMIN'
}

export interface HistoryEntry {
  id: string;
  date: string;
  type: 'CONSULTA' | 'EXAME' | 'PROCEDIMENTO' | 'OBSERVAÇÃO';
  content: string;
}

export interface PatientFile {
  id: string;
  name: string;
  type: string; // mime type
  data: string; // base64
  date: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  notes: string;
  lastVisit?: string;
  history: HistoryEntry[];
  files?: PatientFile[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  type: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  amount: number;
}

export interface FinancialRecord {
  id: string;
  type: 'INCOME' | 'EXPENSE' | 'PIX';
  category: string;
  description: string;
  amount: number;
  date: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AppSettings {
  clinicName: string;
  doctorName: string;
  professionalRole: string;
  whatsapp: string;
  instagram: string;
  profileImage: string;
  monthlyGoal: number;
}
