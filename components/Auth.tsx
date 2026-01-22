
import React, { useState } from 'react';
import { db } from '../db/storage';

interface AuthProps {
  onLoginSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Pequeno delay para simular processamento e melhorar UX
    setTimeout(() => {
      if (isLogin) {
        if (db.login(email, password)) {
          onLoginSuccess();
        } else {
          setError('E-mail ou senha incorretos. Verifique suas credenciais.');
          setIsLoading(false);
        }
      } else {
        if (db.register(email, password)) {
          alert('Conta Alpha criada com sucesso! Entre agora.');
          setIsLogin(true);
          setIsLoading(false);
        } else {
          setError('Este e-mail já possui uma conta ativa no sistema.');
          setIsLoading(false);
        }
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center alpha-gradient p-4 relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>

      <div className="bg-white w-full max-w-[420px] rounded-[3rem] shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="p-10 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto text-blue-900 shadow-inner mb-6 ring-8 ring-blue-50/50">
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.5 3V6C7.5 8.48528 9.51472 10.5 12 10.5C14.4853 10.5 16.5 8.48528 16.5 6V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 10.5V14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 14.5C12 14.5 12 18 15 18H16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="18.5" cy="18" r="2.5" stroke="currentColor" strokeWidth="2"/>
              <circle cx="7.5" cy="3" r="1" fill="currentColor"/>
              <circle cx="16.5" cy="3" r="1" fill="currentColor"/>
            </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Alpha Wolves</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] font-black text-cyan-600 mt-1">Consultório Digital</p>
        </div>

        <div className="px-10 pb-12">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail de Acesso</label>
              <div className="relative">
                <input 
                  type="email" required
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-blue-900/5 focus:border-blue-900 outline-none transition-all placeholder:text-slate-300"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <svg className="w-5 h-5 absolute left-4 top-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha Privada</label>
              <div className="relative">
                <input 
                  type="password" required
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-blue-900/5 focus:border-blue-900 outline-none transition-all placeholder:text-slate-300"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <svg className="w-5 h-5 absolute left-4 top-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl">
                <p className="text-[11px] text-rose-500 font-bold text-center">{error}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Processando...
                </>
              ) : (
                isLogin ? 'Entrar no Sistema Alpha' : 'Criar minha Conta Alpha'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <p className="text-xs text-slate-400 font-bold">
              {isLogin ? 'Novo no Alpha Wolves?' : 'Já possui cadastro?'}
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="ml-2 text-blue-700 font-black uppercase tracking-tighter hover:underline transition-all"
              >
                {isLogin ? 'Cadastrar-se' : 'Ir para Login'}
              </button>
            </p>
          </div>
        </div>
      </div>
      
      {/* Rodapé da tela de login */}
      <div className="absolute bottom-8 left-0 right-0 text-center text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">
        Alpha Wolves Clinical Solution v2.0 • Security by Alpha Design
      </div>
    </div>
  );
};

export default Auth;
