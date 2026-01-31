
import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../db/storage';
import { GlobalConfig } from '../types';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'global' | 'audit'>('users');
  const [users, setUsers] = useState<any[]>([]);
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
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener('alpha_users_updated', loadData);
    window.addEventListener('storage', loadData);
    const interval = setInterval(loadData, 10000);
    return () => {
      window.removeEventListener('alpha_users_updated', loadData);
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

  const formatLastActive = (dateStr?: string) => {
    if (!dateStr) return "Nunca acessou";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diff < 5) return "Online agora 🟢";
    return date.toLocaleString('pt-BR');
  };

  if (!db.isAdmin()) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-800">
        <div className="p-10 bg-gradient-to-br from-slate-800 to-slate-900 text-white flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-black tracking-tighter text-white">Alpha Command</h2>
            <div className="flex items-center gap-2 mt-1 justify-center md:justify-start">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <p className="text-cyan-400 font-black uppercase tracking-widest text-[10px]">Karony Rubia Control Center</p>
            </div>
          </div>
          
          <div className="flex bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700">
            {['users', 'global', 'audit'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                {tab === 'users' ? 'Usuários' : tab === 'global' ? 'Sistema Master' : 'Auditoria'}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8 md:p-12 min-h-[500px]">
          {statusMsg && (
            <div className="p-4 rounded-2xl text-xs font-bold text-center mb-8 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 animate-in slide-in-from-top">
              {statusMsg}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-10">
              <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                 <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-2">Monitoramento de Profissionais ({users.length})</h4>
                 <input type="text" placeholder="Pesquisar e-mail..." className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white outline-none w-full md:w-64" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {users.filter(u => u.email.includes(searchTerm)).map(user => (
                  <div key={user.email} className={`bg-slate-800/40 border ${user.blocked ? 'border-rose-500/30' : 'border-slate-800'} p-6 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:bg-slate-800/60`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-black text-white">{user.email}</p>
                        {user.blocked && <span className="bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded-lg uppercase">Acesso Negado</span>}
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2">
                         <p className="text-[10px] text-slate-500 font-bold uppercase">Senha: <span className="text-slate-300 font-mono">{user.pass}</span></p>
                         <p className="text-[10px] text-slate-500 font-bold uppercase">Visto por último: <span className="text-cyan-400">{formatLastActive(user.lastActive)}</span></p>
                         <button onClick={() => handleAuditUser(user.email)} className="text-[10px] font-black text-cyan-500 uppercase hover:underline">Auditar Banco</button>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                       <button onClick={() => handleToggleBlock(user.email)} disabled={user.email === 'KARONY RUBIA'} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${user.blocked ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white' : 'bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white'} disabled:opacity-10`}>
                         {user.blocked ? 'Desbloquear' : 'Bloquear'}
                       </button>
                       <button onClick={() => setEditingUser(user.email)} className="bg-slate-700/50 text-slate-400 px-4 py-2 rounded-xl text-[9px] font-black uppercase hover:text-white">Trocar Senha</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'global' && (
            <div className="space-y-10 animate-in slide-in-from-right">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-2">Identidade Visual Master</h4>
                  <div className="space-y-4 bg-slate-800/30 p-8 rounded-[2.5rem] border border-slate-800">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase ml-2">Nome do App</label>
                      <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-sm text-white" value={globalConfig.appName} onChange={e => setGlobalConfig({...globalConfig, appName: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase ml-2">Cor Primária</label>
                        <input type="color" className="w-full h-12 rounded-xl bg-transparent border-none cursor-pointer" value={globalConfig.primaryColor} onChange={e => setGlobalConfig({...globalConfig, primaryColor: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase ml-2">Manutenção Global</label>
                        <button 
                          onClick={() => setGlobalConfig({...globalConfig, maintenanceMode: !globalConfig.maintenanceMode})}
                          className={`w-full h-12 rounded-xl text-[10px] font-black uppercase transition-all ${globalConfig.maintenanceMode ? 'bg-rose-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                        >
                          {globalConfig.maintenanceMode ? 'ATIVADA 🚨' : 'DESATIVADA'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-2">Avisos e Inteligência</h4>
                  <div className="space-y-4 bg-slate-800/30 p-8 rounded-[2.5rem] border border-slate-800">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase ml-2">Aviso Global</label>
                      <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-sm text-white" value={globalConfig.globalNotice} onChange={e => setGlobalConfig({...globalConfig, globalNotice: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase ml-2">Instrução Rubia Master</label>
                      <textarea className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-[10px] text-slate-400 h-24 resize-none" value={globalConfig.rubiaBaseInstruction} onChange={e => setGlobalConfig({...globalConfig, rubiaBaseInstruction: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-10">
                <button onClick={handleSaveGlobal} className="bg-cyan-600 text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-105 transition-all">Aplicar Modificações Alpha</button>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-10">
               {auditUser ? (
                 <div className="bg-slate-800/50 p-10 rounded-[3rem] border border-slate-800">
                    <div className="flex justify-between items-start mb-10">
                      <div>
                        <h3 className="text-2xl font-black text-white">Auditoria: {auditUser}</h3>
                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mt-1 font-bold">Inspecionando Registros do Banco Local</p>
                      </div>
                      <button onClick={() => setAuditUser(null)} className="text-rose-500 text-[10px] font-black uppercase">Fechar X</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                          <p className="text-[9px] font-black text-cyan-500 uppercase mb-4 tracking-widest">Total de Pacientes</p>
                          <p className="text-4xl font-black text-white">{auditData?.patients.length}</p>
                       </div>
                       <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                          <p className="text-[9px] font-black text-emerald-500 uppercase mb-4 tracking-widest">Registros Financeiros</p>
                          <p className="text-4xl font-black text-white">{auditData?.finances.length}</p>
                       </div>
                    </div>
                 </div>
               ) : (
                 <div className="py-32 text-center text-slate-600 uppercase text-[10px] font-black tracking-widest">
                    Selecione um profissional na lista para auditar.
                 </div>
               )}
            </div>
          )}
        </div>

        <div className="p-10 bg-slate-800/50 border-t border-slate-800 flex justify-center">
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em]">Alpha Wolves Integrity System v3.1</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
