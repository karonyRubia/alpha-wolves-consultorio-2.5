
import { Patient, Appointment, FinancialRecord, AppSettings, GlobalConfig, AccessLog } from '../types';

const AUTH_KEY = 'alpha_auth_users';
const CURRENT_USER_KEY = 'alpha_current_session';
const RECOVERY_KEY = 'alpha_recovery_requests';
const GLOBAL_CONFIG_KEY = 'alpha_global_master_config';
const ACCESS_LOGS_KEY = 'alpha_global_logs';

const notifyUpdate = (type: 'users' | 'config' | 'data' | 'logs') => {
  window.dispatchEvent(new Event(`alpha_${type}_updated`));
  window.dispatchEvent(new Event('storage'));
};

const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "Tablet";
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "Mobile";
  return "Desktop (" + (navigator.platform || "PC") + ")";
};

const defaultGlobalConfig: GlobalConfig = {
  appName: 'Alpha Wolves',
  appSlogan: 'Consultório Digital de Elite',
  primaryColor: '#0e7490',
  accentColor: '#1e3a8a',
  globalNotice: '',
  rubiaBaseInstruction: 'Você é a Rubia, o cérebro operacional do consultório Alpha.',
  maintenanceMode: false
};

export const db = {
  // --- SISTEMA DE LOGS DE MONITORAMENTO ---
  recordAccessLog: (email: string, action: AccessLog['action'], status: AccessLog['status'] = 'SUCCESS') => {
    try {
      const logs: AccessLog[] = JSON.parse(localStorage.getItem(ACCESS_LOGS_KEY) || '[]');
      const newLog: AccessLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        email: email.toLowerCase().trim(),
        timestamp: new Date().toISOString(),
        device: getDeviceType(),
        action,
        status
      };
      // Manter apenas os últimos 200 logs para não pesar o navegador
      const updatedLogs = [newLog, ...logs].slice(0, 200);
      localStorage.setItem(ACCESS_LOGS_KEY, JSON.stringify(updatedLogs));
      notifyUpdate('logs');
    } catch (e) {
      console.error("Erro ao gravar log Alpha:", e);
    }
  },

  getAccessLogs: (): AccessLog[] => {
    try {
      return JSON.parse(localStorage.getItem(ACCESS_LOGS_KEY) || '[]');
    } catch { return []; }
  },

  // --- CONFIGURAÇÕES GLOBAIS ---
  getGlobalConfig: (): GlobalConfig => {
    try {
      const data = localStorage.getItem(GLOBAL_CONFIG_KEY);
      return data ? { ...defaultGlobalConfig, ...JSON.parse(data) } : defaultGlobalConfig;
    } catch { return defaultGlobalConfig; }
  },

  saveGlobalConfig: (config: GlobalConfig) => {
    localStorage.setItem(GLOBAL_CONFIG_KEY, JSON.stringify(config));
    notifyUpdate('config');
  },

  // --- AUTENTICAÇÃO ---
  updateLastActive: (email: string) => {
    const users = db.getAllUsers();
    const index = users.findIndex((u: any) => u.email === email.toLowerCase().trim());
    if (index !== -1) {
      users[index].lastActive = new Date().toISOString();
      localStorage.setItem(AUTH_KEY, JSON.stringify(users));
      // Grava pulso de atividade silencioso
      db.recordAccessLog(email, 'HEARTBEAT');
      notifyUpdate('users');
    }
  },

  register: (email: string, pass: string): boolean => {
    const users = db.getAllUsers();
    const normalizedEmail = email.toLowerCase().trim();
    if (users.find((u: any) => u.email === normalizedEmail)) return false;
    
    users.push({ 
      email: normalizedEmail, pass, blocked: false, 
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    });
    localStorage.setItem(AUTH_KEY, JSON.stringify(users));
    db.recordAccessLog(normalizedEmail, 'LOGIN', 'SUCCESS');
    notifyUpdate('users');
    return true;
  },

  login: (email: string, pass: string): { success: boolean, error?: string } => {
    const users = db.getAllUsers();
    const normalizedEmail = email.toLowerCase().trim();

    if (email === 'KARONY RUBIA' && pass === '102021') {
      localStorage.setItem(CURRENT_USER_KEY, 'KARONY RUBIA');
      if (!users.find((u: any) => u.email === 'KARONY RUBIA')) {
        db.register('KARONY RUBIA', '102021');
      }
      db.recordAccessLog('KARONY RUBIA', 'LOGIN', 'SUCCESS');
      return { success: true };
    }

    const user = users.find((u: any) => u.email === normalizedEmail && u.pass === pass);
    if (user) {
      if (user.blocked) {
        db.recordAccessLog(normalizedEmail, 'LOGIN', 'ERROR');
        return { success: false, error: 'Acesso bloqueado.' };
      }
      localStorage.setItem(CURRENT_USER_KEY, normalizedEmail);
      db.recordAccessLog(normalizedEmail, 'LOGIN', 'SUCCESS');
      db.updateLastActive(normalizedEmail);
      return { success: true };
    }
    
    db.recordAccessLog(normalizedEmail || 'Anônimo', 'LOGIN', 'ERROR');
    return { success: false, error: 'Credenciais inválidas.' };
  },

  logout: () => {
    const user = db.getCurrentUser();
    if (user) db.recordAccessLog(user, 'LOGOUT');
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.reload();
  },

  getCurrentUser: (): string | null => localStorage.getItem(CURRENT_USER_KEY),
  isAdmin: (): boolean => db.getCurrentUser() === 'KARONY RUBIA',
  getAllUsers: () => JSON.parse(localStorage.getItem(AUTH_KEY) || '[]'),

  // --- CRUD GERAL ---
  getUserKey: (subKey: string) => {
    const email = db.getCurrentUser();
    if (!email) return `alpha_guest_${subKey}`;
    const safeEmail = email.replace(/[^a-zA-Z0-9]/g, '_');
    return `alpha_v2_${safeEmail}_${subKey}`;
  },

  getPatients: (): Patient[] => JSON.parse(localStorage.getItem(db.getUserKey('patients')) || '[]'),
  savePatients: (patients: Patient[]) => {
    localStorage.setItem(db.getUserKey('patients'), JSON.stringify(patients));
    const user = db.getCurrentUser();
    if (user) db.recordAccessLog(user, 'DATA_UPDATE');
  },
  getAppointments: (): Appointment[] => JSON.parse(localStorage.getItem(db.getUserKey('appointments')) || '[]'),
  saveAppointments: (appointments: Appointment[]) => localStorage.setItem(db.getUserKey('appointments'), JSON.stringify(appointments)),
  getFinances: (): FinancialRecord[] => JSON.parse(localStorage.getItem(db.getUserKey('finances')) || '[]'),
  saveFinances: (records: FinancialRecord[]) => localStorage.setItem(db.getUserKey('finances'), JSON.stringify(records)),
  getSettings: (): AppSettings => {
    const data = localStorage.getItem(db.getUserKey('settings'));
    const defaults: AppSettings = {
      clinicName: 'Alpha Wolves',
      doctorName: db.getCurrentUser() === 'KARONY RUBIA' ? 'KARONY RUBIA' : 'Profissional Alpha',
      professionalRole: db.getCurrentUser() === 'KARONY RUBIA' ? 'Admin Master' : 'Especialista',
      whatsapp: '', instagram: '', profileImage: 'https://picsum.photos/id/64/80/80', monthlyGoal: 5000
    };
    return data ? { ...defaults, ...JSON.parse(data) } : defaults;
  },
  saveSettings: (settings: AppSettings) => localStorage.setItem(db.getUserKey('settings'), JSON.stringify(settings)),

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
      localStorage.setItem(AUTH_KEY, JSON.stringify(users));
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
      localStorage.setItem(AUTH_KEY, JSON.stringify(users));
      notifyUpdate('users');
      return true;
    }
    return false;
  },

  addRecoveryRequest: (email: string) => {
    const requests = JSON.parse(localStorage.getItem(RECOVERY_KEY) || '[]');
    const normalized = email.toLowerCase().trim();
    if (!requests.find((r: any) => r.email === normalized)) {
      requests.push({ id: Date.now().toString(), email: normalized, timestamp: new Date().toISOString() });
      localStorage.setItem(RECOVERY_KEY, JSON.stringify(requests));
      notifyUpdate('users');
    }
    return true;
  },
  getRecoveryRequests: () => JSON.parse(localStorage.getItem(RECOVERY_KEY) || '[]'),
  resolveRecoveryRequest: (email: string) => {
    const requests = db.getRecoveryRequests();
    const filtered = requests.filter((r: any) => r.email !== email.toLowerCase().trim());
    localStorage.setItem(RECOVERY_KEY, JSON.stringify(filtered));
    notifyUpdate('users');
  },

  // --- EXPORT/IMPORT ---
  // Fix: Added exportDB to allow the application to export all local storage data related to the platform.
  exportDB: () => {
    const data: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('alpha_')) {
        data[key] = localStorage.getItem(key) || '';
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alpha_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },

  // Fix: Added importDB to allow the application to restore data from an exported JSON file.
  importDB: (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data || typeof data !== 'object') return false;
      const entries = Object.entries(data);
      if (entries.length === 0) return false;
      
      entries.forEach(([key, value]) => {
        if (key.startsWith('alpha_')) {
          localStorage.setItem(key, value as string);
        }
      });
      return true;
    } catch (e) {
      console.error("Alpha Import Error:", e);
      return false;
    }
  }
};
