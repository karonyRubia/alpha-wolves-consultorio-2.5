
import React from 'react';
import { View, AppSettings, GlobalConfig } from '../types';
import { ICONS } from '../constants';
import { db } from '../db/storage';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  onViewChange: (view: View) => void;
  settings: AppSettings;
  globalConfig: GlobalConfig;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange, settings, globalConfig }) => {
  const isAdmin = db.isAdmin();

  const navItems = [
    { id: View.DASHBOARD, label: 'Início', desktopLabel: 'Visão Geral', icon: ICONS.Dashboard },
    { id: View.PATIENTS, label: 'Pacientes', desktopLabel: 'Pacientes', icon: ICONS.Patients },
    { id: View.PRONTUARIOS, label: 'Clínica', desktopLabel: 'Prontuários', icon: ICONS.RubIALogo }, 
    { id: View.AGENDA, label: 'Agenda', desktopLabel: 'Agenda Médica', icon: ICONS.Agenda },
    { id: View.FINANCES, label: 'Caixa', desktopLabel: 'Financeiro', icon: ICONS.Finances },
    { id: View.SECRETARY, label: 'Rubia IA', desktopLabel: 'Rubia AI', icon: ICONS.Secretary },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-slate-50">
      <style>{`
        .alpha-gradient { background: linear-gradient(135deg, ${globalConfig.primaryColor} 0%, ${globalConfig.accentColor} 100%) !important; }
        .text-cyan-400 { color: ${globalConfig.primaryColor} !important; }
        .bg-cyan-600 { background-color: ${globalConfig.primaryColor} !important; }
        .shadow-cyan-900\\/40 { box-shadow: 0 20px 25px -5px ${globalConfig.primaryColor}66 !important; }
      `}</style>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 alpha-gradient text-white flex-col shrink-0 relative overflow-hidden shadow-2xl z-10 transition-all duration-700">
        <div className="p-8 flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 bg-white rounded-3xl shadow-2xl flex items-center justify-center shrink-0 p-2 logo-container">
            {ICONS.RubIALogo("w-full h-full")}
          </div>
          <div className="min-w-0">
            <h1 className="font-black text-xl leading-tight truncate tracking-tighter uppercase">{globalConfig.appName}</h1>
            <p className="text-[9px] uppercase tracking-widest text-rose-200 font-black truncate">{globalConfig.appSlogan}</p>
          </div>
        </div>

        <nav className="flex-1 mt-4 px-4 space-y-2 overflow-y-auto relative z-10 custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.8rem] transition-all group ${
                currentView === item.id
                  ? 'bg-white text-slate-900 font-black shadow-2xl'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className={`${currentView === item.id ? 'text-rose-600' : 'text-white/40 group-hover:text-white'}`}>
                {item.icon("w-6 h-6")}
              </div>
              <span className="tracking-tight text-sm font-bold uppercase">{item.desktopLabel}</span>
            </button>
          ))}
          
          <div className="pt-8 pb-2 px-4">
            <p className="text-[9px] uppercase tracking-[0.3em] text-rose-300/40 font-black">Central de Controle</p>
          </div>
          <div className="space-y-1">
            <button onClick={() => onViewChange(View.SETTINGS)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.8rem] transition-all ${currentView === View.SETTINGS ? 'bg-white text-slate-900' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066" /></svg>
              <span className="text-sm font-bold uppercase">Configurações</span>
            </button>
            {isAdmin && (
              <button onClick={() => onViewChange(View.ADMIN)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.8rem] transition-all ${currentView === View.ADMIN ? 'bg-white text-slate-900 shadow-xl' : 'text-white/60 border border-white/20 hover:bg-white/5'}`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <span className="text-xs font-black uppercase tracking-widest">Painel Master</span>
              </button>
            )}
          </div>
        </nav>

        <div className="p-6 border-t border-white/10 shrink-0 bg-black/20 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <img src={settings.profileImage} className="rounded-2xl w-12 h-12 object-cover border-2 border-white/30 shadow-lg" alt="Perfil" />
            <div className="min-w-0">
              <p className="text-sm font-black truncate text-white uppercase">{settings.doctorName}</p>
              <p className="text-[10px] text-rose-300/70 truncate uppercase font-bold tracking-wider">{isAdmin ? 'Proprietário Master' : 'Assinante'}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative pb-24 md:pb-0 bg-slate-50/50">
        <header className="flex md:hidden h-20 bg-white border-b px-6 items-center justify-between shrink-0 shadow-sm z-20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 alpha-gradient rounded-2xl flex items-center justify-center shadow-lg text-white p-2">
              {ICONS.RubIALogo("w-full h-full")}
            </div>
            <h1 className="font-black text-slate-900 tracking-tighter uppercase text-lg">{globalConfig.appName}</h1>
          </div>
          <button onClick={() => onViewChange(View.SETTINGS)}>
            <img src={settings.profileImage} className="rounded-2xl w-11 h-11 border-2 border-slate-100 object-cover shadow-sm" alt="User" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10">
          <div className="max-w-7xl mx-auto w-full h-full">{children}</div>
        </div>

        {/* Mobile Nav */}
        <nav className="md:hidden fixed bottom-4 left-4 right-4 h-16 bg-white/90 backdrop-blur-2xl border border-slate-200 rounded-[2rem] flex items-center justify-around px-2 z-50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button key={item.id} onClick={() => onViewChange(item.id)} className={`flex flex-col items-center justify-center min-w-[50px] gap-1 transition-all ${isActive ? 'scale-110' : 'opacity-40'}`}>
                <div className={isActive ? 'text-rose-600' : 'text-slate-400'}>
                  {item.icon("w-7 h-7")}
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Layout;
