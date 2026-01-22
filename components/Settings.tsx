
import React, { useState, useRef } from 'react';
import { AppSettings } from '../types';
import { db } from '../db/storage';

interface SettingsProps {
  settings: AppSettings;
  onUpdate: (s: AppSettings) => void;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate, onLogout }) => {
  const [temp, setTemp] = useState(settings);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dbInputRef = useRef<HTMLInputElement>(null);

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
      const reader = new FileReader();
      reader.onloadend = () => {
        const success = db.importDB(reader.result as string);
        if (success) {
          alert('Banco de dados importado com sucesso! Recarregando...');
          window.location.reload();
        } else {
          alert('Falha ao importar arquivo. Formato inválido.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b alpha-gradient text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Configurações Alpha Medical</h3>
            <p className="text-sm text-blue-100">Logado como: <span className="font-bold underline">{db.getCurrentUser()}</span></p>
          </div>
          <button 
            onClick={onLogout}
            className="bg-white/10 hover:bg-rose-500 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border border-white/20"
          >
            Sair da Conta
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="flex flex-col items-center gap-4 pb-4 border-b border-slate-50">
            <div className="relative group">
              <img 
                src={temp.profileImage} 
                className="w-24 h-24 rounded-3xl object-cover shadow-xl border-4 border-white group-hover:opacity-75 transition-opacity cursor-pointer" 
                alt="Avatar Preview"
                onClick={() => fileInputRef.current?.click()}
              />
              <button 
                type="button"
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <div className="bg-blue-900/60 backdrop-blur-sm text-white p-2 rounded-full">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
              </button>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload}
              />
            </div>
            <div className="text-center">
              <h4 className="font-bold text-slate-800">{temp.doctorName || 'Profissional'}</h4>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">{temp.professionalRole || 'Administrador'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Nome do Consultório</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-900 outline-none transition-all"
                value={temp.clinicName}
                onChange={e => setTemp({...temp, clinicName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Seu Nome (Ex: Dr. Silva)</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-900 outline-none transition-all"
                value={temp.doctorName}
                onChange={e => setTemp({...temp, doctorName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Cargo ou Função</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-900 outline-none transition-all"
                value={temp.professionalRole}
                onChange={e => setTemp({...temp, professionalRole: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className={`w-full py-4 rounded-2xl font-bold transition-all shadow-lg text-sm uppercase tracking-widest ${
              saved ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-blue-900 text-white shadow-blue-200 hover:bg-blue-800'
            }`}
          >
            {saved ? '✓ Configurações Salvas!' : 'Salvar Alterações'}
          </button>
        </form>

        <div className="p-8 bg-slate-50 border-t border-slate-100">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
            Gerenciamento do Banco de Dados
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => db.exportDB()}
              className="flex items-center justify-center gap-3 bg-white border border-slate-200 p-4 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all shadow-sm"
            >
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Exportar Meus Dados (.json)
            </button>
            <button 
              onClick={() => dbInputRef.current?.click()}
              className="flex items-center justify-center gap-3 bg-white border border-slate-200 p-4 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all shadow-sm"
            >
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              Importar Dados (.json)
            </button>
            <input 
              ref={dbInputRef}
              type="file" 
              accept=".json" 
              className="hidden" 
              onChange={handleImportDB}
            />
          </div>
        </div>

        <div className="p-8 bg-white border-t border-slate-100 flex flex-col items-center gap-4 text-center">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Suporte Técnico Alpha</p>
            <a href="tel:18991362185" className="text-blue-600 font-black text-lg">18 99136-2185</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
