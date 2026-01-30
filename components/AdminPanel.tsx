
import React, { useState, useEffect } from 'react';
import { db } from '../db/storage';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(db.getAllUsers());
  };

  const handleUpdatePassword = (email: string) => {
    if (!newPassword) return;
    const success = db.updateUserPassword(email, newPassword);
    if (success) {
      setStatusMsg(`Senha de ${email} alterada com sucesso!`);
      setNewPassword('');
      setEditingUser(null);
      loadUsers();
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  const handleToggleBlock = (email: string) => {
    if (email === 'KARONY RUBIA') {
      setStatusMsg('Erro: Você não pode bloquear o acesso administrativo master.');
      setTimeout(() => setStatusMsg(''), 3000);
      return;
    }
    const success = db.toggleUserBlock(email);
    if (success) {
      loadUsers();
      setStatusMsg(`Status de ${email} atualizado!`);
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!db.isAdmin()) {
    return (
      <div className="h-full flex items-center justify-center p-12">
        <div className="bg-rose-50 p-8 rounded-3xl border border-rose-100 text-center">
          <p className="text-rose-600 font-black uppercase tracking-widest">Acesso Negado</p>
          <p className="text-xs text-rose-400 mt-2">Apenas KARONY RUBIA pode acessar este painel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-800">
        <div className="p-10 bg-gradient-to-br from-slate-800 to-slate-900 text-white flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Master Console</h2>
            <p className="text-cyan-400 font-black uppercase tracking-widest text-[10px] mt-1">Gestão de Contas Alpha Wolves</p>
          </div>
          <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 border border-cyan-500/20">
             <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-8">
          {statusMsg && (
            <div className={`p-4 rounded-2xl text-xs font-bold text-center animate-bounce border ${statusMsg.includes('Erro') ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
              {statusMsg}
            </div>
          )}

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Pesquisar Usuário (E-mail)</label>
            <div className="relative">
              <input 
                type="text"
                placeholder="Ex: ana@consultorio.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-5 text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Lista de Usuários Cadastrados</h4>
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div key={user.email} className={`bg-slate-800/50 border ${user.blocked ? 'border-rose-500/30' : 'border-slate-700'} p-6 rounded-3xl flex flex-col gap-4 transition-all hover:border-slate-600`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-white">{user.email}</p>
                        {user.blocked && (
                          <span className="bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Bloqueado</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                        {user.email === 'KARONY RUBIA' ? 'Status: Administradora Master' : 'Status: Usuário Padrão'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleToggleBlock(user.email)}
                        disabled={user.email === 'KARONY RUBIA'}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          user.blocked 
                          ? 'bg-emerald-600 text-white hover:bg-emerald-500' 
                          : 'bg-rose-600/20 text-rose-500 hover:bg-rose-600 hover:text-white'
                        } disabled:opacity-20 disabled:cursor-not-allowed`}
                      >
                        {user.blocked ? 'Desbloquear' : 'Bloquear Acesso'}
                      </button>

                      {editingUser === user.email ? (
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            placeholder="Nova Senha"
                            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:ring-1 focus:ring-cyan-500 outline-none w-32"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                          />
                          <button 
                            onClick={() => handleUpdatePassword(user.email)}
                            className="bg-cyan-600 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase"
                          >
                            OK
                          </button>
                          <button 
                            onClick={() => {setEditingUser(null); setNewPassword('');}}
                            className="bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-[10px] font-black uppercase"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setEditingUser(user.email)}
                          className="bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          Senha
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-slate-600">
                  <p className="text-xs font-black uppercase tracking-widest">Nenhum usuário encontrado</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-10 bg-slate-800/50 border-t border-slate-800 flex flex-col items-center gap-4">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Alpha Console Control Center</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
