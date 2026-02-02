
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../db/storage';
import { GlobalConfig, AccessLog } from '../types';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'radar' | 'users' | 'global'>('radar');
  const [users, setUsers] = useState<any[]>([]);
  const [nationalLogs, setNationalLogs] = useState<AccessLog[]>([]);
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig>(db.getGlobalConfig());
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Estados para novo usuário
  const [newEmail, setNewEmail] = useState('');
  const [newPass, setNewPass] = useState('');

  const loadData = useCallback(async () => {
    setIsSyncing(true);
    setUsers(db.getAllUsers());
    setGlobalConfig(db.getGlobalConfig());
    const logs = await db.getGlobalNationalLogs();
    setNationalLogs(logs);
    setIsSyncing(false);
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Cálculo de usuários online (ativos nos últimos 10 minutos)
  const onlineUsers = useMemo(() => {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).getTime();
    const activeEmails = new Set<string>();
    
    nationalLogs.forEach(log => {
      if (new Date(log.timestamp).getTime() > tenMinutesAgo) {
        activeEmails.add(log.email.toLowerCase());
      }
    });
    
    return Array.from(activeEmails);
  }, [nationalLogs]);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (db.adminCreateUser(newEmail, newPass)) {
      setNewEmail('');
      setNewPass('');
      loadData();
      setStatusMsg(`Usuário ${newEmail} criado com sucesso!`);
      setTimeout(() => setStatusMsg(''), 4000);
    } else {
      alert('Erro: Este e-mail já está em uso.');
    }
  };

  const handleToggleBlock = (email: string) => {
    if (email === 'KARONY RUBIA') return;
    db.toggleUserBlock(email);
    loadData();
  };

  const handleDeleteUser = (email: string) => {
    if (email === 'KARONY RUBIA') return;
    if (window.confirm(`Excluir permanentemente o acesso de ${email}?`)) {
      db.deleteUser(email);
      loadData();
    }
  };

  const formatTime = (iso?: string) => iso ? new Date(iso).toLocaleTimeString('pt-BR') : "--:--";

  if (!db.isAdmin()) return (
    <div className="h-full flex items-center justify-center p-12">
      <div className="bg-rose-50 p-10 rounded-[3rem] border border-rose-100 text-center shadow-2xl animate-pulse">
        <p className="text-rose-600 font-black uppercase tracking-[0.3em] text-xs">Área Restrita: Karony Rubia</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 animate-in fade-in duration-700">
      <div className="bg-slate-950 rounded-[4rem] shadow-2xl overflow-hidden border border-slate-800">
        
        {/* COMANDO MASTER HEADER */}
        <div className="p-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white flex flex-col lg:flex-row justify-between items-center gap-10 border-b border-white/5">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 rounded-[2.8rem] bg-blue-600 flex items-center justify-center shadow-[0_0_60px_rgba(37,99,235,0.4)] relative">
               <span className="absolute inset-0 rounded-[2.8rem] bg-blue-400 animate-ping opacity-10"></span>
               <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </div>
            <div>
              <h2 className="text-4xl font-black tracking-tighter">Comando Master</h2>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <p className="text-blue-400 font-black uppercase tracking-[0.3em] text-[9px]">Proteção Alpha Wolves Ativa</p>
              </div>
            </div>
          </div>
          
          <nav className="flex bg-black/40 p-2 rounded-[2.2rem] border border-white/5 backdrop-blur-xl">
            {[
              { id: 'radar', label: 'Monitoramento 🛰️' },
              { id: 'users', label: 'Membros 👥' },
              { id: 'global', label: 'Master Control ⚙️' }
            ].map((tab) => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id as any)} 
                className={`px-8 py-5 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-2xl scale-105' : 'text-slate-500 hover:text-white'}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-10 lg:p-16 min-h-[600px]">
          {statusMsg && (
            <div className="p-5 rounded-3xl text-[10px] font-black text-center mb-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase tracking-widest animate-bounce">
              {statusMsg}
            </div>
          )}

          {/* ABA RADAR: VISUALIZAÇÃO DE ACESSOS EXTERNOS */}
          {activeTab === 'radar' && (
            <div className="space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                 {/* Widget Online */}
                 <div className="lg:col-span-1 bg-slate-900/60 p-8 rounded-[3rem] border border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Online Agora</h4>
                       <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                    </div>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                       {onlineUsers.length > 0 ? onlineUsers.map(email => (
                         <div key={email} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-[10px] font-black text-white">
                               {email.charAt(0).toUpperCase()}
                            </div>
                            <p className="text-[11px] font-bold text-white truncate">{email}</p>
                         </div>
                       )) : (
                         <p className="text-[10px] text-slate-600 font-bold text-center py-4 italic">Nenhum membro ativo</p>
                       )}
                    </div>
                    <div className="pt-4 border-t border-white/5">
                       <p className="text-[9px] font-black text-slate-500 uppercase text-center">Total Conectados: {onlineUsers.length}</p>
                    </div>
                 </div>

                 {/* Tabela de Logs */}
                 <div className="lg:col-span-3 space-y-6">
                    <div className="flex justify-between items-center px-4">
                       <h3 className="text-2xl font-black text-white tracking-tight uppercase">Radar de Segurança</h3>
                       <div className="bg-blue-600/10 px-6 py-3 rounded-2xl border border-blue-600/20 text-blue-400 font-black text-[9px] animate-pulse">
                          ESCANEANDO REDE ALPHA...
                       </div>
                    </div>

                    <div className="bg-slate-900/60 border border-white/5 rounded-[3.5rem] overflow-hidden">
                       <div className="max-h-[500px] overflow-y-auto custom-scrollbar font-mono text-[10px]">
                          <table className="w-full text-left">
                             <thead className="bg-white/5 text-slate-500 uppercase font-black tracking-widest border-b border-white/5 sticky top-0 backdrop-blur-xl">
                                <tr>
                                   <th className="px-8 py-6">Timestamp</th>
                                   <th className="px-8 py-6">Profissional</th>
                                   <th className="px-8 py-6">Evento</th>
                                   <th className="px-8 py-6">Aparelho</th>
                                   <th className="px-8 py-6 text-right">Status</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-white/5">
                                {nationalLogs.length > 0 ? nationalLogs.map((log: any) => (
                                   <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                      <td className="px-8 py-5 text-slate-500">[{formatTime(log.timestamp)}]</td>
                                      <td className="px-8 py-5">
                                         <div className="flex items-center gap-3">
                                            <span className={`w-2 h-2 rounded-full ${log.status === 'ERROR' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-emerald-500'}`}></span>
                                            <p className="text-white font-bold">{log.email}</p>
                                         </div>
                                      </td>
                                      <td className={`px-8 py-5 font-black uppercase tracking-tighter ${log.status === 'ERROR' ? 'text-rose-500' : 'text-blue-400'}`}>{log.action}</td>
                                      <td className="px-8 py-5 text-slate-400 italic">{log.device}</td>
                                      <td className="px-8 py-5 text-right">
                                         <span className="bg-white/5 text-slate-400 px-3 py-1 rounded-full text-[8px] font-black border border-white/10 uppercase">RED ALPHA</span>
                                      </td>
                                   </tr>
                                )) : (
                                   <tr><td colSpan={5} className="px-8 py-32 text-center text-slate-600 font-black uppercase tracking-widest">Sem tráfego registrado</td></tr>
                                )}
                             </tbody>
                          </table>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* ABA USUÁRIOS: GESTÃO DE CREDENCIAIS */}
          {activeTab === 'users' && (
            <div className="space-y-12">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                {/* FORMULÁRIO DE CRIAÇÃO */}
                <div className="bg-slate-900/60 p-10 rounded-[3.5rem] border border-white/5 space-y-8 h-fit shadow-inner">
                  <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-xs">A+</span>
                    Novo Cadastro Alpha
                  </h4>
                  <form onSubmit={handleCreateUser} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-3">E-mail de Acesso</label>
                       <input type="text" required value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-white font-bold text-sm outline-none focus:border-blue-500" placeholder="exemplo@alpha.com" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-3">Senha de Acesso</label>
                       <input type="text" required value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-white font-bold text-sm outline-none focus:border-blue-500" placeholder="Senha mestra" />
                    </div>
                    <button type="submit" className="w-full bg-white text-slate-950 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.03] transition-all shadow-xl">
                      Habilitar Profissional
                    </button>
                  </form>
                </div>

                {/* LISTA DE USUÁRIOS ATIVOS */}
                <div className="xl:col-span-2 space-y-6">
                   <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-4">Base de Dados de Profissionais</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {users.map(user => (
                        <div key={user.email} className={`bg-slate-900/40 p-8 rounded-[3rem] border ${user.blocked ? 'border-rose-900/50 grayscale opacity-60' : 'border-white/5'} transition-all hover:bg-slate-900/60`}>
                           <div className="flex justify-between items-start mb-6">
                              <div className="flex items-center gap-4">
                                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg ${user.blocked ? 'bg-slate-800 text-slate-600' : 'bg-blue-600 text-white'}`}>
                                    {user.email.charAt(0).toUpperCase()}
                                 </div>
                                 <div>
                                    <p className="text-lg font-black text-white truncate max-w-[150px]">{user.email}</p>
                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${user.blocked ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                                       {user.blocked ? 'ACESSO BLOQUEADO' : 'ACESSO LIBERADO'}
                                    </span>
                                 </div>
                              </div>
                              <div className="flex gap-2">
                                 <button onClick={() => handleToggleBlock(user.email)} className={`p-3 rounded-xl transition-all ${user.blocked ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' : 'bg-rose-600/20 text-rose-500 hover:bg-rose-600 hover:text-white'}`} title={user.blocked ? "Liberar" : "Bloquear"}>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                 </button>
                                 <button onClick={() => handleDeleteUser(user.email)} className="p-3 bg-white/5 text-slate-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                 </button>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA MASTER CONTROL: CONFIGURAÇÕES E BROADCAST */}
          {activeTab === 'global' && (
            <div className="max-w-4xl mx-auto py-10 space-y-8">
               
               {/* BROADCAST DE AVISOS */}
               <div className="bg-amber-500/10 border border-amber-500/20 p-12 rounded-[4rem] shadow-2xl space-y-8">
                  <div className="flex items-center gap-6">
                     <div className="w-20 h-20 bg-amber-500 rounded-[1.8rem] flex items-center justify-center text-white shadow-xl">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                     </div>
                     <div>
                        <h4 className="text-xl font-black text-amber-500 uppercase tracking-widest">Broadcast Nacional</h4>
                        <p className="text-[10px] font-bold text-amber-600/60 uppercase tracking-widest">Enviar aviso instantâneo para todos os usuários logados</p>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-amber-600/50 uppercase tracking-widest ml-4">Mensagem de Alerta (Aparecerá no topo do App)</label>
                     <textarea 
                        className="w-full bg-black/40 border border-amber-500/20 rounded-[2.5rem] p-8 text-white font-bold text-sm outline-none focus:border-amber-500 transition-all resize-none min-h-[150px]"
                        placeholder="Ex: Karony informa: Atualização crítica no banco de dados às 22h."
                        value={globalConfig.globalNotice}
                        onChange={e => setGlobalConfig({...globalConfig, globalNotice: e.target.value})}
                     />
                     <div className="flex gap-4">
                        <button 
                           onClick={() => { db.saveGlobalConfig(globalConfig); setStatusMsg('Aviso Propagado com Sucesso!'); }}
                           className="flex-1 bg-amber-500 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl hover:scale-[1.02] transition-all"
                        >
                           Transmitir Aviso Agora
                        </button>
                        <button 
                           onClick={() => { setGlobalConfig({...globalConfig, globalNotice: ''}); db.saveGlobalConfig({...globalConfig, globalNotice: ''}); }}
                           className="px-10 bg-white/5 text-amber-500 border border-amber-500/20 rounded-[2rem] font-black uppercase tracking-widest text-[9px]"
                        >
                           Limpar Canal
                        </button>
                     </div>
                  </div>
               </div>

               {/* CONFIGURAÇÕES DE INTERFACE */}
               <div className="bg-slate-900/80 p-12 rounded-[4rem] border border-white/5 space-y-10 shadow-2xl">
                  <div className="text-center space-y-2">
                     <h4 className="text-lg font-black text-white uppercase tracking-[0.4em]">Configurações da Interface</h4>
                     <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Ajuste o visual do ecossistema Alpha globalmente</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Nome da Plataforma</label>
                        <input type="text" className="w-full bg-black/40 border border-white/5 rounded-3xl p-6 text-white font-bold outline-none focus:border-blue-500 transition-all" value={globalConfig.appName} onChange={e => setGlobalConfig({...globalConfig, appName: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Slogan Principal</label>
                        <input type="text" className="w-full bg-black/40 border border-white/5 rounded-3xl p-6 text-white font-bold outline-none focus:border-blue-500 transition-all" value={globalConfig.appSlogan} onChange={e => setGlobalConfig({...globalConfig, appSlogan: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Cor Temática Alpha</label>
                        <div className="flex gap-4">
                           <input type="color" className="h-20 w-20 bg-transparent border-none cursor-pointer" value={globalConfig.primaryColor} onChange={e => setGlobalConfig({...globalConfig, primaryColor: e.target.value})} />
                           <div className="flex-1 bg-black/40 rounded-3xl border border-white/5 flex items-center px-6">
                              <p className="text-sm font-mono text-slate-400 uppercase font-black">{globalConfig.primaryColor}</p>
                           </div>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Modo de Segurança</label>
                        <button onClick={() => setGlobalConfig({...globalConfig, maintenanceMode: !globalConfig.maintenanceMode})} className={`w-full h-20 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all ${globalConfig.maintenanceMode ? 'bg-rose-600 text-white shadow-xl' : 'bg-emerald-600/10 text-emerald-500 border border-emerald-500/30'}`}>
                           {globalConfig.maintenanceMode ? 'SISTEMA EM LOCKDOWN' : 'SISTEMA OPERACIONAL'}
                        </button>
                     </div>
                  </div>

                  <button onClick={() => { db.saveGlobalConfig(globalConfig); setStatusMsg('Configurações Propagadas!'); }} className="w-full bg-blue-600 text-white py-7 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:scale-105 transition-all">
                    Sincronizar Ecossistema Nacional
                  </button>
               </div>
            </div>
          )}
        </div>

        <div className="p-10 bg-slate-900/50 border-t border-white/5 text-center">
           <p className="text-[10px] text-slate-700 font-black uppercase tracking-[1em]">Alpha Wolves Network System • Comando Karony Rubia Intelligence</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
