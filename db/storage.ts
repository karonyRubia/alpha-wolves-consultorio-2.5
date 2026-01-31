
import { Patient, Appointment, FinancialRecord, AppSettings, GlobalConfig, AccessLog } from '../types';

const AUTH_KEY = 'alpha_auth_users';
const CURRENT_USER_KEY = 'alpha_current_session';
const RECOVERY_KEY = 'alpha_recovery_requests';
const GLOBAL_CONFIG_KEY = 'alpha_global_master_config';
const ACCESS_LOGS_KEY = 'alpha_global_logs';

// URL de Relay para sincronização entre diferentes aparelhos/redes
const CLOUD_RELAY_URL = 'https://api.restful-api.dev/objects'; 

const notifyUpdate = (type: 'users' | 'config' | 'data' | 'logs') => {
  window.dispatchEvent(new Event(`alpha_${type}_updated`));
  window.dispatchEvent(new Event('storage'));
};

const getDeviceDetails = () => {
  const ua = navigator.userAgent;
  let device = "Desktop";
  if (/Android/i.test(ua)) device = "Android";
  else if (/iPhone|iPad/i.test(ua)) device = "iOS";
  
  return {
    platform: device,
    browser: navigator.vendor || 'Navegador',
    resolution: `${window.screen.width}x${window.screen.height}`,
    location: "Brasil (Detectado via Rede)"
  };
};

export const db = {
  // --- SINCRONIZAÇÃO GLOBAL ALPHA (PARA KARONY RUBIA) ---
  
  broadcastToCloud: async (log: AccessLog) => {
    try {
      // Envia o log para a nuvem para que a Karony veja em qualquer lugar
      await fetch(CLOUD_RELAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `AlphaAccess_${log.email}_${Date.now()}`,
          data: {
            ...log,
            details: getDeviceDetails(),
            origin: window.location.href
          }
        })
      });
    } catch (e) {
      console.warn("Alpha Sync Offline");
    }
  },

  getGlobalNationalLogs: async (): Promise<AccessLog[]> => {
    try {
      const response = await fetch(CLOUD_RELAY_URL);
      const items = await response.json();
      // Filtra apenas dados do ecossistema Alpha Wolves
      return items
        .filter((item: any) => item.name && item.name.startsWith('AlphaAccess_'))
        .map((item: any) => ({
          ...item.data,
          id: item.id,
          isRemote: true
        }))
        .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch {
      return [];
    }
  },

  // --- REGISTRO DE LOGS ---
  recordAccessLog: (email: string, action: AccessLog['action'], status: AccessLog['status'] = 'SUCCESS') => {
    try {
      const details = getDeviceDetails();
      const newLog: AccessLog = {
        id: `log_${Date.now()}`,
        email: email.toLowerCase().trim(),
        timestamp: new Date().toISOString(),
        device: `${details.platform} - ${details.resolution}`,
        action,
        status
      };
      
      // Salva localmente
      const localLogs = JSON.parse(localStorage.getItem(ACCESS_LOGS_KEY) || '[]');
      localStorage.setItem(ACCESS_LOGS_KEY, JSON.stringify([newLog, ...localLogs].slice(0, 50)));
      
      // DISPARA PARA A NUVEM (Essencial para visibilidade em outros aparelhos)
      db.broadcastToCloud(newLog);
      
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

  // --- CONFIGURAÇÕES GLOBAIS ---
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
    
    // Notifica que um novo profissional se cadastrou (aparecerá no radar da Karony)
    db.recordAccessLog(normalizedEmail, 'DATA_UPDATE', 'SUCCESS');
    
    notifyUpdate('users');
    return true;
  },

  login: (email: string, pass: string): { success: boolean, error?: string } => {
    const normalizedEmail = email.toLowerCase().trim();

    // Senha Mestra da Karony
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
        return { success: false, error: 'Acesso bloqueado pelo administrador.' };
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

  exportDB: () => {
    const data: any = {};
    for (let i = 0; i < localStorage.length; i++){
      const k = localStorage.key(i);
      if(k && k.startsWith('alpha_')) data[k] = localStorage.getItem(k);
    }
    const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alpha_backup_${new Date().toLocaleDateString()}.json`;
    a.click();
  },

  importDB: (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      Object.keys(data).forEach(k => localStorage.setItem(k, data[k]));
      return true;
    } catch { return false; }
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

  getUserDataAudit: (email: string) => {
    const safe = email.replace(/[^a-z0-9]/gi, '_');
    return {
      patients: JSON.parse(localStorage.getItem(`alpha_v2_${safe}_patients`) || '[]'),
      finances: JSON.parse(localStorage.getItem(`alpha_v2_${safe}_finances`) || '[]')
    };
  }
};
