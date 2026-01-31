
import { Patient, Appointment, FinancialRecord, AppSettings, GlobalConfig } from '../types';

const AUTH_KEY = 'alpha_auth_users';
const CURRENT_USER_KEY = 'alpha_current_session';
const RECOVERY_KEY = 'alpha_recovery_requests';
const GLOBAL_CONFIG_KEY = 'alpha_global_master_config';

const notifyUpdate = (type: 'users' | 'config' | 'data') => {
  window.dispatchEvent(new Event(`alpha_${type}_updated`));
  window.dispatchEvent(new Event('storage')); // Notifica outras abas
};

const defaultGlobalConfig: GlobalConfig = {
  appName: 'Alpha Wolves',
  appSlogan: 'Consultório Digital de Elite',
  primaryColor: '#0e7490',
  accentColor: '#1e3a8a',
  globalNotice: '',
  rubiaBaseInstruction: 'Você é a Rubia, o cérebro operacional do consultório Alpha. Sua missão é garantir produtividade máxima.',
  maintenanceMode: false
};

export const db = {
  // --- SEGURANÇA E INTEGRIDADE ---
  safeSave: (key: string, data: any) => {
    try {
      const serialized = JSON.stringify(data);
      if (!serialized || serialized === 'null') return;
      localStorage.setItem(key, serialized);
    } catch (e) {
      console.error("Erro crítico de persistência Alpha:", e);
      alert("Aviso: Memória do navegador cheia ou erro de escrita. Seus dados podem não ter sido salvos.");
    }
  },

  // --- CONFIGURAÇÕES GLOBAIS (MASTER) ---
  getGlobalConfig: (): GlobalConfig => {
    try {
      const data = localStorage.getItem(GLOBAL_CONFIG_KEY);
      return data ? { ...defaultGlobalConfig, ...JSON.parse(data) } : defaultGlobalConfig;
    } catch { return defaultGlobalConfig; }
  },

  saveGlobalConfig: (config: GlobalConfig) => {
    db.safeSave(GLOBAL_CONFIG_KEY, config);
    notifyUpdate('config');
  },

  // --- AUTENTICAÇÃO E REGISTRO ---
  updateLastActive: (email: string) => {
    const users = db.getAllUsers();
    const index = users.findIndex((u: any) => u.email === email.toLowerCase().trim());
    if (index !== -1) {
      users[index].lastActive = new Date().toISOString();
      db.safeSave(AUTH_KEY, users);
      notifyUpdate('users');
    }
  },

  register: (email: string, pass: string): boolean => {
    const users = db.getAllUsers();
    const normalizedEmail = email.toLowerCase().trim();
    if (users.find((u: any) => u.email === normalizedEmail)) return false;
    
    users.push({ 
      email: normalizedEmail, 
      pass, 
      blocked: false, 
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    });
    db.safeSave(AUTH_KEY, users);
    notifyUpdate('users');
    return true;
  },

  login: (email: string, pass: string): { success: boolean, error?: string } => {
    const users = db.getAllUsers();
    const normalizedEmail = email.toLowerCase().trim();

    // Bypass Admin
    if (email === 'KARONY RUBIA' && pass === '102021') {
      localStorage.setItem(CURRENT_USER_KEY, 'KARONY RUBIA');
      if (!users.find((u: any) => u.email === 'KARONY RUBIA')) {
        db.register('KARONY RUBIA', '102021');
      } else {
        db.updateLastActive('KARONY RUBIA');
      }
      return { success: true };
    }

    const user = users.find((u: any) => u.email === normalizedEmail && u.pass === pass);
    if (user) {
      if (user.blocked) return { success: false, error: 'Acesso suspenso pela Administração Alpha.' };
      
      const config = db.getGlobalConfig();
      if (config.maintenanceMode) return { success: false, error: 'O sistema está em manutenção global. Tente novamente mais tarde.' };

      localStorage.setItem(CURRENT_USER_KEY, normalizedEmail);
      db.updateLastActive(normalizedEmail);
      return { success: true };
    }
    return { success: false, error: 'E-mail ou senha inválidos.' };
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.reload();
  },

  getCurrentUser: (): string | null => localStorage.getItem(CURRENT_USER_KEY),
  isAdmin: (): boolean => db.getCurrentUser() === 'KARONY RUBIA',
  getAllUsers: () => {
    try {
      return JSON.parse(localStorage.getItem(AUTH_KEY) || '[]');
    } catch { return []; }
  },

  // --- ADMIN TOOLS ---
  getUserDataAudit: (email: string) => {
    const safeEmail = email.replace(/[^a-zA-Z0-9]/g, '_');
    const patients = JSON.parse(localStorage.getItem(`alpha_v2_${safeEmail}_patients`) || '[]');
    const finances = JSON.parse(localStorage.getItem(`alpha_v2_${safeEmail}_finances`) || '[]');
    return { patients, finances };
  },

  updateUserPassword: (email: string, newPass: string): boolean => {
    const users = db.getAllUsers();
    const index = users.findIndex((u: any) => u.email === email);
    if (index !== -1) {
      users[index].pass = newPass;
      db.safeSave(AUTH_KEY, users);
      db.resolveRecoveryRequest(email);
      notifyUpdate('users');
      return true;
    }
    return false;
  },

  toggleUserBlock: (email: string): boolean => {
    if (email === 'KARONY RUBIA') return false;
    const users = db.getAllUsers();
    const index = users.findIndex((u: any) => u.email === email);
    if (index !== -1) {
      users[index].blocked = !users[index].blocked;
      db.safeSave(AUTH_KEY, users);
      notifyUpdate('users');
      return true;
    }
    return false;
  },

  // --- RECOVERY ---
  addRecoveryRequest: (email: string) => {
    const requests = JSON.parse(localStorage.getItem(RECOVERY_KEY) || '[]');
    const normalized = email.toLowerCase().trim();
    if (!requests.find((r: any) => r.email === normalized)) {
      requests.push({ id: Date.now().toString(), email: normalized, timestamp: new Date().toISOString() });
      db.safeSave(RECOVERY_KEY, requests);
      notifyUpdate('users');
    }
    return true;
  },
  getRecoveryRequests: () => JSON.parse(localStorage.getItem(RECOVERY_KEY) || '[]'),
  resolveRecoveryRequest: (email: string) => {
    const requests = db.getRecoveryRequests();
    const filtered = requests.filter((r: any) => r.email !== email.toLowerCase().trim());
    db.safeSave(RECOVERY_KEY, filtered);
    notifyUpdate('users');
  },

  // --- DATA NAMESPACING ---
  getUserKey: (subKey: string) => {
    const email = db.getCurrentUser();
    if (!email) return `alpha_guest_${subKey}`;
    const safeEmail = email.replace(/[^a-zA-Z0-9]/g, '_');
    return `alpha_v2_${safeEmail}_${subKey}`;
  },

  // --- CRUD METHODS ---
  getPatients: (): Patient[] => JSON.parse(localStorage.getItem(db.getUserKey('patients')) || '[]'),
  savePatients: (patients: Patient[]) => db.safeSave(db.getUserKey('patients'), patients),
  getAppointments: (): Appointment[] => JSON.parse(localStorage.getItem(db.getUserKey('appointments')) || '[]'),
  saveAppointments: (appointments: Appointment[]) => db.safeSave(db.getUserKey('appointments'), appointments),
  getFinances: (): FinancialRecord[] => JSON.parse(localStorage.getItem(db.getUserKey('finances')) || '[]'),
  saveFinances: (records: FinancialRecord[]) => db.safeSave(db.getUserKey('finances'), records),
  getSettings: (): AppSettings => {
    const data = localStorage.getItem(db.getUserKey('settings'));
    const defaults: AppSettings = {
      clinicName: 'Alpha Wolves',
      doctorName: db.getCurrentUser() === 'KARONY RUBIA' ? 'KARONY RUBIA' : 'Profissional Alpha',
      professionalRole: db.getCurrentUser() === 'KARONY RUBIA' ? 'Administradora Master' : 'Especialista',
      whatsapp: '', instagram: '', profileImage: 'https://picsum.photos/id/64/80/80', monthlyGoal: 5000
    };
    return data ? { ...defaults, ...JSON.parse(data) } : defaults;
  },
  saveSettings: (settings: AppSettings) => db.safeSave(db.getUserKey('settings'), settings),

  exportDB: () => {
    const user = db.getCurrentUser();
    if (!user) return;
    const fullDB = { user, patients: db.getPatients(), appointments: db.getAppointments(), finances: db.getFinances(), settings: db.getSettings(), timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(fullDB, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_alpha_${user.split('@')[0]}.json`;
    a.click();
  },

  importDB: (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.patients) db.savePatients(data.patients);
      if (data.appointments) db.saveAppointments(data.appointments);
      if (data.finances) db.saveFinances(data.finances);
      if (data.settings) db.saveSettings(data.settings);
      notifyUpdate('data');
      return true;
    } catch { return false; }
  }
};
