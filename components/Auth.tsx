
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
      setError('Problema de conexão com a rede Alpha.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-900">
      <div className="absolute inset-0 z-0 transition-all duration-1000 opacity-40" style={{ backgroundImage: `url(${globalConfig.appCoverImage})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(5px) brightness(0.4)' }}></div>

      <div className="bg-white/95 backdrop-blur-3xl w-full max-w-[440px] rounded-[3.5rem] shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="p-10 text-center border-b border-slate-100">
          {/* Logo de Estetoscópio em Azul no lugar do arquivo */}
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-2xl mb-6 text-blue-700 border border-blue-50">
            {ICONS.Stethoscope("w-12 h-12")}
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{isRegistering ? 'Cadastro Alpha' : globalConfig.appName}</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-blue-600 mt-2">{globalConfig.appSlogan}</p>
        </div>

        <div className="p-10 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Usuário Alpha</label>
              <input type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-900 outline-none transition-all" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Senha Mestra</label>
              <input type="password" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-900 outline-none transition-all" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            {isRegistering && (
              <div className="space-y-1 animate-in slide-in-from-top-4 duration-500">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Confirmar Senha</label>
                <input type="password" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-900 outline-none transition-all" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              </div>
            )}
            {error && <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-center"><p className="text-[10px] text-rose-600 font-black uppercase tracking-widest">{error}</p></div>}
            <button type="submit" disabled={isLoading} className="w-full bg-blue-900 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:bg-blue-800 transition-all flex items-center justify-center">
              {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (isRegistering ? 'Criar Acesso Alpha' : 'Entrar no Sistema')}
            </button>
          </form>
          <div className="pt-4 text-center">
            <button onClick={() => { setIsRegistering(!isRegistering); setError(''); }} className="text-[10px] font-black text-slate-400 hover:text-blue-900 uppercase tracking-widest transition-colors">
              {isRegistering ? 'Já tenho conta' : 'Novo profissional? Registre-se'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
