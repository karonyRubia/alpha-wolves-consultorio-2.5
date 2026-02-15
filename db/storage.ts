
import { Patient, Appointment, FinancialRecord, AppSettings, GlobalConfig, AccessLog } from '../types';

// Versão atual do esquema de dados
const DATA_VERSION = 'v3.5';
const AUTH_KEY = 'alpha_auth_users';
const CURRENT_USER_KEY = 'alpha_current_session';
const GLOBAL_CONFIG_KEY = 'alpha_global_master_config';
const ACCESS_LOGS_KEY = 'alpha_global_logs';

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
    location: "Brasil (Detecção Ativa)"
  };
};

export const db = {
  getStorageUsage: () => {
    let total = 0;
    for (let x in localStorage) {
      if (localStorage.hasOwnProperty(x)) {
        total += ((localStorage[x].length + x.length) * 2);
      }
    }
    return (total / 1024 / 1024).toFixed(2);
  },

  broadcastToCloud: async (log: AccessLog) => {
    try {
      await fetch(CLOUD_RELAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `AlphaAccess_${log.email.toLowerCase()}_${Date.now()}`,
          data: { ...log, details: getDeviceDetails(), origin: window.location.href }
        })
      });
    } catch (e) { console.warn("Cloud Relay Offline"); }
  },

  triggerGlobalLogout: async (email: string) => {
    try {
      await fetch(CLOUD_RELAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `AlphaKillSwitch_${email.toLowerCase().trim()}`,
          data: { action: 'FORCE_LOGOUT', timestamp: new Date().toISOString() }
        })
      });
    } catch (e) { console.error("Erro ao enviar KillSwitch"); }
  },

  isUserAllowedInCloud: async (email: string): Promise<boolean> => {
    const normalized = email.toLowerCase().trim();
    if (normalized === 'karony rubia') return true;
    try {
      const response = await fetch(CLOUD_RELAY_URL);
      if (!response.ok) return true;
      const items = await response.json();
      // Verifica se existe um comando de bloqueio explícito (KillSwitch)
      const hasKill = items.some((item: any) => item.name === `AlphaKillSwitch_${normalized}`);
      if (hasKill) return false;
      
      // Se houver controle de "Allowed" estrito na nuvem, checamos aqui.
      // Para o MVP Alpha, se não houver KillSwitch e o usuário existe localmente, permitimos o acesso.
      return true;
    } catch { 
      return true; // Falha na rede não bloqueia o médico
    }
  },

  addAllowedUserCloud: async (email: string) => {
    try {
      await fetch(CLOUD_RELAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `AlphaAllowed_${email.toLowerCase().trim()}`,
          data: { allowed: true, timestamp: new Date().toISOString() }
        })
      });
    } catch (e) { console.error("Erro ao autorizar na nuvem"); }
  },

  getGlobalNationalLogs: async (): Promise<AccessLog[]> => {
    try {
      const response = await fetch(CLOUD_RELAY_URL);
      if (!response.ok) return [];
      const items = await response.json();
      return items
        .filter((item: any) => item.name && item.name.startsWith('AlphaAccess_'))
        .map((item: any) => ({ ...item.data, id: item.id, isRemote: true }))
        .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch { return []; }
  },

  getGlobalConfig: (): GlobalConfig => {
    try {
      const data = localStorage.getItem(GLOBAL_CONFIG_KEY);
      return data ? JSON.parse(data) : {
        appName: 'RubIA',
        appSlogan: 'Gestão de Clinica & Prontuário Médico',
        primaryColor: '#be123c', // Rosa Rubi Profundo
        accentColor: '#881337', // Vinho
        appCoverImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=2070',
        globalNotice: '',
        rubiaBaseInstruction: 'Você é a Rubia, IA de Gestão Médica Avançada.',
        maintenanceMode: false
      };
    } catch {
      return { appName: 'RubIA', appSlogan: 'Gestão de Clinica & Prontuário Médico', primaryColor: '#be123c', accentColor: '#881337', appCoverImage: '', globalNotice: '', rubiaBaseInstruction: '', maintenanceMode: false };
    }
  },

  saveGlobalConfig: (config: GlobalConfig) => {
    localStorage.setItem(GLOBAL_CONFIG_KEY, JSON.stringify(config));
    notifyUpdate('config');
  },

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
      const localLogs = JSON.parse(localStorage.getItem(ACCESS_LOGS_KEY) || '[]');
      localStorage.setItem(ACCESS_LOGS_KEY, JSON.stringify([newLog, ...localLogs].slice(0, 50)));
      db.broadcastToCloud(newLog);
      notifyUpdate('logs');
    } catch (e) { console.error("Erro Log:", e); }
  },

  login: async (email: string, pass: string): Promise<{ success: boolean, error?: string }> => {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Login Admin Mestre
    if (normalizedEmail === 'karony rubia' && pass === '102021') {
      localStorage.setItem(CURRENT_USER_KEY, 'KARONY RUBIA');
      db.recordAccessLog('KARONY RUBIA', 'LOGIN', 'SUCCESS');
      return { success: true };
    }

    const users = db.getAllUsers();
    const user = users.find((u: any) => u.email.toLowerCase().trim() === normalizedEmail && u.pass === pass);
    
    if (!user) return { success: false, error: 'Identificador ou senha incorretos.' };
    if (user.blocked) return { success: false, error: 'ACESSO BLOQUEADO PELA ADMINISTRAÇÃO.' };
    
    const isAllowed = await db.isUserAllowedInCloud(normalizedEmail);
    if (!isAllowed) return { success: false, error: 'Acesso suspenso na nuvem.' };

    localStorage.setItem(CURRENT_USER_KEY, normalizedEmail);
    db.recordAccessLog(normalizedEmail, 'LOGIN', 'SUCCESS');
    return { success: true };
  },

  signup: async (email: string, pass: string): Promise<{ success: boolean, error?: string }> => {
    const normalizedEmail = email.toLowerCase().trim();
    if (!normalizedEmail || pass.length < 4) return { success: false, error: 'E-mail ou senha muito curtos.' };

    const users = db.getAllUsers();
    if (normalizedEmail === 'karony rubia' || users.find((u: any) => u.email.toLowerCase().trim() === normalizedEmail)) {
      return { success: false, error: 'Este identificador já está em uso.' };
    }

    const newUser = {
      email: normalizedEmail,
      pass,
      blocked: false,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem(AUTH_KEY, JSON.stringify(users));
    
    // Tenta autorizar na nuvem de forma assíncrona (não bloqueante)
    db.addAllowedUserCloud(normalizedEmail);
    
    notifyUpdate('users');
    return { success: true };
  },

  logout: () => {
    const user = db.getCurrentUser();
    if (user) db.recordAccessLog(user, 'LOGOUT');
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.reload();
  },

  getCurrentUser: (): string | null => {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? user.trim() : null;
  },

  isAdmin: (): boolean => {
    const user = db.getCurrentUser();
    return user === 'KARONY RUBIA';
  },

  getAllUsers: () => {
    try {
      const data = localStorage.getItem(AUTH_KEY);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },

  getUserKey: (subKey: string) => {
    const email = db.getCurrentUser();
    if (!email) return `guest_${DATA_VERSION}_${subKey}`;
    const safeEmail = email.toLowerCase().trim().replace(/[^a-z0-9]/gi, '_');
    return `rubia_${DATA_VERSION}_${safeEmail}_${subKey}`;
  },

  safeSetItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error("FALHA CRÍTICA DE GRAVAÇÃO:", e);
    }
  },

  getPatients: () => {
    try {
      const data = localStorage.getItem(db.getUserKey('patients'));
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },
  savePatients: (p: Patient[]) => db.safeSetItem(db.getUserKey('patients'), JSON.stringify(p)),
  
  getAppointments: () => {
    try {
      const data = localStorage.getItem(db.getUserKey('appointments'));
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },
  saveAppointments: (a: Appointment[]) => db.safeSetItem(db.getUserKey('appointments'), JSON.stringify(a)),
  
  getFinances: () => {
    try {
      const data = localStorage.getItem(db.getUserKey('finances'));
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },
  saveFinances: (f: FinancialRecord[]) => db.safeSetItem(db.getUserKey('finances'), JSON.stringify(f)),
  
  getSettings: () => {
    try {
      const data = localStorage.getItem(db.getUserKey('settings'));
      if (data) return JSON.parse(data);
      
      const user = db.getCurrentUser();
      return { 
        clinicName: 'Minha Clínica', 
        doctorName: db.isAdmin() ? 'KARONY RUBIA' : (user || 'Doutor(a)'), 
        professionalRole: 'Médico(a)', 
        profileImage: 'https://picsum.photos/id/64/80/80', 
        monthlyGoal: 10000 
      };
    } catch {
       return { clinicName: 'Minha Clínica', doctorName: 'Doutor(a)', professionalRole: 'Médico(a)', profileImage: '', monthlyGoal: 10000 };
    }
  },
  saveSettings: (s: AppSettings) => db.safeSetItem(db.getUserKey('settings'), JSON.stringify(s)),

  exportDB: () => {
    const data: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('rubia_') || key.includes('alpha_') || key.includes('guest_') || key === AUTH_KEY)) {
        data[key] = localStorage.getItem(key);
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `rubia_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click(); URL.revokeObjectURL(url);
    db.recordAccessLog(db.getCurrentUser() || 'SISTEMA', 'DATA_UPDATE', 'SUCCESS');
  },

  importDB: (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (typeof data !== 'object' || data === null) return false;
      Object.keys(data).forEach(key => { if (typeof data[key] === 'string') localStorage.setItem(key, data[key]); });
      return true;
    } catch (e) { return false; }
  },

  adminCreateUser: async (email: string, pass: string): Promise<boolean> => {
    const normalized = email.toLowerCase().trim();
    if (!normalized || pass.length < 4) return false;
    const users = db.getAllUsers();
    if (normalized === 'karony rubia' || users.find((u: any) => u.email.toLowerCase().trim() === normalized)) return false;

    const newUser = {
      email: normalized,
      pass,
      blocked: false,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem(AUTH_KEY, JSON.stringify(users));
    await db.addAllowedUserCloud(normalized);
    db.recordAccessLog('KARONY RUBIA', 'DATA_UPDATE', 'SUCCESS');
    notifyUpdate('users');
    return true;
  },

  toggleUserBlock: async (email: string) => {
    const users = db.getAllUsers();
    const userIndex = users.findIndex((u: any) => u.email.toLowerCase().trim() === email.toLowerCase().trim());
    if (userIndex > -1) {
      users[userIndex].blocked = !users[userIndex].blocked;
      localStorage.setItem(AUTH_KEY, JSON.stringify(users));
      notifyUpdate('users');
      db.recordAccessLog('KARONY RUBIA', 'DATA_UPDATE', 'SUCCESS');
    }
  },

  deleteUser: async (email: string) => {
    const users = db.getAllUsers();
    const filtered = users.filter((u: any) => u.email.toLowerCase().trim() !== email.toLowerCase().trim());
    localStorage.setItem(AUTH_KEY, JSON.stringify(filtered));
    notifyUpdate('users');
    db.recordAccessLog('KARONY RUBIA', 'DATA_UPDATE', 'SUCCESS');
  },

  triggerUniversalLogout: async () => {
    const users = db.getAllUsers();
    for (const user of users) {
      await db.triggerGlobalLogout(user.email);
    }
    db.recordAccessLog('KARONY RUBIA', 'DATA_UPDATE', 'SUCCESS');
  }
};
