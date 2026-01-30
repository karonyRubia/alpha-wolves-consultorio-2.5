
import { Patient, Appointment, FinancialRecord, AppSettings } from '../types';

const AUTH_KEY = 'alpha_auth_users';
const CURRENT_USER_KEY = 'alpha_current_session';

export const db = {
  // --- AUTENTICAÇÃO ---
  register: (email: string, pass: string): boolean => {
    const users = JSON.parse(localStorage.getItem(AUTH_KEY) || '[]');
    const normalizedEmail = email.toLowerCase().trim();
    if (users.find((u: any) => u.email === normalizedEmail)) return false;
    
    users.push({ email: normalizedEmail, pass, blocked: false });
    localStorage.setItem(AUTH_KEY, JSON.stringify(users));
    return true;
  },

  login: (email: string, pass: string): { success: boolean, error?: string } => {
    // Admin Hardcoded Bypass
    if (email === 'KARONY RUBIA' && pass === '102021') {
      localStorage.setItem(CURRENT_USER_KEY, 'KARONY RUBIA');
      const users = JSON.parse(localStorage.getItem(AUTH_KEY) || '[]');
      if (!users.find((u: any) => u.email === 'KARONY RUBIA')) {
        users.push({ email: 'KARONY RUBIA', pass: '102021', blocked: false });
        localStorage.setItem(AUTH_KEY, JSON.stringify(users));
      }
      return { success: true };
    }

    const users = JSON.parse(localStorage.getItem(AUTH_KEY) || '[]');
    const normalizedEmail = email.toLowerCase().trim();
    const user = users.find((u: any) => u.email === normalizedEmail && u.pass === pass);
    
    if (user) {
      if (user.blocked) {
        return { success: false, error: 'Sua conta foi suspensa pela administração Alpha. Entre em contato com o suporte.' };
      }
      localStorage.setItem(CURRENT_USER_KEY, normalizedEmail);
      return { success: true };
    }
    return { success: false, error: 'E-mail ou senha incorretos. Verifique suas credenciais.' };
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.reload();
  },

  getCurrentUser: (): string | null => {
    return localStorage.getItem(CURRENT_USER_KEY);
  },

  isAdmin: (): boolean => {
    return db.getCurrentUser() === 'KARONY RUBIA';
  },

  // --- ADMIN METHODS ---
  getAllUsers: () => {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || '[]');
  },

  updateUserPassword: (email: string, newPass: string): boolean => {
    const users = JSON.parse(localStorage.getItem(AUTH_KEY) || '[]');
    const index = users.findIndex((u: any) => u.email === email);
    if (index !== -1) {
      users[index].pass = newPass;
      localStorage.setItem(AUTH_KEY, JSON.stringify(users));
      return true;
    }
    return false;
  },

  toggleUserBlock: (email: string): boolean => {
    if (email === 'KARONY RUBIA') return false; // Não pode bloquear a si mesma
    const users = JSON.parse(localStorage.getItem(AUTH_KEY) || '[]');
    const index = users.findIndex((u: any) => u.email === email);
    if (index !== -1) {
      users[index].blocked = !users[index].blocked;
      localStorage.setItem(AUTH_KEY, JSON.stringify(users));
      return true;
    }
    return false;
  },

  // --- NAMESPACING ---
  getUserKey: (subKey: string) => {
    const email = db.getCurrentUser();
    if (!email) return `alpha_guest_${subKey}`;
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
      doctorName: db.getCurrentUser() === 'KARONY RUBIA' ? 'KARONY RUBIA' : 'Profissional Alpha',
      professionalRole: db.getCurrentUser() === 'KARONY RUBIA' ? 'Administradora Master' : 'Especialista',
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

  importDB: (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data || typeof data !== 'object') return false;
      const user = db.getCurrentUser();
      if (!user) return false;
      if (data.patients) localStorage.setItem(db.getUserKey('patients'), JSON.stringify(data.patients));
      if (data.appointments) localStorage.setItem(db.getUserKey('appointments'), JSON.stringify(data.appointments));
      if (data.finances) localStorage.setItem(db.getUserKey('finances'), JSON.stringify(data.finances));
      if (data.settings) localStorage.setItem(db.getUserKey('settings'), JSON.stringify(data.settings));
      return true;
    } catch (e) {
      return false;
    }
  }
};
