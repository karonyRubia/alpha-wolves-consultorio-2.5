
import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../db/storage';
import { GlobalConfig, AccessLog } from '../types';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'radar' | 'users' | 'global'>('radar');
  const [users, setUsers] = useState<any[]>([]);
  const [nationalLogs, setNationalLogs] = useState<AccessLog[]>([]);
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig>(db.getGlobalConfig());
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const loadData = useCallback(async () => {
    setIsSyncing(true);
    setUsers(db.getAllUsers());
    setGlobalConfig(db.getGlobalConfig());
    
    // Busca os acessos de TODOS os aparelhos do país na nuvem
    const logs = await db.getGlobalNationalLogs();
    setNationalLogs(logs);
    setIsSyncing(false);
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000); // Polling a cada 8 segundos
    return () => clearInterval(interval);
  }, [loadData]);

  const handleToggleBlock = (email: string) => {
    if (email === 'KARONY RUBIA') return;
    if (db.toggleUserBlock(email)) {
      loadData();
      setStatusMsg(`Status de ${email} atualizado.`);
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  const formatTime = (iso?: string) => {
    if (!iso) return "--:--";
    return new Date(iso).toLocaleTimeString('pt-BR');
  };

  if (!db.isAdmin()) return (
    <div className="h-full flex items-center justify-center p-12">
      <div className="bg-rose-50 p-10 rounded-[3rem] border border-rose-100 text-center shadow-2xl">
        <p className="text-rose-600 font-black uppercase tracking-[0.3em] text-xs">Área Restrita: Karony Rubia</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-24">
      <div className="bg-slate-950 rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-800">
        
        {/* Header de Comando Master */}
        <div className="p-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white flex flex-col lg:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-[2.5rem] bg-blue-600 flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.3)] relative group">
               <span className="absolute inset-0 rounded-[2.5rem] bg-blue-400 animate-ping opacity-20 group-hover:opacity-40 transition-opacity"></span>
               <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </div>
            <div>
              <h2 className="text-4xl font-black tracking-tighter">Alpha Vision Master</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className={`w-3 h-3 rounded-full ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}></span>
                <p className="text-blue-400 font-black uppercase tracking-[0.2em] text-[10px]">
                  {isSyncing ? 'Sincronizando Nuvem Nacional...' : 'Monitorando Todos os Servidores'}
                </p>
              </div>
            </div>
          </div>
          
          <nav className="flex bg-slate-800/40 p-2 rounded-[2rem] border border-white/5 backdrop-blur-md">
            {[
              { id: 'radar', label: 'Radar Global 🛰️' },
              { id: 'users', label: 'Profissionais 👥' },
              { id: 'global', label: 'Master Config ⚙️' }
            ].map((tab) => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id as any)} 
                className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-8 lg:p-14 min-h-[600px] bg-black/20">
          {statusMsg && (
            <div className="p-4 rounded-2xl text-[10px] font-black text-center mb-8 bg-blue-500/10 border border-blue-500/20 text-blue-400 uppercase tracking-widest">
              {statusMsg}
            </div>
          )}

          {/* ABA RADAR: VISUALIZAÇÃO DE ACESSOS EXTERNOS */}
          {activeTab === 'radar' && (
            <div className="space-y-10">
              <div className="flex justify-between items-end px-4">
                <div>
                   <h3 className="text-2xl font-black text-white tracking-tight">Atividade em Tempo Real</h3>
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Detectando acessos de outros aparelhos e cidades</p>
                </div>
                <div className="text-right">
                   <p className="text-3xl font-black text-blue-500">{nationalLogs.length}</p>
                   <p className="text-[9px] text-slate-600 font-black uppercase">Eventos Detectados</p>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-white/5 rounded-[3rem] overflow-hidden shadow-inner">
                 <div className="max-h-[500px] overflow-y-auto custom-scrollbar font-mono text-[11px]">
                    <table className="w-full text-left">
                       <thead className="bg-white/5 text-slate-500 uppercase font-black tracking-widest border-b border-white/5 sticky top-0 backdrop-blur-lg">
                          <tr>
                             <th className="px-8 py-6">Horário</th>
                             <th className="px-8 py-6">Profissional / E-mail</th>
                             <th className="px-8 py-6">Ação</th>
                             <th className="px-8 py-6">Aparelho / Local</th>
                             <th className="px-8 py-6 text-right">Status</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {nationalLogs.length > 0 ? nationalLogs.map((log: any) => (
                             <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-8 py-5 text-slate-500">[{formatTime(log.timestamp)}]</td>
                                <td className="px-8 py-5">
                                   <div className="flex items-center gap-3">
                                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                      <p className="text-white font-bold">{log.email}</p>
                                   </div>
                                </td>
                                <td className="px-8 py-5 font-black uppercase tracking-tighter text-blue-400">{log.action}</td>
                                <td className="px-8 py-5 text-slate-400 italic">
                                   {log.device} <span className="text-slate-700 ml-2">• Global Network</span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                   <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[9px] font-black border border-blue-500/20">REMOTO</span>
                                </td>
                             </tr>
                          )) : (
                             <tr>
                                <td colSpan={5} className="px-8 py-32 text-center">
                                   <div className="flex flex-col items-center gap-4">
                                      <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center animate-pulse">
                                         <svg className="w-8 h-8 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 117.778 0M12 20h.01m-7.08-7.071a9.05 9.05 0 0112.728 0m.354-5.657a12.1 12.1 0 0116.97 0" /></svg>
                                      </div>
                                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Escaneando rede nacional em busca de acessos...</p>
                                   </div>
                                </td>
                             </tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                   { label: 'Servidor Master', val: 'ATIVO', col: 'text-emerald-500' },
                   { label: 'Criptografia', val: 'AES-256', col: 'text-blue-500' },
                   { label: 'Conexões Externas', val: nationalLogs.filter(l => l.action === 'LOGIN').length, col: 'text-amber-500' },
                   { label: 'Protocolo Alpha', val: 'v3.5', col: 'text-indigo-500' }
                ].map((s, i) => (
                  <div key={i} className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/5 text-center">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">{s.label}</p>
                    <p className={`text-2xl font-black ${s.col}`}>{s.val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABA GESTÃO: LISTA DE PROFISSIONAIS */}
          {activeTab === 'users' && (
            <div className="space-y-10">
               <h3 className="text-2xl font-black text-white px-4">Base de Usuários Alpha</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {users.map(user => (
                     <div key={user.email} className={`bg-slate-900/40 p-10 rounded-[3.5rem] border ${user.blocked ? 'border-rose-900/50 opacity-70' : 'border-white/5'} transition-all hover:bg-slate-900/60`}>
                        <div className="flex justify-between items-start mb-8">
                           <div className="flex items-center gap-5">
                              <div className="w-16 h-16 rounded-[1.5rem] bg-slate-800 flex items-center justify-center text-2xl font-black text-blue-500 border border-white/10">
                                 {user.email.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                 <p className="text-xl font-black text-white">{user.email}</p>
                                 <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">Membro desde {new Date(user.createdAt).toLocaleDateString()}</p>
                              </div>
                           </div>
                           <button onClick={() => handleToggleBlock(user.email)} className={`p-4 rounded-2xl transition-all ${user.blocked ? 'bg-emerald-600 text-white' : 'bg-rose-600/20 text-rose-500 hover:bg-rose-600 hover:text-white'}`}>
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                           </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                              <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Última Presença</p>
                              <p className="text-xs font-bold text-white">{formatTime(user.lastActive)}</p>
                           </div>
                           <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                              <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Credencial Alpha</p>
                              <p className="text-xs font-mono text-blue-400">{user.pass}</p>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
          )}

          {/* ABA CONFIG GERAL */}
          {activeTab === 'global' && (
            <div className="max-w-2xl mx-auto py-10">
               <div className="bg-slate-900/80 p-12 rounded-[4rem] border border-white/5 space-y-10 shadow-2xl">
                  <div className="text-center space-y-2">
                     <h4 className="text-lg font-black text-white uppercase tracking-[0.4em]">Master Control</h4>
                     <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Ajuste o ecossistema Alpha globalmente</p>
                  </div>
                  
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Nome da Plataforma</label>
                        <input type="text" className="w-full bg-black/40 border border-white/5 rounded-3xl p-6 text-white font-bold outline-none focus:border-blue-500 transition-all" value={globalConfig.appName} onChange={e => setGlobalConfig({...globalConfig, appName: e.target.value})} />
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Cor Principal</label>
                           <div className="flex items-center gap-4 bg-black/40 p-4 rounded-3xl border border-white/5">
                              <input type="color" className="w-12 h-12 bg-transparent border-none cursor-pointer" value={globalConfig.primaryColor} onChange={e => setGlobalConfig({...globalConfig, primaryColor: e.target.value})} />
                              <p className="text-xs font-mono text-slate-400 uppercase">{globalConfig.primaryColor}</p>
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Manutenção Master</label>
                           <button onClick={() => setGlobalConfig({...globalConfig, maintenanceMode: !globalConfig.maintenanceMode})} className={`w-full h-20 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all ${globalConfig.maintenanceMode ? 'bg-rose-600 text-white shadow-[0_0_30px_rgba(225,29,72,0.4)]' : 'bg-emerald-600/10 text-emerald-500 border border-emerald-500/30'}`}>
                              {globalConfig.maintenanceMode ? 'MODO BLOQUEIO ATIVO' : 'SISTEMA LIBERADO'}
                           </button>
                        </div>
                     </div>
                  </div>

                  <button onClick={() => { db.saveGlobalConfig(globalConfig); setStatusMsg('Ecossistema Sincronizado com a Nuvem Master!'); }} className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:scale-[1.03] active:scale-[0.97] transition-all">
                    Propagar Alterações Nacionais
                  </button>
               </div>
            </div>
          )}
        </div>

        <div className="p-10 bg-slate-900/50 border-t border-white/5 text-center">
           <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.8em]">Alpha Wolves Global Security System • Karony Rubia Intelligence</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
