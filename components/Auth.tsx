
import React, { useState, useEffect } from 'react';
import { db } from '../db/storage';
import { GlobalConfig } from '../types';

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
    const config = db.getGlobalConfig();
    setGlobalConfig(config);
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
        if (password.length < 6) {
          setError('A senha deve ter pelo menos 6 caracteres.');
          setIsLoading(false);
          return;
        }

        const signupResult = await db.signup(email, password);
        if (signupResult.success) {
          // Após cadastrar, tenta o login imediato para melhor UX
          const loginResult = await db.login(email, password);
          if (loginResult.success) {
            onLoginSuccess();
          } else {
            setError('Conta criada, mas ocorreu um erro no primeiro acesso. Tente logar manualmente.');
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
          setError(result.error || 'Acesso negado. Verifique suas credenciais.');
        }
      }
    } catch (err) {
      setError('Falha na comunicação com o Ecossistema Alpha.');
    } finally {
      setIsLoading(false);
    }
  };

  const StethoscopeIcon = () => (
    <svg className="w-12 h-12 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.5 3V6C7.5 8.48528 9.51472 10.5 12 10.5C14.4853 10.5 16.5 8.48528 16.5 6V3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 10.5V14.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 14.5C12 14.5 12 18 15 18H16.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="18.5" cy="18" r="2.5" stroke="currentColor" strokeWidth="2.5"/>
    </svg>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-900">
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

      <div className="bg-white/95 backdrop-blur-3xl w-full max-w-[440px] rounded-[4rem] shadow-[0_50px_120px_rgba(0,0,0,0.5)] overflow-hidden relative z-10 animate-in fade-in zoom-in duration-1000 border border-white/20">
        <div className="p-10 text-center bg-white/50 border-b border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
             <img src={globalConfig.appCoverImage} className="w-24 h-24 rounded-full object-cover" />
          </div>
          
          <div className="w-20 h-20 bg-blue-50 rounded-[2.8rem] flex items-center justify-center mx-auto shadow-2xl mb-6 transform hover:rotate-12 transition-transform relative z-10 border-4 border-white">
            <StethoscopeIcon />
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">
            {isRegistering ? 'Primeiro Acesso Alpha' : globalConfig.appName}
          </h1>
          <p className="text-[10px] uppercase tracking-[0.4em] font-black text-blue-600 mt-2">
            {isRegistering ? 'Crie sua identidade profissional' : globalConfig.appSlogan}
          </p>
        </div>

        <div className="p-8 md:p-12 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Usuário / E-mail</label>
              <input 
                type="text" required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                placeholder="Identificador Alpha"
                value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Sua Senha Mestra</label>
              <input 
                type="password" required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
              />
            </div>

            {isRegistering && (
              <div className="space-y-2 animate-in slide-in-from-top-4 duration-500">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Confirmar Credencial</label>
                <input 
                  type="password" required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                  placeholder="••••••••"
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
            )}

            {error && (
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-center shadow-inner">
                <p className="text-[10px] text-rose-600 font-black uppercase tracking-widest">{error}</p>
              </div>
            )}

            <button 
              type="submit" disabled={isLoading}
              className="w-full bg-blue-700 text-white py-5 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-[0_20px_40px_rgba(29,78,216,0.3)] hover:bg-blue-800 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-.3s]"></div>
                   <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-.5s]"></div>
                </div>
              ) : (isRegistering ? 'Salvar e Iniciar Sessão' : 'Autenticação Mestra')}
            </button>
          </form>

          <div className="pt-2 text-center">
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors"
            >
              {isRegistering ? 'Voltar para o Login' : 'Não tem acesso? Registrar-se Agora'}
            </button>
          </div>

          <div className="pt-6 text-center border-t border-slate-100">
            <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.5em]">Alpha Wolves Intelligence • By Karony Rubia</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
