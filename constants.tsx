
import React from 'react';
import { Patient, Appointment, FinancialRecord } from './types';

export const MOCK_PATIENTS: Patient[] = [
  { 
    id: '1', 
    name: 'Ana Silva', 
    email: 'ana@email.com', 
    phone: '(11) 98888-7777', 
    birthDate: '1990-05-15', 
    notes: 'Paciente apresenta sensibilidade a AINEs. Histórico de enxaqueca crônica.', 
    lastVisit: '2023-10-20',
    history: [
      { id: 'h1', date: '2023-10-20', type: 'CONSULTA', content: 'Início do tratamento para enxaqueca. Prescrito repouso e hidratação.' },
      { id: 'h2', date: '2023-09-05', type: 'EXAME', content: 'Ressonância magnética de crânio sem alterações significativas.' }
    ]
  },
  { 
    id: '2', 
    name: 'Bruno Mendes', 
    email: 'bruno@email.com', 
    phone: '(11) 97777-6666', 
    birthDate: '1985-02-10', 
    notes: 'Hipertenso controlado com Losartana 50mg.', 
    lastVisit: '2023-11-05',
    history: [
      { id: 'h3', date: '2023-11-05', type: 'PROCEDIMENTO', content: 'Limpeza profilática realizada com sucesso.' }
    ]
  },
  { 
    id: '3', 
    name: 'Carla Souza', 
    email: 'carla@email.com', 
    phone: '(11) 96666-5555', 
    birthDate: '1995-12-25', 
    notes: 'Paciente gestante (12 semanas). Requer cuidados redobrados com prescrição.', 
    lastVisit: '2023-11-12',
    history: []
  },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'a1', patientId: '1', patientName: 'Ana Silva', date: '2024-05-20', time: '09:00', type: 'Consulta', status: 'SCHEDULED', amount: 250 },
  { id: 'a2', patientId: '2', patientName: 'Bruno Mendes', date: '2024-05-20', time: '10:30', type: 'Retorno', status: 'SCHEDULED', amount: 0 },
  { id: 'a3', patientId: '3', patientName: 'Carla Souza', date: '2024-05-21', time: '14:00', type: 'Consulta', status: 'SCHEDULED', amount: 250 },
];

export const MOCK_FINANCES: FinancialRecord[] = [
  { id: 'f1', type: 'INCOME', category: 'Consultas', description: 'Pagamento Ana Silva', amount: 250, date: '2024-05-15' },
  { id: 'f2', type: 'EXPENSE', category: 'Aluguel', description: 'Aluguel Sala 302', amount: 1500, date: '2024-05-01' },
  { id: 'f3', type: 'INCOME', category: 'Procedimentos', description: 'Limpeza Dental Bruno', amount: 350, date: '2024-05-18' },
];

export const ICONS = {
  Dashboard: (className?: string) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
  ),
  Patients: (className?: string) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
  ),
  Agenda: (className?: string) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
  ),
  Finances: (className?: string) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  Secretary: (className?: string) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
  ),
  Plus: (className?: string) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
  ),
  WhatsApp: (className?: string) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.433 5.63 1.434h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
  ),
  Instagram: (className?: string) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
  ),
  Send: (className?: string) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
  )
};
