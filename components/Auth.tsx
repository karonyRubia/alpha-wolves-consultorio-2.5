
import React, { useState } from 'react';
import { db } from '../db/storage';

interface AuthProps {
  onLoginSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const result = db.login(email, password);
      if (result.success) {
        onLoginSuccess();
      } else {
        setError(result.error || 'Credenciais inválidas.');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center alpha-gradient p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      
      <div className="bg-white w-full max-w-[420px] rounded-[3.5rem] shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="p-12 text-center bg-slate-50 border-b border-slate-100">
          <div className="w-24 h-24 bg-blue-900 text-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl mb-6 transform hover:rotate-6 transition-transform">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Alpha Wolves</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] font-black text-blue-600 mt-2">Acesso Restrito ao Consultório</p>
        </div>

        <div className="p-12 space-y-8">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3 items-center">
             <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
             <p className="text-[9px] font-black text-amber-800 uppercase leading-relaxed">Este sistema é privado. Se você não possui um login, solicite ao administrador.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Usuário Alpha</label>
              <input 
                type="text" required
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold focus:ring-4 focus:ring-blue-900/5 outline-none transition-all"
                placeholder="E-mail ou Usuário"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Senha Secreta</label>
              <input 
                type="password" required
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold focus:ring-4 focus:ring-blue-900/5 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-center">
                <p className="text-[10px] text-rose-600 font-black uppercase tracking-widest">{error}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-900 text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-blue-800 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? 'Autenticando...' : 'Entrar no Sistema Alpha'}
            </button>
          </form>

          <div className="pt-6 text-center">
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.4em]">Karony Rubia Intelligence Systems</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
