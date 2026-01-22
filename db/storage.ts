
import { Patient, Appointment, FinancialRecord, AppSettings } from '../types';

const AUTH_KEY = 'alpha_auth_users';
const CURRENT_USER_KEY = 'alpha_current_session';

export const db = {
  // --- AUTENTICAÇÃO ---
  register: (email: string, pass: string): boolean => {
    const users = JSON.parse(localStorage.getItem(AUTH_KEY) || '[]');
    const normalizedEmail = email.toLowerCase().trim();
    if (users.find((u: any) => u.email === normalizedEmail)) return false;
    
    users.push({ email: normalizedEmail, pass });
    localStorage.setItem(AUTH_KEY, JSON.stringify(users));
    return true;
  },

  login: (email: string, pass: string): boolean => {
    const users = JSON.parse(localStorage.getItem(AUTH_KEY) || '[]');
    const normalizedEmail = email.toLowerCase().trim();
    const user = users.find((u: any) => u.email === normalizedEmail && u.pass === pass);
    
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, normalizedEmail);
      return true;
    }
    return false;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    // Força o reload para limpar estados em memória
    window.location.reload();
  },

  getCurrentUser: (): string | null => {
    return localStorage.getItem(CURRENT_USER_KEY);
  },

  // --- NAMESPACING (SEGURANÇA DE DADOS) ---
  // Esta função gera chaves únicas baseadas no email logado
  getUserKey: (subKey: string) => {
    const email = db.getCurrentUser();
    if (!email) return `alpha_guest_${subKey}`;
    // Substitui caracteres especiais do email para ser uma chave segura
    const safeEmail = email.replace(/[^a-zA-Z0-9]/g, '_');
    return `alpha_v2_${safeEmail}_${subKey}`;
  },

  // --- CRUD DE DADOS ---
  getPatients: (): Patient[] => {
    const data = localStorage.getItem(db.getUserKey('patients'));
    return data ? JSON.parse(data) : [];
  },
  savePatients: (patients: Patient[]) => {
    if (!db.getCurrentUser()) return;
    localStorage.setItem(db.getUserKey('patients'), JSON.stringify(patients));
  },

  getAppointments: (): Appointment[] => {
    const data = localStorage.getItem(db.getUserKey('appointments'));
    return data ? JSON.parse(data) : [];
  },
  saveAppointments: (appointments: Appointment[]) => {
    if (!db.getCurrentUser()) return;
    localStorage.setItem(db.getUserKey('appointments'), JSON.stringify(appointments));
  },

  getFinances: (): FinancialRecord[] => {
    const data = localStorage.getItem(db.getUserKey('finances'));
    return data ? JSON.parse(data) : [];
  },
  saveFinances: (records: FinancialRecord[]) => {
    if (!db.getCurrentUser()) return;
    localStorage.setItem(db.getUserKey('finances'), JSON.stringify(records));
  },

  getSettings: (): AppSettings => {
    const data = localStorage.getItem(db.getUserKey('settings'));
    const defaults: AppSettings = {
      clinicName: 'Alpha Wolves',
      doctorName: 'Profissional Alpha',
      professionalRole: 'Especialista',
      whatsapp: '',
      instagram: '',
      profileImage: 'https://picsum.photos/id/64/80/80',
      monthlyGoal: 5000
    };
    return data ? { ...defaults, ...JSON.parse(data) } : defaults;
  },
  saveSettings: (settings: AppSettings) => {
    if (!db.getCurrentUser()) return;
    localStorage.setItem(db.getUserKey('settings'), JSON.stringify(settings));
  },

  // --- FERRAMENTAS ---
  exportDB: () => {
    const user = db.getCurrentUser();
    if (!user) return;

    const fullDB = {
      user: user,
      patients: db.getPatients(),
      appointments: db.getAppointments(),
      finances: db.getFinances(),
      settings: db.getSettings(),
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(fullDB, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_alpha_wolves_${user.split('@')[0]}.json`;
    a.click();
  },

  // Fix: Added missing importDB method to restore the database from a JSON backup file.
  importDB: (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data || typeof data !== 'object') return false;
      
      const user = db.getCurrentUser();
      if (!user) return false;

      // Import data into current user session using namespaced keys
      if (data.patients) localStorage.setItem(db.getUserKey('patients'), JSON.stringify(data.patients));
      if (data.appointments) localStorage.setItem(db.getUserKey('appointments'), JSON.stringify(data.appointments));
      if (data.finances) localStorage.setItem(db.getUserKey('finances'), JSON.stringify(data.finances));
      if (data.settings) localStorage.setItem(db.getUserKey('settings'), JSON.stringify(data.settings));
      
      return true;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  }
};
