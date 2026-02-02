
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Patients from './components/Patients';
import MedicalRecords from './components/MedicalRecords';
import Secretary from './components/Secretary';
import MessageModal from './components/MessageModal';
import Agenda from './components/Agenda';
import Finances from './components/Finances';
import Settings from './components/Settings';
import Auth from './components/Auth';
import GetCode from './components/GetCode';
import AdminPanel from './components/AdminPanel';
import { View, Patient, Appointment, FinancialRecord, AppSettings, GlobalConfig } from './types';
import { db } from './db/storage';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!db.getCurrentUser());
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig>(db.getGlobalConfig());
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [finances, setFinances] = useState<FinancialRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(db.getSettings());
  const [messagingPatient, setMessagingPatient] = useState<Patient | null>(null);

  // 1. Monitoramento Global de Configurações
  useEffect(() => {
    const handleGlobalUpdate = () => {
      const config = db.getGlobalConfig();
      setGlobalConfig(config);
      document.documentElement.style.setProperty('--alpha-primary', config.primaryColor);
      document.documentElement.style.setProperty('--alpha-accent', config.accentColor);
    };
    handleGlobalUpdate();
    window.addEventListener('alpha_config_updated', handleGlobalUpdate);
    return () => window.removeEventListener('alpha_config_updated', handleGlobalUpdate);
  }, []);

  // 2. Carregamento Inicial dos Dados
  useEffect(() => {
    if (isLoggedIn) {
      setPatients(db.getPatients());
      setAppointments(db.getAppointments());
      setFinances(db.getFinances());
      setSettings(db.getSettings());
      setIsDataLoaded(true);
    }
  }, [isLoggedIn]);

  // 3. Salvamento Automático
  useEffect(() => { if (isLoggedIn && isDataLoaded) db.savePatients(patients); }, [patients, isLoggedIn, isDataLoaded]);
  useEffect(() => { if (isLoggedIn && isDataLoaded) db.saveAppointments(appointments); }, [appointments, isLoggedIn, isDataLoaded]);
  useEffect(() => { if (isLoggedIn && isDataLoaded) db.saveFinances(finances); }, [finances, isLoggedIn, isDataLoaded]);
  useEffect(() => { if (isLoggedIn && isDataLoaded) db.saveSettings(settings); }, [settings, isLoggedIn, isDataLoaded]);

  // 4. Registro de Atividade (Heartbeat Alpha)
  useEffect(() => {
    if (isLoggedIn) {
      const user = db.getCurrentUser();
      if (user) {
        db.updateLastActive(user); // Primeiro pulso imediato
        const interval = setInterval(() => db.updateLastActive(user), 240000); // A cada 4 min
        return () => clearInterval(interval);
      }
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) return <Auth onLoginSuccess={() => setIsLoggedIn(true)} />;

  const handleLogout = () => {
    if (window.confirm('Encerrar sessão Alpha?')) db.logout();
  };

  const renderContent = () => {
    const props = { patients, appointments, finances, settings };
    switch (currentView) {
      case View.DASHBOARD: return <Dashboard {...props} onUpdateSettings={setSettings} onUpdateAppointment={(a) => setAppointments(prev => prev.map(old => old.id === a.id ? a : old))} />;
      case View.PATIENTS: return <Patients patients={patients} onAdd={p => setPatients(prev => [...prev, {...p, id: `p_${Date.now()}`}])} onDelete={id => setPatients(prev => prev.filter(p => p.id !== id))} onUpdate={u => setPatients(prev => prev.map(p => p.id === u.id ? u : p))} onMessagePatient={setMessagingPatient} />;
      case View.PRONTUARIOS: return <MedicalRecords patients={patients} onUpdate={u => setPatients(prev => prev.map(p => p.id === u.id ? u : p))} onAdd={p => setPatients(prev => [...prev, {...p, id: `p_${Date.now()}`}])} />;
      case View.AGENDA: return <Agenda appointments={appointments} patients={patients} onAdd={a => setAppointments(prev => [...prev, {...a, id: `a_${Date.now()}`}])} onUpdate={u => setAppointments(prev => prev.map(a => a.id === u.id ? u : a))} onCancel={id => setAppointments(prev => prev.map(a => a.id === id ? {...a, status: 'CANCELLED'} : a))} />;
      case View.FINANCES: return <Finances records={finances} onAdd={f => setFinances(prev => [...prev, {...f, id: `f_${Date.now()}`}])} onUpdate={u => setFinances(prev => prev.map(f => f.id === u.id ? u : f))} onDelete={id => setFinances(prev => prev.filter(f => f.id !== id))} />;
      case View.SECRETARY: return <Secretary patients={patients} appointments={appointments} doctorName={settings.doctorName} />;
      case View.SETTINGS: return <Settings settings={settings} onUpdate={setSettings} onLogout={handleLogout} />;
      case View.ADMIN: return <AdminPanel />;
      case View.GET_CODE: return <GetCode />;
      default: return <Dashboard {...props} onUpdateSettings={setSettings} onUpdateAppointment={(a) => setAppointments(prev => prev.map(old => old.id === a.id ? a : old))} />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView} settings={settings} globalConfig={globalConfig}>
      {globalConfig.maintenanceMode && !db.isAdmin() && (
        <div className="fixed inset-0 z-[999] bg-slate-900 flex flex-col items-center justify-center text-white p-10 text-center">
           <div className="w-20 h-20 bg-rose-600 rounded-full flex items-center justify-center mb-6 animate-pulse shadow-[0_0_50px_rgba(225,29,72,0.4)]">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
           </div>
           <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">SISTEMA BLOQUEADO</h2>
           <p className="max-w-md text-slate-400 font-bold mb-8 uppercase text-[11px] tracking-widest leading-relaxed">A Administradora Karony Rubia ativou o modo de segurança. Todos os terminais foram desconectados para manutenção.</p>
           <button onClick={() => db.logout()} className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">Desconectar</button>
        </div>
      )}

      {globalConfig.globalNotice && (
        <div className="bg-amber-500 py-3 px-6 shadow-2xl relative z-50 overflow-hidden">
           <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
           <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 relative z-10">
              <span className="bg-white/20 px-2 py-1 rounded-md text-[9px] font-black text-white border border-white/20 uppercase">Aviso Master</span>
              <p className="text-[11px] font-black text-white uppercase tracking-[0.1em] text-center drop-shadow-md">
                {globalConfig.globalNotice}
              </p>
           </div>
        </div>
      )}

      <div className="h-full w-full">{renderContent()}</div>
      {messagingPatient && <MessageModal patient={messagingPatient} onClose={() => setMessagingPatient(null)} clinicName={settings.clinicName} />}
    </Layout>
  );
};

export default App;
