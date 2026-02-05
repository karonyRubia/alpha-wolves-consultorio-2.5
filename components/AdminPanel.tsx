
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { db } from '../db/storage';
import { GlobalConfig, AccessLog } from '../types';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'radar' | 'users' | 'global'>('radar');
  const [users, setUsers] = useState<any[]>([]);
  const [nationalLogs, setNationalLogs] = useState<AccessLog[]>([]);
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig>(db.getGlobalConfig());
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const coverInputRef = useRef<HTMLInputElement>(null);

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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await db.adminCreateUser(newEmail, newPass);
    if (success) {
      setNewEmail(''); setNewPass(''); loadData();
      setStatusMsg(`Usuário ${newEmail} autorizado na nuvem!`);
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  const handleToggleBlock = async (email: string) => {
    if (email === 'KARONY RUBIA') return;
    await db.toggleUserBlock(email);
    loadData();
  };

  const handleDeleteUser = async (email: string) => {
    if (email === 'KARONY RUBIA') return;
    if (window.confirm(`Excluir ${email}?`)) {
      await db.deleteUser(email);
      loadData();
    }
  };

  const handleUniversalNuke = async () => {
    if (window.confirm('⚠️ ALERTA CRÍTICO: Você está prestes a deslogar TODOS os usuários. Continuar?')) {
      setStatusMsg('Protocolo de Expulsão Ativado...');
      await db.triggerUniversalLogout();
      setTimeout(() => setStatusMsg('Expulsão Global Concluída.'), 3000);
      setTimeout(() => setStatusMsg(''), 6000);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newConfig = { ...globalConfig, appCoverImage: reader.result as string };
        setGlobalConfig(newConfig);
        db.saveGlobalConfig(newConfig);
        setStatusMsg('Capa Alpha Wolves Atualizada!');
        setTimeout(() => setStatusMsg(''), 3000);
      };
      reader.readAsDataURL(file);
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
      <div className="bg-slate-900 rounded-[4rem] shadow-2xl overflow-hidden border border-slate-800">
        
        {/* COMANDO MASTER HEADER - UPDATE FROM BLACK TO NAVY */}
        <div className="p-12 bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 text-white flex flex-col lg:flex-row justify-between items-center gap-10 border-b border-white/5">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 rounded-[2.8rem] bg-blue-600 flex items-center justify-center shadow-[0_0_60px_rgba(37,99,235,0.4)] relative">
               <span className="absolute inset-0 rounded-[2.8rem] bg-blue-400 animate-ping opacity-10"></span>
               <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </div>
            <div>
              <h2 className="text-4xl font-black tracking-tighter">Comando Master</h2>
              <p className="text-blue-400 font-black uppercase tracking-[0.3em] text-[9px] mt-2">Proteção Alpha Wolves Ativa</p>
            </div>
          </div>
          
          <nav className="flex bg-blue-900/40 p-2 rounded-[2.2rem] border border-white/5 backdrop-blur-xl">
            {[
              { id: 'radar', label: 'Monitoramento 🛰️' },
              { id: 'users', label: 'Membros 👥' },
              { id: 'global', label: 'Master Control ⚙️' }
            ].map((tab) => (
              <button 
                key={tab.id} onClick={() => setActiveTab(tab.id as any)} 
                className={`px-8 py-5 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-2xl scale-105' : 'text-slate-400 hover:text-white'}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-10 lg:p-16 min-h-[600px] bg-slate-900/40">
          {statusMsg && (
            <div className="p-5 rounded-3xl text-[10px] font-black text-center mb-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase tracking-widest animate-bounce">
              {statusMsg}
            </div>
          )}

          {activeTab === 'radar' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1 bg-slate-800/60 p-8 rounded-[3rem] border border-white/5">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Online Agora</h4>
                <div className="space-y-4">
                  {onlineUsers.length > 0 ? onlineUsers.map(email => (
                    <div key={email} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-[10px] font-black text-white">
                        {email.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-[11px] font-bold text-white truncate">{email}</p>
                    </div>
                  )) : <p className="text-[10px] text-slate-600 font-bold text-center">Nenhum membro ativo</p>}
                </div>
              </div>
              <div className="lg:col-span-3 bg-slate-800/60 border border-white/5 rounded-[3.5rem] overflow-hidden">
                <table className="w-full text-left font-mono text-[10px]">
                  <thead className="bg-white/5 text-slate-500 uppercase font-black tracking-widest">
                    <tr>
                      <th className="px-8 py-6">Hora</th>
                      <th className="px-8 py-6">Membro</th>
                      <th className="px-8 py-6">Evento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {nationalLogs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-white/5">
                        <td className="px-8 py-5 text-slate-500">[{formatTime(log.timestamp)}]</td>
                        <td className="px-8 py-5 text-white font-bold">{log.email}</td>
                        <td className="px-8 py-5 font-black uppercase text-blue-400">{log.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
              <div className="bg-slate-800/60 p-10 rounded-[3.5rem] border border-white/5 space-y-8">
                <h4 className="text-sm font-black text-white uppercase tracking-widest">Cadastro Alpha</h4>
                <form onSubmit={handleCreateUser} className="space-y-6">
                  <input type="text" required value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full bg-blue-950/40 border border-white/5 rounded-2xl p-5 text-white font-bold text-sm outline-none" placeholder="E-mail" />
                  <input type="text" required value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full bg-blue-950/40 border border-white/5 rounded-2xl p-5 text-white font-bold text-sm outline-none" placeholder="Senha" />
                  <button type="submit" className="w-full bg-white text-slate-950 py-5 rounded-2xl font-black uppercase text-xs">Habilitar Membro</button>
                </form>
              </div>
              <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                {users.map(user => (
                  <div key={user.email} className={`bg-slate-800/40 p-8 rounded-[3rem] border ${user.blocked ? 'border-rose-900/50 grayscale opacity-60' : 'border-white/5'}`}>
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-black text-white truncate">{user.email}</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleToggleBlock(user.email)} className="p-3 bg-white/5 text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </button>
                        <button onClick={() => handleDeleteUser(user.email)} className="p-3 bg-white/5 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'global' && (
            <div className="max-w-4xl mx-auto space-y-12">
               
               {/* PERSONALIZAÇÃO VISUAL (CAPA DO APP) */}
               <div className="bg-slate-800/80 p-12 rounded-[4rem] border-2 border-blue-600/30 shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors pointer-events-none"></div>
                  <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                     <div className="relative">
                        <img 
                           src={globalConfig.appCoverImage} 
                           className="w-48 h-64 object-cover rounded-[2.5rem] shadow-[0_0_50px_rgba(37,99,235,0.3)] border-4 border-white/10" 
                           alt="Capa do App" 
                        />
                        <button 
                           onClick={() => coverInputRef.current?.click()}
                           className="absolute -bottom-4 -right-4 bg-blue-600 text-white p-5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all border-4 border-slate-900"
                        >
                           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        </button>
                        <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                     </div>
                     <div className="flex-1 space-y-6 text-center md:text-left">
                        <div>
                           <h4 className="text-3xl font-black text-white tracking-tighter uppercase">Identidade Alpha Wolves</h4>
                           <p className="text-blue-400 font-bold text-[10px] uppercase tracking-widest mt-2">Alterar a Imagem de Capa (Login e Splash)</p>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed font-bold">
                           A imagem de capa é o primeiro contato do profissional com o ecossistema Alpha. Escolha uma imagem de alto impacto que represente a autoridade da rede.
                        </p>
                        <button 
                           onClick={() => coverInputRef.current?.click()}
                           className="w-full md:w-auto bg-white text-slate-950 px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-blue-600 hover:text-white transition-all"
                        >
                           Trocar Capa Agora
                        </button>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-rose-600/10 border border-rose-600/20 p-10 rounded-[3rem] space-y-6">
                     <h4 className="text-lg font-black text-rose-500 uppercase tracking-widest">Nuke de Acessos</h4>
                     <button onClick={handleUniversalNuke} className="w-full bg-rose-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-[10px]">Derrubar Tudo</button>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 p-10 rounded-[3rem] space-y-6">
                     <h4 className="text-lg font-black text-amber-500 uppercase tracking-widest">Mensagem de Massa</h4>
                     <textarea className="w-full bg-blue-950/40 border border-amber-500/20 rounded-2xl p-4 text-white text-xs outline-none" value={globalConfig.globalNotice} onChange={e => setGlobalConfig({...globalConfig, globalNotice: e.target.value})} />
                     <button onClick={() => { db.saveGlobalConfig(globalConfig); setStatusMsg('Aviso Propagado!'); }} className="w-full bg-amber-500 text-white py-4 rounded-2xl font-black uppercase text-[10px]">Transmitir</button>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
