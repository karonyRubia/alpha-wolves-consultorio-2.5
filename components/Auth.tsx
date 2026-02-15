
import React, { useState, useEffect } from 'react';
import { db } from '../db/storage';
import { GlobalConfig } from '../types';
import { ICONS } from '../constants';

interface AuthProps {
  onLoginSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig>(db.getGlobalConfig());

  useEffect(() => {
    setGlobalConfig(db.getGlobalConfig());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegistering) {
        if (password !== confirmPassword) {
          setError('As senhas não coincidem.');
          setIsLoading(false);
          return;
        }
        if (password.length < 4) {
          setError('A senha deve ter pelo menos 4 caracteres.');
          setIsLoading(false);
          return;
        }

        const signupResult = await db.signup(email, password);
        if (signupResult.success) {
          const loginResult = await db.login(email, password);
          if (loginResult.success) {
            onLoginSuccess();
          } else {
            setError('Erro no login automático. Tente novamente.');
            setIsRegistering(false);
          }
        } else {
          setError(signupResult.error || 'Erro ao criar conta.');
        }
      } else {
        const result = await db.login(email, password);
        if (result.success) {
          onLoginSuccess();
        } else {
          setError(result.error || 'Identificador ou senha incorretos.');
        }
      }
    } catch (err) {
      setError('Problema de conexão com a rede RubIA.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      {/* Background with parallax effect */}
      <div className="absolute inset-0 z-0 opacity-30 blur-sm scale-105" style={{ backgroundImage: `url(${globalConfig.appCoverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950 z-0"></div>

      <div className="bg-white/95 backdrop-blur-2xl w-full max-w-[460px] rounded-[4rem] shadow-[0_30px_60px_-15px_rgba(136,19,55,0.4)] overflow-hidden relative z-10 animate-in fade-in zoom-in duration-1000 border border-white/20">
        <div className="p-10 text-center border-b border-slate-100 bg-slate-50/50">
          <div className="w-32 h-32 mx-auto mb-6 relative logo-container animate-float">
            <div className="absolute inset-0 rounded-full bg-rose-500/10 blur-2xl"></div>
            {ICONS.RubIALogo("w-full h-full")}
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase alpha-text-gradient">{isRegistering ? 'Cadastro RubIA' : globalConfig.appName}</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] font-black text-rose-600 mt-3">{globalConfig.appSlogan}</p>
        </div>

        <div className="p-10 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Usuário / Identificador</label>
              <input type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] p-5 text-sm font-bold focus:ring-4 focus:ring-rose-100 focus:border-rose-900 outline-none transition-all shadow-inner" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Senha de Acesso</label>
              <input type="password" required className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] p-5 text-sm font-bold focus:ring-4 focus:ring-rose-100 focus:border-rose-900 outline-none transition-all shadow-inner" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            {isRegistering && (
              <div className="space-y-2 animate-in slide-in-from-top-4 duration-500">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Repetir Senha</label>
                <input type="password" required className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] p-5 text-sm font-bold focus:ring-4 focus:ring-rose-100 focus:border-rose-900 outline-none transition-all shadow-inner" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              </div>
            )}
            {error && <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-center"><p className="text-[10px] text-rose-600 font-black uppercase tracking-widest">{error}</p></div>}
            <button type="submit" disabled={isLoading} className="w-full alpha-gradient text-white py-6 rounded-[2.5rem] font-black uppercase tracking-widest text-[12px] shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center mt-4">
              {isLoading ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div> : (isRegistering ? 'Criar Conta RubIA' : 'Entrar na Central RubIA')}
            </button>
          </form>
          <div className="pt-2 text-center">
            <button onClick={() => { setIsRegistering(!isRegistering); setError(''); }} className="text-[10px] font-black text-slate-400 hover:text-rose-900 uppercase tracking-[0.2em] transition-colors">
              {isRegistering ? 'Voltar para o Login' : 'Novo na RubIA? Solicite Acesso'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="absolute bottom-8 text-white/20 text-[10px] font-black uppercase tracking-[0.5em] z-10">
        Karony Rubia Intelligence Systems
      </div>
    </div>
  );
};

export default Auth;
