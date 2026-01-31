
import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../db/storage';
import { GlobalConfig, AccessLog } from '../types';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'monitor' | 'users' | 'global' | 'audit'>('monitor');
  const [users, setUsers] = useState<any[]>([]);
  const [localLogs, setLocalLogs] = useState<AccessLog[]>([]);
  const [remoteLogs, setRemoteLogs] = useState<AccessLog[]>([]);
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig>(db.getGlobalConfig());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [auditUser, setAuditUser] = useState<string | null>(null);
  const [auditData, setAuditData] = useState<{patients: any[], finances: any[]} | null>(null);

  const loadData = useCallback(async () => {
    setUsers(db.getAllUsers());
    setGlobalConfig(db.getGlobalConfig());
    setLocalLogs(db.getAccessLogs());
    
    // Busca acessos de OUTROS aparelhos na nuvem
    setIsSyncing(true);
    const cloudLogs = await db.getRemoteLogs();
    setRemoteLogs(cloudLogs);
    setIsSyncing(false);
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Atualiza a cada 5 segundos
    return () => clearInterval(interval);
  }, [loadData]);

  const handleToggleBlock = (email: string) => {
    if (email === 'KARONY RUBIA') return;
    if (db.toggleUserBlock(email)) {
      loadData();
      setStatusMsg(`Acesso de ${email} alterado!`);
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  const handleAuditUser = (email: string) => {
    const data = db.getUserDataAudit(email);
    setAuditUser(email);
    setAuditData(data);
    setActiveTab('audit');
  };

  const formatTime = (iso?: string) => {
    if (!iso) return "--:--";
    return new Date(iso).toLocaleTimeString('pt-BR');
  };

  if (!db.isAdmin()) return (
    <div className="h-full flex items-center justify-center p-12">
      <div className="bg-rose-50 p-8 rounded-3xl border border-rose-100 text-center">
        <p className="text-rose-600 font-black uppercase tracking-widest">Acesso Negado</p>
        <p className="text-xs text-rose-400 mt-2">Área exclusiva da Karony Rubia.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-slate-950 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-800">
        {/* Header do Centro de Comando */}
        <div className="p-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-[2.5rem] bg-blue-600 flex items-center justify-center shadow-2xl relative">
               <span className="absolute inset-0 rounded-[2.5rem] bg-blue-400 animate-ping opacity-20"></span>
               <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </div>
            <div>
              <h2 className="text-4xl font-black tracking-tighter">Alpha Vision</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                <p className="text-blue-400 font-black uppercase tracking-widest text-[10px]">Monitoramento Global Ativo</p>
              </div>
            </div>
          </div>
          
          <div className="flex bg-slate-800/50 p-1.5 rounded-3xl border border-slate-700">
            {[
              { id: 'monitor', label: 'Global Radar 🌍' },
              { id: 'users', label: 'Profissionais 👥' },
              { id: 'global', label: 'Master Config ⚙️' }
            ].map((tab) => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id as any)} 
                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8 md:p-12 min-h-[600px] bg-slate-950/50">
          {statusMsg && (
            <div className="p-4 rounded-2xl text-xs font-bold text-center mb-8 bg-blue-500/10 border border-blue-500/20 text-blue-400">
              {statusMsg}
            </div>
          )}

          {/* ABA MONITOR: RADAR GLOBAL */}
          {activeTab === 'monitor' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* LADO A: REDE GLOBAL (OUTROS APARELHOS) */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-4">
                    <h4 className="text-[11px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                       Rede Global Alpha (Outros Dispositivos)
                    </h4>
                    {isSyncing && <span className="text-[8px] text-slate-500 uppercase font-black animate-bounce">Sincronizando...</span>}
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 rounded-[2.5rem] h-[500px] overflow-y-auto p-6 font-mono text-[10px] custom-scrollbar space-y-2">
                     {remoteLogs.length > 0 ? remoteLogs.map((log: any) => (
                        <div key={log.id} className="flex gap-4 border-b border-white/5 pb-2 hover:bg-white/5 transition-colors p-2 rounded-lg">
                           <span className="text-slate-600 shrink-0">[{formatTime(log.timestamp)}]</span>
                           <span className="text-blue-400 font-black uppercase shrink-0">{log.action}</span>
                           <span className="text-white shrink-0 truncate max-w-[100px]">{log.email}</span>
                           <span className="text-slate-500 truncate italic">{log.device}</span>
                           <span className="ml-auto bg-blue-500/10 text-blue-400 px-2 rounded-full text-[8px] font-black border border-blue-500/20">REMOTO</span>
                        </div>
                     )) : (
                        <div className="h-full flex items-center justify-center text-slate-700 uppercase tracking-widest text-center">
                           Aguardando tráfego de outros aparelhos...
                        </div>
                     )}
                  </div>
                </div>

                {/* LADO B: ACESSO LOCAL (ESTE APARELHO) */}
                <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-4">
                    Logs de Acesso Locais
                  </h4>
                  <div className="bg-black/40 border border-slate-800 rounded-[2.5rem] h-[500px] overflow-y-auto p-6 font-mono text-[10px] custom-scrollbar space-y-2">
                     {localLogs.map((log) => (
                        <div key={log.id} className="flex gap-4 border-b border-white/5 pb-2 p-2">
                           <span className="text-slate-700 shrink-0">[{formatTime(log.timestamp)}]</span>
                           <span className={`font-black uppercase shrink-0 ${log.status === 'SUCCESS' ? 'text-emerald-500' : 'text-rose-500'}`}>{log.action}</span>
                           <span className="text-slate-300 truncate max-w-[100px]">{log.email}</span>
                           <span className="text-slate-600 truncate italic">{log.device}</span>
                        </div>
                     ))}
                  </div>
                </div>
              </div>
              
              {/* STATUS DE CONEXÃO MASTER */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                   { label: 'Aparelhos Conectados', val: remoteLogs.length + 1, col: 'text-blue-500' },
                   { label: 'Eventos em Nuvem', val: remoteLogs.length, col: 'text-cyan-500' },
                   { label: 'Status do Relay', val: 'ONLINE', col: 'text-emerald-500' },
                   { label: 'Segurança Global', val: 'ALPHA-3', col: 'text-indigo-500' }
                ].map((s, i) => (
                  <div key={i} className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 text-center">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">{s.label}</p>
                    <p className={`text-2xl font-black ${s.col}`}>{s.val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABA GESTÃO: LISTA DE PROFISSIONAIS DETECTADOS */}
          {activeTab === 'users' && (
            <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                 <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Base de Profissionais Detectados</h4>
                 <input 
                  type="text" 
                  placeholder="Filtrar por e-mail..." 
                  className="bg-slate-900 border border-slate-800 rounded-2xl px-6 py-3 text-sm text-white outline-none w-full md:w-80 focus:ring-2 focus:ring-blue-600 transition-all" 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                 />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.filter(u => u.email.includes(searchTerm)).map(user => (
                  <div key={user.email} className={`bg-slate-900/40 border ${user.blocked ? 'border-rose-900/50' : 'border-slate-800'} p-8 rounded-[3rem] space-y-6 hover:bg-slate-900/60 transition-all`}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center font-black text-blue-500">
                          {user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-lg font-black text-white">{user.email}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Registrado em: {new Date(user.createdAt || '').toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleAuditUser(user.email)} className="bg-slate-800 text-white p-2.5 rounded-xl hover:bg-blue-600 transition-all" title="Auditar Dados">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </button>
                        <button onClick={() => handleToggleBlock(user.email)} disabled={user.email === 'KARONY RUBIA'} className={`p-2.5 rounded-xl transition-all ${user.blocked ? 'bg-emerald-600 text-white' : 'bg-rose-900/30 text-rose-500 hover:bg-rose-600 hover:text-white'}`}>
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-black/20 p-4 rounded-2xl">
                          <p className="text-[9px] text-slate-500 font-black uppercase mb-1">Última Atividade</p>
                          <p className="text-xs font-bold text-white">{formatTime(user.lastActive)}</p>
                       </div>
                       <div className="bg-black/20 p-4 rounded-2xl">
                          <p className="text-[9px] text-slate-500 font-black uppercase mb-1">Senha do Profissional</p>
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
            <div className="max-w-2xl mx-auto space-y-8 animate-in zoom-in duration-500">
               <div className="bg-slate-900/80 p-10 rounded-[3rem] border border-slate-800 space-y-8">
                  <h4 className="text-center text-sm font-black text-white uppercase tracking-[0.3em]">Configurações de Identidade Global</h4>
                  
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nome do Ecossistema</label>
                        <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-bold" value={globalConfig.appName} onChange={e => setGlobalConfig({...globalConfig, appName: e.target.value})} />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Cor Master</label>
                           <input type="color" className="w-full h-14 bg-transparent border-none cursor-pointer" value={globalConfig.primaryColor} onChange={e => setGlobalConfig({...globalConfig, primaryColor: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Status do Servidor</label>
                           <button onClick={() => setGlobalConfig({...globalConfig, maintenanceMode: !globalConfig.maintenanceMode})} className={`w-full h-14 rounded-2xl font-black text-[10px] uppercase transition-all ${globalConfig.maintenanceMode ? 'bg-rose-600 text-white' : 'bg-emerald-600/10 text-emerald-500 border border-emerald-500/20'}`}>
                              {globalConfig.maintenanceMode ? 'MANUTENÇÃO ATIVA' : 'SISTEMA ONLINE'}
                           </button>
                        </div>
                     </div>
                  </div>

                  <button onClick={() => { db.saveGlobalConfig(globalConfig); setStatusMsg('Configurações Globais Sincronizadas!'); }} className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-105 transition-all">Sincronizar Todos os Aparelhos</button>
               </div>
            </div>
          )}
        </div>

        <div className="p-10 bg-slate-900 border-t border-slate-800 flex justify-center">
           <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.6em]">Alpha Command Center • Karony Rubia Enterprise</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
