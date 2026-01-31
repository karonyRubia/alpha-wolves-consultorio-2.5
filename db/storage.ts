
import { Patient, Appointment, FinancialRecord, AppSettings, GlobalConfig, AccessLog } from '../types';

const AUTH_KEY = 'alpha_auth_users';
const CURRENT_USER_KEY = 'alpha_current_session';
const RECOVERY_KEY = 'alpha_recovery_requests';
const GLOBAL_CONFIG_KEY = 'alpha_global_master_config';
const ACCESS_LOGS_KEY = 'alpha_global_logs';
const REMOTE_SYNC_URL = 'https://api.restful-api.dev/objects'; // Endpoint de demonstração para relay global

const notifyUpdate = (type: 'users' | 'config' | 'data' | 'logs') => {
  window.dispatchEvent(new Event(`alpha_${type}_updated`));
  window.dispatchEvent(new Event('storage'));
};

const getDeviceDetails = () => {
  const ua = navigator.userAgent;
  let device = "Desktop";
  if (/Android/i.test(ua)) device = "Android Device";
  else if (/iPhone|iPad/i.test(ua)) device = "iOS Device";
  
  return {
    platform: device,
    browser: navigator.vendor || 'Generic Browser',
    resolution: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language
  };
};

export const db = {
  // --- SINCRONIZAÇÃO EM NUVEM ALPHA (PARA VISIBILIDADE GLOBAL) ---
  syncToCloud: async (log: AccessLog) => {
    try {
      // Este método simula o envio do log para um servidor central que você controla
      // Permite que a Karony veja acessos de outros IPs e aparelhos
      await fetch(REMOTE_SYNC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `AlphaAccess_${log.email}`,
          data: {
            ...log,
            details: getDeviceDetails(),
            source: window.location.hostname
          }
        })
      });
    } catch (e) {
      console.warn("Alpha Cloud Sync: Modo offline ou firewall detectado.");
    }
  },

  getRemoteLogs: async (): Promise<AccessLog[]> => {
    try {
      const response = await fetch(REMOTE_SYNC_URL);
      const data = await response.json();
      // Filtra e formata os dados vindos da nuvem (outros aparelhos)
      return data
        .filter((obj: any) => obj.name?.startsWith('AlphaAccess_'))
        .map((obj: any) => ({
          ...obj.data,
          id: obj.id,
          isRemote: true
        }));
    } catch {
      return [];
    }
  },

  // --- REGISTRO DE LOGS ---
  recordAccessLog: (email: string, action: AccessLog['action'], status: AccessLog['status'] = 'SUCCESS') => {
    try {
      const logs: AccessLog[] = JSON.parse(localStorage.getItem(ACCESS_LOGS_KEY) || '[]');
      const details = getDeviceDetails();
      const newLog: AccessLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        email: email.toLowerCase().trim(),
        timestamp: new Date().toISOString(),
        device: `${details.platform} (${details.browser})`,
        action,
        status
      };
      
      const updatedLogs = [newLog, ...logs].slice(0, 100);
      localStorage.setItem(ACCESS_LOGS_KEY, JSON.stringify(updatedLogs));
      
      // DISPARA PARA A NUVEM PARA A KARONY VER EM OUTRO PC/CELULAR
      db.syncToCloud(newLog);
      
      notifyUpdate('logs');
    } catch (e) {
      console.error("Erro Alpha Log:", e);
    }
  },

  getAccessLogs: (): AccessLog[] => {
    try {
      return JSON.parse(localStorage.getItem(ACCESS_LOGS_KEY) || '[]');
    } catch { return []; }
  },

  // --- CONFIGURAÇÕES ---
  getGlobalConfig: (): GlobalConfig => {
    const data = localStorage.getItem(GLOBAL_CONFIG_KEY);
    return data ? JSON.parse(data) : {
      appName: 'Alpha Wolves',
      appSlogan: 'Consultório Digital de Elite',
      primaryColor: '#0e7490',
      accentColor: '#1e3a8a',
      globalNotice: '',
      rubiaBaseInstruction: 'Você é a Rubia, IA Alpha.',
      maintenanceMode: false
    };
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
    const normalizedEmail = email.toLowerCase().trim();

    if (email === 'KARONY RUBIA' && pass === '102021') {
      localStorage.setItem(CURRENT_USER_KEY, 'KARONY RUBIA');
      db.recordAccessLog('KARONY RUBIA', 'LOGIN', 'SUCCESS');
      return { success: true };
    }

    const users = db.getAllUsers();
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

  getUserKey: (subKey: string) => {
    const email = db.getCurrentUser();
    if (!email) return `guest_${subKey}`;
    return `alpha_v2_${email.replace(/[^a-z0-9]/gi, '_')}_${subKey}`;
  },

  getPatients: () => JSON.parse(localStorage.getItem(db.getUserKey('patients')) || '[]'),
  savePatients: (p: Patient[]) => {
    localStorage.setItem(db.getUserKey('patients'), JSON.stringify(p));
    const user = db.getCurrentUser();
    if (user) db.recordAccessLog(user, 'DATA_UPDATE');
  },
  
  getAppointments: () => JSON.parse(localStorage.getItem(db.getUserKey('appointments')) || '[]'),
  saveAppointments: (a: Appointment[]) => localStorage.setItem(db.getUserKey('appointments'), JSON.stringify(a)),
  
  getFinances: () => JSON.parse(localStorage.getItem(db.getUserKey('finances')) || '[]'),
  saveFinances: (f: FinancialRecord[]) => localStorage.setItem(db.getUserKey('finances'), JSON.stringify(f)),
  
  getSettings: () => {
    const data = localStorage.getItem(db.getUserKey('settings'));
    return data ? JSON.parse(data) : {
      clinicName: 'Alpha Wolves',
      doctorName: db.isAdmin() ? 'KARONY RUBIA' : 'Profissional Alpha',
      professionalRole: 'Especialista',
      profileImage: 'https://picsum.photos/id/64/80/80',
      monthlyGoal: 5000
    };
  },
  saveSettings: (s: AppSettings) => localStorage.setItem(db.getUserKey('settings'), JSON.stringify(s)),

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
    requests.push({ email, timestamp: new Date().toISOString() });
    localStorage.setItem(RECOVERY_KEY, JSON.stringify(requests));
    notifyUpdate('users');
  },

  getRecoveryRequests: () => JSON.parse(localStorage.getItem(RECOVERY_KEY) || '[]'),

  // Fix: Adding exportDB method to handle data backup for the settings view
  exportDB: () => {
    try {
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
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Alpha Export Error:", e);
    }
  },

  // Fix: Adding importDB method to restore data from backup for the settings view
  importDB: (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (typeof data !== 'object' || data === null) return false;
      const keys = Object.keys(data);
      if (keys.length === 0) return false;

      keys.forEach(key => {
        if (key.startsWith('alpha_')) {
          localStorage.setItem(key, data[key]);
        }
      });
      return true;
    } catch (e) {
      console.error("Alpha Import Error:", e);
      return false;
    }
  },

  getUserDataAudit: (email: string) => {
    const safe = email.replace(/[^a-z0-9]/gi, '_');
    return {
      patients: JSON.parse(localStorage.getItem(`alpha_v2_${safe}_patients`) || '[]'),
      finances: JSON.parse(localStorage.getItem(`alpha_v2_${safe}_finances`) || '[]')
    };
  }
};
