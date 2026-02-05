
import React, { useState, useEffect } from 'react';
import { db } from '../db/storage';
import { GlobalConfig } from '../types';

interface AuthProps {
  onLoginSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig>(db.getGlobalConfig());

  useEffect(() => {
    const config = db.getGlobalConfig();
    setGlobalConfig(config);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = await db.login(email, password);
      if (result.success) {
        onLoginSuccess();
      } else {
        setError(result.error || 'Credenciais inválidas.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Erro de conexão master.');
      setIsLoading(false);
    }
  };

  const StethoscopeIcon = () => (
    <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.5 3V6C7.5 8.48528 9.51472 10.5 12 10.5C14.4853 10.5 16.5 8.48528 16.5 6V3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 10.5V14.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 14.5C12 14.5 12 18 15 18H16.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="18.5" cy="18" r="2.5" stroke="currentColor" strokeWidth="2.5"/>
    </svg>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      {/* BACKGROUND PERSONALIZADO (CAPA DO APP) */}
      <div 
        className="absolute inset-0 z-0 transition-all duration-1000 opacity-40 scale-105"
        style={{ 
          backgroundImage: `url(${globalConfig.appCoverImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(10px) brightness(0.5)'
        }}
      ></div>

      <div className="bg-white/95 backdrop-blur-2xl w-full max-w-[420px] rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] overflow-hidden relative z-10 animate-in fade-in zoom-in duration-1000">
        <div className="p-12 text-center bg-slate-50 border-b border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
             <img src={globalConfig.appCoverImage} className="w-24 h-24 rounded-full object-cover" />
          </div>
          
          {/* ÍCONE DE ESTETOSCÓPIO RECOLOCADO */}
          <div className="w-24 h-24 bg-slate-950 text-white rounded-[2.8rem] flex items-center justify-center mx-auto shadow-2xl mb-6 transform hover:rotate-6 transition-transform relative z-10 border-4 border-white/20">
            <StethoscopeIcon />
          </div>

          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{globalConfig.appName}</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] font-black text-blue-600 mt-2">{globalConfig.appSlogan}</p>
        </div>

        <div className="p-10 md:p-12 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Usuário Alpha</label>
              <input 
                type="text" required
                className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl p-5 text-sm font-bold focus:ring-4 focus:ring-slate-900/5 focus:border-slate-950 outline-none transition-all"
                placeholder="E-mail ou Usuário"
                value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Senha Secreta</label>
              <input 
                type="password" required
                className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl p-5 text-sm font-bold focus:ring-4 focus:ring-slate-900/5 focus:border-slate-950 outline-none transition-all"
                placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-center">
                <p className="text-[10px] text-rose-600 font-black uppercase tracking-widest">{error}</p>
              </div>
            )}
            <button 
              type="submit" disabled={isLoading}
              className="w-full bg-slate-950 text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {isLoading ? 'Autenticando...' : 'Iniciar Protocolo Alpha'}
            </button>
          </form>
          <div className="pt-4 text-center">
            <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.5em]">Karony Rubia Intelligence Systems</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
