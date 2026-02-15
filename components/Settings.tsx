
import React, { useState, useRef, useEffect } from 'react';
import { AppSettings, View } from '../types';
import { db } from '../db/storage';

interface SettingsProps {
  settings: AppSettings;
  onUpdate: (s: AppSettings) => void;
  onLogout: () => void;
  onViewChange: (view: View) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate, onLogout, onViewChange }) => {
  const [temp, setTemp] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [storageUsage, setStorageUsage] = useState('0');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dbInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setStorageUsage(db.getStorageUsage());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(temp);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTemp({ ...temp, profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImportDB = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (window.confirm('Atenção: Importar um banco de dados substituirá seus dados atuais. Deseja continuar?')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const success = db.importDB(reader.result as string);
          if (success) {
            alert('Banco de dados restaurado com sucesso! Reiniciando sistema...');
            window.location.reload();
          } else {
            alert('Falha ao importar arquivo. Certifique-se de que é um arquivo .json válido do Alpha Wolves.');
          }
        };
        reader.readAsText(file);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b alpha-gradient text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight">Configurações RubIA</h3>
            <p className="text-xs text-blue-100 font-bold uppercase tracking-widest mt-1">ID Sessão: {db.getCurrentUser()}</p>
          </div>
          <button 
            onClick={onLogout}
            className="bg-white/10 hover:bg-rose-500 hover:text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/20"
          >
            Sair
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="flex flex-col items-center gap-4 pb-6 border-b border-slate-50">
            <div className="relative group">
              <img 
                src={temp.profileImage || 'https://picsum.photos/200'} 
                className="w-28 h-28 rounded-[2rem] object-cover shadow-2xl border-4 border-white group-hover:opacity-75 transition-opacity cursor-pointer" 
                alt="Avatar"
                onClick={() => fileInputRef.current?.click()}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-blue-900/60 backdrop-blur-sm text-white p-3 rounded-2xl shadow-xl">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
            <div className="text-center">
              <h4 className="font-black text-slate-800 uppercase tracking-tight text-lg">{temp.doctorName}</h4>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{temp.professionalRole}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Nome do Consultório</label>
              <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-900 outline-none transition-all" value={temp.clinicName} onChange={e => setTemp({...temp, clinicName: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Seu Nome Profissional</label>
              <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-900 outline-none transition-all" value={temp.doctorName} onChange={e => setTemp({...temp, doctorName: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Especialidade / Cargo</label>
              <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-900 outline-none transition-all" value={temp.professionalRole} onChange={e => setTemp({...temp, professionalRole: e.target.value})} />
            </div>
          </div>

          <button 
            type="submit" 
            className={`w-full py-5 rounded-[1.8rem] font-black transition-all shadow-xl text-[11px] uppercase tracking-widest ${
              saved ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-blue-900 text-white shadow-blue-200 hover:bg-blue-800'
            }`}
          >
            {saved ? '✓ Dados Salvos com Sucesso' : 'Atualizar Perfil'}
          </button>
        </form>

        {/* ÁREA DE BLINDAGEM DE DADOS */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Blindagem & Integridade de Dados
            </h4>
            <span className="text-[9px] font-black px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-500 uppercase">
              Uso: {storageUsage} MB
            </span>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-[2rem] space-y-4 shadow-sm">
             <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                   <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                </div>
                <div>
                   <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Backup de Segurança</h5>
                   <p className="text-[10px] text-slate-400 font-bold leading-relaxed mt-1">
                      Para sua tranquilidade total, recomendamos exportar um backup mensal. Seus dados de pacientes e finanças são salvos localmente e criptografados pela sua sessão.
                   </p>
                </div>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button 
                  onClick={() => db.exportDB()}
                  className="flex items-center justify-center gap-3 bg-blue-900 text-white p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg shadow-blue-100"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Exportar Backup (.json)
                </button>
                <button 
                  onClick={() => dbInputRef.current?.click()}
                  className="flex items-center justify-center gap-3 bg-slate-50 text-slate-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-100 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  Restaurar Sistema
                </button>
                <input ref={dbInputRef} type="file" accept=".json" className="hidden" onChange={handleImportDB} />
             </div>
          </div>
        </div>

        {/* DEVELOPER AREA */}
        <div className="p-8 bg-slate-900 border-t border-slate-800">
           <div className="flex items-center justify-between">
              <div>
                 <h4 className="text-white font-black uppercase tracking-widest text-xs">Modo Desenvolvedor</h4>
                 <p className="text-slate-400 text-[10px] font-bold mt-1">Acesse o código-fonte para deploy externo.</p>
              </div>
              <button 
                 onClick={() => onViewChange(View.GET_CODE)}
                 className="bg-blue-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/50"
              >
                 Ver Código
              </button>
           </div>
        </div>

        <div className="p-8 bg-white border-t border-slate-100 text-center">
            <p className="text-[9px] text-slate-300 font-black uppercase tracking-[0.3em]">Ecossistema RubIA • Karony Rubia Intelligence</p>
            <p className="text-[10px] text-blue-600 font-bold mt-2">Suporte Direto: (18) 99136-2185</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
