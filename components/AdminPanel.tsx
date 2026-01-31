
import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../db/storage';
import { GlobalConfig, AccessLog } from '../types';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'monitor' | 'users' | 'global' | 'audit'>('monitor');
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig>(db.getGlobalConfig());
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  
  const [auditUser, setAuditUser] = useState<string | null>(null);
  const [auditData, setAuditData] = useState<{patients: any[], finances: any[]} | null>(null);

  const loadData = useCallback(() => {
    setUsers(db.getAllUsers());
    setRequests(db.getRecoveryRequests());
    setGlobalConfig(db.getGlobalConfig());
    setLogs(db.getAccessLogs());
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener('alpha_users_updated', loadData);
    window.addEventListener('alpha_logs_updated', loadData);
    window.addEventListener('storage', loadData);
    
    // Polling agressivo para o monitoramento parecer em tempo real
    const interval = setInterval(loadData, 3000);
    return () => {
      window.removeEventListener('alpha_users_updated', loadData);
      window.removeEventListener('alpha_logs_updated', loadData);
      window.removeEventListener('storage', loadData);
      clearInterval(interval);
    };
  }, [loadData]);

  const handleUpdatePassword = (email: string) => {
    if (!newPassword) return;
    if (db.updateUserPassword(email, newPassword)) {
      setStatusMsg(`Senha de ${email} alterada!`);
      setNewPassword(''); setEditingUser(null); loadData();
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  const handleToggleBlock = (email: string) => {
    if (email === 'KARONY RUBIA') return;
    if (db.toggleUserBlock(email)) {
      loadData();
      setStatusMsg(`Status de ${email} atualizado!`);
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  const handleSaveGlobal = () => {
    db.saveGlobalConfig(globalConfig);
    setStatusMsg('Configurações Globais Aplicadas!');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleAuditUser = (email: string) => {
    const data = db.getUserDataAudit(email);
    setAuditUser(email);
    setAuditData(data);
    setActiveTab('audit');
  };

  const formatTime = (iso?: string) => {
    if (!iso) return "";
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const isOnline = (lastActive?: string) => {
    if (!lastActive) return false;
    const diff = Date.now() - new Date(lastActive).getTime();
    return diff < 60000; // 1 minuto
  };

  if (!db.isAdmin()) return (
    <div className="h-full flex items-center justify-center p-12">
      <div className="bg-rose-50 p-8 rounded-3xl border border-rose-100 text-center">
        <p className="text-rose-600 font-black uppercase tracking-widest">Acesso Restrito</p>
        <p className="text-xs text-rose-400 mt-2">Área exclusiva da Karony Rubia.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-800">
        {/* Top Header Section */}
        <div className="p-8 md:p-12 bg-gradient-to-br from-slate-800 to-slate-900 text-white flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-[2.5rem] bg-cyan-600 flex items-center justify-center shadow-2xl shadow-cyan-900/40 relative">
               <span className="absolute inset-0 rounded-[2.5rem] bg-cyan-400 animate-ping opacity-20"></span>
               <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-black tracking-tighter text-white">Alpha Command</h2>
              <div className="flex items-center gap-2 mt-1 justify-center md:justify-start">
                <p className="text-cyan-400 font-black uppercase tracking-widest text-[10px]">Security Monitor Online • v3.2</p>
              </div>
            </div>
          </div>
          
          <div className="flex bg-slate-800/80 p-1.5 rounded-3xl border border-slate-700 shadow-inner">
            {[
              { id: 'monitor', label: 'Radar 📡', color: 'cyan' },
              { id: 'users', label: 'Gestão 👥', color: 'indigo' },
              { id: 'global', label: 'Sistema ⚙️', color: 'emerald' },
              { id: 'audit', label: 'Dados 📁', color: 'amber' }
            ].map((tab) => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id as any)} 
                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8 md:p-12 min-h-[600px] bg-slate-900/50">
          {statusMsg && (
            <div className="p-4 rounded-2xl text-xs font-bold text-center mb-8 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 animate-in slide-in-from-top">
              {statusMsg}
            </div>
          )}

          {/* ABA MONITOR: O RADAR EM TEMPO REAL */}
          {activeTab === 'monitor' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
               {/* Lado Esquerdo: Lista de Profissionais Ativos */}
               <div className="lg:col-span-1 space-y-6">
                  <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-4 flex items-center justify-between">
                    Radar de Profissionais
                    <span className="bg-cyan-600 text-white px-2 py-0.5 rounded-full text-[8px] animate-pulse">LIVE</span>
                  </h4>
                  <div className="space-y-3">
                     {users.map(u => (
                       <div key={u.email} className={`bg-slate-800/40 p-4 rounded-3xl border ${isOnline(u.lastActive) ? 'border-cyan-500/30' : 'border-slate-800'} transition-all`}>
                          <div className="flex items-center gap-4">
                             <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm relative ${isOnline(u.lastActive) ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-500'}`}>
                                {isOnline(u.lastActive) && <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full border-2 border-slate-900 animate-pulse"></span>}
                                {u.email.charAt(0).toUpperCase()}
                             </div>
                             <div className="min-w-0 flex-1">
                                <p className="text-xs font-black text-white truncate">{u.email}</p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">
                                   {isOnline(u.lastActive) ? 'Ativo Agora' : `Último: ${new Date(u.lastActive).toLocaleDateString()}`}
                                </p>
                             </div>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>

               {/* Lado Direito: Terminal de Logs em Tempo Real */}
               <div className="lg:col-span-2 space-y-6">
                  <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-4">Log Global de Acessos e Dispositivos</h4>
                  <div className="bg-black/40 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                     <div className="bg-slate-800/80 px-6 py-4 flex items-center justify-between border-b border-slate-700">
                        <div className="flex gap-1.5">
                           <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                           <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                           <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                        </div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Alpha-Security-Log ~ inspection</p>
                     </div>
                     <div className="h-[500px] overflow-y-auto p-6 font-mono text-[11px] custom-scrollbar space-y-2">
                        {logs.map((log) => (
                          <div key={log.id} className="flex gap-4 border-b border-white/5 pb-2 animate-in slide-in-from-left duration-300">
                             <span className="text-slate-600 shrink-0">[{formatTime(log.timestamp)}]</span>
                             <span className={`font-black shrink-0 ${log.status === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {log.action.padEnd(10)}
                             </span>
                             <span className="text-cyan-400 shrink-0 truncate max-w-[120px]">{log.email}</span>
                             <span className="text-slate-500 hidden md:inline shrink-0">DEVICE: {log.device}</span>
                             <span className={`ml-auto px-2 py-0.5 rounded text-[8px] font-black uppercase ${log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                {log.status}
                             </span>
                          </div>
                        ))}
                        {logs.length === 0 && (
                          <div className="text-slate-700 py-10 text-center uppercase tracking-widest">Aguardando novos eventos...</div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* ABA GESTÃO: LISTA COMPLETA */}
          {activeTab === 'users' && (
            <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                 <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Base de Profissionais Alpha</h4>
                 <input 
                  type="text" 
                  placeholder="Filtrar por e-mail..." 
                  className="bg-slate-800 border border-slate-700 rounded-2xl px-6 py-3 text-sm text-white outline-none w-full md:w-80 focus:ring-2 focus:ring-cyan-600 transition-all" 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                 />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.filter(u => u.email.includes(searchTerm)).map(user => (
                  <div key={user.email} className={`bg-slate-800/40 border ${user.blocked ? 'border-rose-500/30' : 'border-slate-800'} p-6 rounded-[2.5rem] flex flex-col justify-between gap-6 transition-all hover:bg-slate-800/60`}>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-base font-black text-white">{user.email}</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Criado em: {new Date(user.createdAt || '').toLocaleDateString()}</p>
                      </div>
                      {user.blocked && <span className="bg-rose-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase">Bloqueado</span>}
                    </div>

                    <div className="flex items-center justify-between">
                       <div className="flex flex-col">
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Senha Atual</p>
                          <p className="text-sm font-mono text-cyan-500">{user.pass}</p>
                       </div>
                       <div className="flex gap-2">
                          <button onClick={() => handleToggleBlock(user.email)} disabled={user.email === 'KARONY RUBIA'} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${user.blocked ? 'bg-emerald-600 text-white' : 'bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white'} disabled:opacity-10`}>
                             {user.blocked ? 'Desbloquear' : 'Suspender'}
                          </button>
                          <button onClick={() => setEditingUser(user.email)} className="bg-slate-700 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase">Editar</button>
                       </div>
                    </div>

                    {editingUser === user.email && (
                       <div className="pt-4 border-t border-slate-700 flex gap-2 animate-in zoom-in">
                          <input 
                            type="text" placeholder="Nova Senha" 
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 text-xs text-white" 
                            value={newPassword} onChange={e => setNewPassword(e.target.value)} 
                          />
                          <button onClick={() => handleUpdatePassword(user.email)} className="bg-cyan-600 text-white px-4 py-2 rounded-xl text-[9px] font-black">SALVAR</button>
                          <button onClick={() => setEditingUser(null)} className="text-slate-500 font-black text-[9px]">X</button>
                       </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABA SISTEMA: CONFIGS MASTER */}
          {activeTab === 'global' && (
            <div className="space-y-10 animate-in slide-in-from-right duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Aparência do Ecossistema</h4>
                    <div className="bg-slate-800/40 p-8 rounded-[3rem] border border-slate-800 space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase">Nome da Plataforma</label>
                           <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-white font-bold" value={globalConfig.appName} onChange={e => setGlobalConfig({...globalConfig, appName: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase">Cor Primária</label>
                              <input type="color" className="w-full h-12 bg-transparent border-none cursor-pointer" value={globalConfig.primaryColor} onChange={e => setGlobalConfig({...globalConfig, primaryColor: e.target.value})} />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase">Status Global</label>
                              <button onClick={() => setGlobalConfig({...globalConfig, maintenanceMode: !globalConfig.maintenanceMode})} className={`w-full h-12 rounded-2xl font-black text-[9px] uppercase transition-all ${globalConfig.maintenanceMode ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/40' : 'bg-slate-700 text-slate-400'}`}>
                                 {globalConfig.maintenanceMode ? 'Manutenção Ativa' : 'Sistema Normal'}
                              </button>
                           </div>
                        </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Inteligência Artificial & Comunicados</h4>
                    <div className="bg-slate-800/40 p-8 rounded-[3rem] border border-slate-800 space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase">Aviso Master em Topo</label>
                           <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-white" value={globalConfig.globalNotice} onChange={e => setGlobalConfig({...globalConfig, globalNotice: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase">Instrução Mestre Rubia IA</label>
                           <textarea className="w-full h-32 bg-slate-900 border border-slate-700 rounded-2xl p-4 text-[10px] text-slate-400 resize-none" value={globalConfig.rubiaBaseInstruction} onChange={e => setGlobalConfig({...globalConfig, rubiaBaseInstruction: e.target.value})} />
                        </div>
                    </div>
                  </div>
               </div>
               <div className="flex justify-center pt-6">
                  <button onClick={handleSaveGlobal} className="bg-cyan-600 text-white px-16 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-105 transition-all">Sincronizar Todas as Instâncias Alpha</button>
               </div>
            </div>
          )}

          {/* ABA AUDITORIA: DADOS DO PROFISSIONAL */}
          {activeTab === 'audit' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               {auditUser ? (
                 <div className="bg-slate-800/60 p-10 rounded-[3rem] border border-slate-800 shadow-2xl">
                    <div className="flex justify-between items-start mb-10">
                       <div>
                          <h3 className="text-3xl font-black text-white">Relatório Alpha Wolves</h3>
                          <p className="text-[10px] text-cyan-400 font-black uppercase tracking-widest mt-1">Auditando LocalStorage de: {auditUser}</p>
                       </div>
                       <button onClick={() => setAuditUser(null)} className="text-rose-500 font-black uppercase text-xs border border-rose-500/20 px-6 py-2 rounded-2xl hover:bg-rose-500 hover:text-white transition-all">Encerrar Auditoria</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-slate-800">
                          <h5 className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Base de Pacientes</h5>
                          <p className="text-5xl font-black text-white">{auditData?.patients.length}</p>
                          <div className="mt-6 space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                             {auditData?.patients.map((p: any) => <div key={p.id} className="text-[10px] text-slate-400 font-bold bg-slate-800 px-3 py-1.5 rounded-lg">{p.name}</div>)}
                          </div>
                       </div>
                       <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-slate-800">
                          <h5 className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Movimentação Financeira</h5>
                          <p className="text-5xl font-black text-white">{auditData?.finances.length}</p>
                          <div className="mt-6 space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                             {auditData?.finances.map((f: any) => <div key={f.id} className="text-[9px] text-slate-400 flex justify-between bg-slate-800 px-3 py-1.5 rounded-lg"><span>{f.description}</span> <span className="text-emerald-400 font-black">R$ {f.amount}</span></div>)}
                          </div>
                       </div>
                    </div>
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center text-slate-600 mb-6">
                       <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    </div>
                    <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Selecione um profissional na aba "Gestão" para auditar os dados locais.</p>
                 </div>
               )}
            </div>
          )}
        </div>

        <div className="p-10 bg-slate-800/80 border-t border-slate-800 flex justify-center">
           <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.6em]">Alpha Sentinell System • Karony Rubia Command Center</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
