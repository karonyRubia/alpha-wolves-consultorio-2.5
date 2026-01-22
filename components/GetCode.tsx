
import React, { useState } from 'react';

type Platform = 'netlify' | 'github' | 'streamlit' | 'server';

const GetCode: React.FC = () => {
  const [platform, setPlatform] = useState<Platform>('netlify');
  const [copied, setCopied] = useState(false);

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

  const netlifyConfig = `# netlify.toml (Opcional, mas recomendado)
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200`;

  const streamlitCode = `# app.py para Streamlit Community Cloud
import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(page_title="Alpha Wolves", layout="wide")

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

components.html(html, height=1000, scrolling=True)`;

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
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-5 mb-4">
              <div className="bg-white/20 p-4 rounded-[1.8rem] backdrop-blur-md border border-white/20 shadow-xl">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tighter">Instalação Alpha Wolves</h2>
                <p className="text-cyan-100 font-bold uppercase tracking-[0.2em] text-[10px]">Pronto para Produção em Qualquer Nuvem</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-10">
          {/* Seleção de Plataforma */}
          <div className="flex flex-wrap gap-3 p-2 bg-slate-50 rounded-[2.2rem] w-fit border border-slate-100">
            {[
              { id: 'netlify', label: 'Netlify / Vercel', icon: '⚡' },
              { id: 'github', label: 'GitHub Pages', icon: '🐙' },
              { id: 'streamlit', label: 'Streamlit Cloud', icon: '🎈' },
              { id: 'server', label: 'VPS Própria (Linux)', icon: '🛡️' }
            ].map((opt) => (
              <button 
                key={opt.id}
                onClick={() => setPlatform(opt.id as Platform)}
                className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${platform === opt.id ? 'bg-blue-900 text-white shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600 hover:bg-white'}`}
              >
                <span>{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Coluna 1: Estrutura de Arquivos */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <div className="w-2 h-6 bg-blue-900 rounded-full"></div>
                <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Estrutura de Pastas Necessária</h4>
              </div>
              <div className="relative group">
                <pre className="bg-slate-900 text-blue-300 p-8 rounded-[2.5rem] text-[11px] font-mono leading-relaxed shadow-2xl border-4 border-slate-800">
                  {folderStructure}
                </pre>
                <div className="absolute top-4 right-6 text-[10px] font-black text-slate-500 uppercase">File Layout</div>
              </div>
              <p className="text-xs text-slate-500 font-medium px-4">
                * Para o <strong>Netlify</strong>, certifique-se de incluir o arquivo <code>_redirects</code> na raiz para evitar erros 404 ao navegar.
              </p>
            </div>

            {/* Coluna 2: Código de Configuração */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-6 bg-cyan-500 rounded-full"></div>
                  <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Script de Configuração</h4>
                </div>
                <button 
                  onClick={() => copyToClipboard(platform === 'streamlit' ? streamlitCode : platform === 'netlify' ? netlifyConfig : 'Estrutura copiada')}
                  className="text-[10px] font-black text-blue-600 uppercase hover:underline"
                >
                  {copied ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
              
              <div className="relative">
                <pre className="bg-slate-50 text-slate-600 p-8 rounded-[2.5rem] overflow-x-auto text-[11px] font-mono leading-relaxed border-2 border-slate-100 shadow-inner">
                  <code>
                    {platform === 'streamlit' ? streamlitCode : platform === 'netlify' ? netlifyConfig : 'Siga a estrutura de pastas à esquerda para esta plataforma.'}
                  </code>
                </pre>
              </div>

              {/* Dica de Segurança */}
              <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex gap-4">
                <div className="text-emerald-500">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                </div>
                <div>
                  <h6 className="text-[10px] font-black text-emerald-700 uppercase mb-1">Dica Alpha de Segurança</h6>
                  <p className="text-xs text-emerald-900/70 font-bold leading-relaxed">
                    Hospedagem em HTTPS é obrigatória para habilitar o microfone da Rubia IA e a câmera para anexos de exames.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer com instruções finais */}
        <div className="p-10 bg-slate-50 border-t border-slate-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-slate-100">
                <img src="https://www.netlify.com/img/press/logos/logomark.png" className="w-8 h-8 object-contain" alt="Netlify" />
              </div>
              <div className="text-left">
                <p className="text-sm font-black text-slate-800">Pronto para o Netlify</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Hospedagem Global de Alta Performance</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => window.open('https://app.netlify.com/drop', '_blank')}
                className="bg-blue-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-transform"
              >
                Abrir Netlify Drop
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetCode;
