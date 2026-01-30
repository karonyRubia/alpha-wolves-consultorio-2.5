
import React from 'react';
import { View, AppSettings } from '../types';
import { ICONS } from '../constants';
import { db } from '../db/storage';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  onViewChange: (view: View) => void;
  settings: AppSettings;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange, settings }) => {
  const isAdmin = db.isAdmin();

  const navItems = [
    { id: View.DASHBOARD, label: 'Início', desktopLabel: 'Visão Geral', icon: ICONS.Dashboard },
    { id: View.PATIENTS, label: 'Pacientes', desktopLabel: 'Pacientes', icon: ICONS.Patients },
    { id: View.PRONTUARIOS, label: 'Clínica', desktopLabel: 'Prontuários', icon: (className: string) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    { id: View.AGENDA, label: 'Agenda', desktopLabel: 'Agenda Médica', icon: ICONS.Agenda },
    { id: View.FINANCES, label: 'Caixa', desktopLabel: 'Financeiro', icon: ICONS.Finances },
    { id: View.SECRETARY, label: 'Rubia IA', desktopLabel: 'Rubia AI', icon: ICONS.Secretary },
    { id: View.GET_CODE, label: 'Código', desktopLabel: 'Obter Código', icon: (className: string) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg> },
  ];

  const StethoscopeLogo = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.5 3V6C7.5 8.48528 9.51472 10.5 12 10.5C14.4853 10.5 16.5 8.48528 16.5 6V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 10.5V14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 14.5C12 14.5 12 18 15 18H16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="18.5" cy="18" r="2.5" stroke="currentColor" strokeWidth="2"/>
      <circle cx="7.5" cy="3" r="1" fill="currentColor"/>
      <circle cx="16.5" cy="3" r="1" fill="currentColor"/>
    </svg>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 alpha-gradient text-white flex-col shrink-0 relative overflow-hidden shadow-2xl z-10">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-cyan-400 opacity-10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="p-6 flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center shrink-0 text-blue-900">
            <StethoscopeLogo className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <h1 className="font-black text-lg leading-tight truncate tracking-tight">Alpha Wolves</h1>
            <p className="text-[10px] uppercase tracking-widest text-cyan-200 font-bold">Consultório</p>
          </div>
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto relative z-10 custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group ${
                currentView === item.id
                  ? 'bg-white text-blue-900 font-bold shadow-lg shadow-blue-900/20'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className={`${currentView === item.id ? 'text-cyan-600' : 'text-blue-300 group-hover:text-white'}`}>
                {item.icon("w-5 h-5")}
              </div>
              <span className="tracking-tight text-sm">{item.desktopLabel}</span>
            </button>
          ))}
          
          <div className="pt-8 pb-2 px-2">
            <p className="text-[9px] uppercase tracking-[0.2em] text-blue-200/60 font-black">Sistema</p>
          </div>
          <div className="space-y-1">
            <button onClick={() => onViewChange(View.SETTINGS)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${currentView === View.SETTINGS ? 'bg-white text-blue-900' : 'text-blue-200 hover:text-white hover:bg-white/5'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
              <span className="text-sm">Ajustes</span>
            </button>
            {isAdmin && (
              <button onClick={() => onViewChange(View.ADMIN)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${currentView === View.ADMIN ? 'bg-cyan-500 text-white shadow-lg' : 'text-cyan-200 hover:text-white hover:bg-white/5'}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <span className="text-sm font-black uppercase tracking-widest text-[10px]">Master Console</span>
              </button>
            )}
          </div>
        </nav>

        <div className="p-4 border-t border-white/10 shrink-0 bg-black/10">
          <div className="flex items-center gap-3">
            <img src={settings.profileImage} className="rounded-xl w-10 h-10 object-cover border-2 border-white/20" alt="Perfil" />
            <div className="min-w-0">
              <p className="text-sm font-bold truncate text-white">{settings.doctorName}</p>
              <p className="text-[10px] text-blue-200 truncate uppercase tracking-wider">{isAdmin ? 'Master Admin' : 'Alpha Wolf'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative pb-24 md:pb-0 bg-slate-50/50">
        <header className="flex md:hidden h-16 bg-white border-b px-4 items-center justify-between shrink-0 shadow-sm z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md text-white">
              <StethoscopeLogo className="w-6 h-6" />
            </div>
            <h1 className="font-black text-slate-800 tracking-tight text-xs leading-tight">Alpha Wolves</h1>
          </div>
          <button onClick={() => onViewChange(View.SETTINGS)}>
            <img src={settings.profileImage} className="rounded-full w-9 h-9 border-2 border-slate-100 object-cover" alt="User" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto w-full h-full">
            {children}
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-xl border-t border-slate-200 flex items-center justify-around px-2 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.04)] overflow-x-auto">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex flex-col items-center justify-center min-w-[50px] gap-1 transition-all ${
                  isActive ? 'text-blue-900' : 'text-slate-400'
                }`}
              >
                <div className={`${isActive ? 'scale-110' : 'scale-100'} transition-transform`}>
                  {item.icon("w-6 h-6")}
                </div>
                <span className={`text-[8px] uppercase tracking-widest font-bold ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Admin Secret Footer Trigger - MADE MORE VISIBLE */}
        <footer className="h-10 bg-slate-100 border-t flex items-center justify-center px-4 no-print shrink-0">
           <button 
             onClick={() => onViewChange(View.ADMIN)}
             className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.4em] transition-all ${isAdmin ? 'text-cyan-600 animate-pulse' : 'text-slate-300 hover:text-blue-900'}`}
           >
             <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
             Painel Alpha Master • Acesso Exclusivo Creator
           </button>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
