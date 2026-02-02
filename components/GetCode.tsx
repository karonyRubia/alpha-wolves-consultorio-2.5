
import React, { useState, useEffect } from 'react';
import { db } from '../db/storage';
import { GlobalConfig } from '../types';

type Platform = 'netlify' | 'github' | 'streamlit' | 'server';

const GetCode: React.FC = () => {
  const [platform, setPlatform] = useState<Platform>('netlify');
  const [copied, setCopied] = useState(false);
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig>(db.getGlobalConfig());

  useEffect(() => {
    setGlobalConfig(db.getGlobalConfig());
  }, []);

  const folderStructure = `
/meu-consultorio-alpha
├── index.html          (Arquivo Principal)
├── index.tsx           (Ponto de Entrada)
├── App.tsx             (Lógica Principal)
├── types.ts            (Definições)
├── constants.tsx       (Ícones e Mocks)
├── _redirects          (Configuração Netlify)
├── /components         (Todos os .tsx da pasta components)
├── /services           (Serviços de IA)
└── /db                 (Lógica de Armazenamento)
  `;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header de Exportação */}
        <div className="p-10 alpha-gradient text-white relative overflow-hidden">
          <div 
            className="absolute inset-0 opacity-20"
            style={{ backgroundImage: `url(${globalConfig.appCoverImage})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'grayscale(1) brightness(2)' }}
          ></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="bg-white/20 p-6 rounded-[2.5rem] backdrop-blur-xl border border-white/30 shadow-2xl">
              <img src={globalConfig.appCoverImage} className="w-20 h-28 object-cover rounded-2xl border-2 border-white/50" alt="Cover Preview" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tighter uppercase">{globalConfig.appName} - Build Manual</h2>
              <p className="text-cyan-100 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Versão 3.5 Alpha Wolves • Karony Rubia Intelligence</p>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-12">
          {/* Seleção de Plataforma */}
          <div className="flex flex-wrap gap-3 p-2 bg-slate-50 rounded-[2.2rem] w-fit border border-slate-100">
            {['netlify', 'github', 'streamlit', 'server'].map((id) => (
              <button 
                key={id} onClick={() => setPlatform(id as Platform)}
                className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${platform === id ? 'bg-slate-950 text-white shadow-2xl scale-105' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {id}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-slate-950 rounded-full"></div>
                <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Estrutura da Build Alpha</h4>
              </div>
              <pre className="bg-slate-950 text-blue-300 p-8 rounded-[3rem] text-[10px] font-mono leading-relaxed border-4 border-slate-900 shadow-2xl">
                {folderStructure}
              </pre>
            </div>

            <div className="space-y-8">
              <div className="p-8 bg-blue-50/50 rounded-[3rem] border border-blue-100 space-y-4">
                 <h6 className="text-[10px] font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                    Branding Atual da Build
                 </h6>
                 <div className="flex gap-4 items-center">
                    <img src={globalConfig.appCoverImage} className="w-16 h-20 object-cover rounded-xl shadow-md" />
                    <div className="text-xs">
                       <p className="text-slate-900 font-black uppercase">{globalConfig.appName}</p>
                       <p className="text-slate-500 font-bold italic">Slogan: {globalConfig.appSlogan}</p>
                       <p className="text-blue-600 font-bold mt-1">Capa Instalada com Sucesso ✓</p>
                    </div>
                 </div>
              </div>

              <div className="p-8 bg-emerald-50 rounded-[3rem] border border-emerald-100 flex gap-4">
                <div className="text-emerald-500 shrink-0">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                </div>
                <div>
                  <h6 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">Nota de Instalação</h6>
                  <p className="text-[11px] text-emerald-900/70 font-bold leading-relaxed">
                    Sua build Alpha Wolves personalizada já inclui a capa definida no Comando Master. Basta copiar os arquivos e subir para o {platform}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetCode;
