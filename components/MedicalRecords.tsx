
import React, { useState, useRef, useEffect } from 'react';
import { Patient, HistoryEntry, PatientFile } from '../types';
import { ICONS } from '../constants';

interface MedicalRecordsProps {
  patients: Patient[];
  onUpdate: (patient: Patient) => void;
  onAdd: (patient: Patient) => void;
}

type RecordTab = 'ANAMNESE' | 'EVOLUCAO' | 'ARQUIVOS';

const MedicalRecords: React.FC<MedicalRecordsProps> = ({ patients, onUpdate, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<RecordTab>('ANAMNESE');
  const [isAdding, setIsAdding] = useState(false);
  const [newEvolution, setNewEvolution] = useState({ type: 'CONSULTA' as HistoryEntry['type'], content: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newPatientForm, setNewPatientForm] = useState<Partial<Patient>>({
    name: '', email: '', phone: '', birthDate: '', notes: ''
  });

  // Forçar abertura na anamnese ao trocar de paciente
  useEffect(() => {
    if (selectedPatient) setActiveTab('ANAMNESE');
  }, [selectedPatient?.id]);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm)
  );

  const ANAMNESE_TEMPLATE = `[QUEIXA PRINCIPAL E DURAÇÃO]
- 

[HISTÓRIA DA DOENÇA ATUAL (HDA)]
- 

[ANTECEDENTES PATOLÓGICOS]
- Alergias: 
- Cirurgias prévias: 
- Doenças crônicas: 
- Internações: 

[HISTÓRICO FAMILIAR]
- 

[HÁBITOS DE VIDA]
- Tabagismo/Etilismo: 
- Atividade Física: 
- Qualidade do Sono: 

[EXAME FÍSICO GERAL]
- PA:     | FC:     | Peso:    kg
- Observações: 

[CONDUTA E PLANEJAMENTO]
- `;

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    const patient: Patient = {
      ...newPatientForm as Patient,
      id: Date.now().toString(),
      history: [],
      files: []
    };
    onAdd(patient);
    setIsAdding(false);
    setSelectedPatient(patient);
    setActiveTab('ANAMNESE');
    setNewPatientForm({ name: '', email: '', phone: '', birthDate: '', notes: '' });
  };

  const handleLoadTemplate = () => {
    if (!selectedPatient) return;
    if (selectedPatient.notes && selectedPatient.notes.trim() !== '') {
      if (!window.confirm('Isso substituirá suas notas atuais pelo modelo de Anamnese Alpha. Deseja continuar?')) {
        return;
      }
    }
    handleUpdatePatientField('notes', ANAMNESE_TEMPLATE);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedPatient) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newFile: PatientFile = {
          id: `file_${Date.now()}`,
          name: file.name,
          type: file.type,
          data: reader.result as string,
          date: new Date().toISOString()
        };
        const updatedPatient = {
          ...selectedPatient,
          files: [...(selectedPatient.files || []), newFile]
        };
        onUpdate(updatedPatient);
        setSelectedPatient(updatedPatient);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (fileId: string) => {
    if (!selectedPatient || !window.confirm('Excluir este arquivo permanentemente?')) return;
    const updatedPatient = {
      ...selectedPatient,
      files: (selectedPatient.files || []).filter(f => f.id !== fileId)
    };
    onUpdate(updatedPatient);
    setSelectedPatient(updatedPatient);
  };

  const handleAddEvolution = () => {
    if (!selectedPatient || !newEvolution.content.trim()) return;

    const entry: HistoryEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: newEvolution.type,
      content: newEvolution.content
    };

    const updatedPatient = {
      ...selectedPatient,
      history: [entry, ...selectedPatient.history]
    };

    onUpdate(updatedPatient);
    setSelectedPatient(updatedPatient);
    setNewEvolution({ type: 'CONSULTA', content: '' });
  };

  const handleUpdatePatientField = (field: keyof Patient, value: string) => {
    if (!selectedPatient) return;
    const updated = { ...selectedPatient, [field]: value };
    onUpdate(updated);
    setSelectedPatient(updated);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
      {/* Sidebar de Prontuários */}
      <div className={`w-full md:w-80 flex flex-col gap-4 sidebar-records ${selectedPatient || isAdding ? 'hidden md:flex' : 'flex'}`}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input 
              type="text"
              placeholder="Buscar prontuário..."
              className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-900 shadow-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <svg className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <button 
            onClick={() => { setIsAdding(true); setSelectedPatient(null); }}
            className="bg-blue-900 text-white p-3 rounded-2xl shadow-lg hover:scale-105 transition-transform no-print"
            title="Novo Paciente"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {filteredPatients.map(p => (
            <button
              key={p.id}
              onClick={() => { setSelectedPatient(p); setIsAdding(false); }}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                selectedPatient?.id === p.id 
                ? 'bg-blue-900 border-blue-900 text-white shadow-lg scale-[1.02]' 
                : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${selectedPatient?.id === p.id ? 'bg-white/10' : 'bg-slate-100'}`}>
                  {p.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{p.name}</p>
                  <p className={`text-[10px] ${selectedPatient?.id === p.id ? 'text-blue-200' : 'text-slate-400'}`}>
                    ID: #{p.id.slice(-4)} • {p.history[0]?.date || 'Sem histórico'}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Área Principal */}
      <div className="flex-1 h-full min-h-0 main-content-area">
        {isAdding ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 h-full overflow-y-auto animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Novo Prontuário Alpha</h3>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Admissão Digital</p>
              </div>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors no-print">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleAddPatient} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nome Completo</label>
                  <input type="text" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-900" placeholder="Nome do paciente" value={newPatientForm.name} onChange={e => setNewPatientForm({...newPatientForm, name: e.target.value})} />
                </div>
                <div><label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Data de Nascimento</label><input type="date" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-900" value={newPatientForm.birthDate} onChange={e => setNewPatientForm({...newPatientForm, birthDate: e.target.value})} /></div>
                <div><label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Telefone</label><input type="text" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-900" placeholder="(00) 00000-0000" value={newPatientForm.phone} onChange={e => setNewPatientForm({...newPatientForm, phone: e.target.value})} /></div>
              </div>
              <button type="submit" className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:scale-[1.01] transition-all no-print">Criar e Abrir Prontuário</button>
            </form>
          </div>
        ) : selectedPatient ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300 overflow-hidden">
            {/* Cabeçalho */}
            <div className="p-6 border-b flex items-center justify-between alpha-gradient text-white medical-record-header">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedPatient(null)} className="md:hidden p-2 bg-white/10 rounded-lg no-print"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl font-black border border-white/20">{selectedPatient.name.charAt(0)}</div>
                <div><h3 className="text-xl font-black">{selectedPatient.name}</h3><p className="text-[10px] text-blue-200 uppercase font-black tracking-widest">ID MÉDICO: #{selectedPatient.id.slice(-6)}</p></div>
              </div>
              <button onClick={handlePrint} className="md:flex items-center gap-2 px-4 py-2 bg-white/10 text-white border border-white/20 rounded-xl text-[10px] font-black uppercase hover:bg-white/20 shadow-lg no-print"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>Exportar PDF</button>
            </div>

            {/* Abas */}
            <div className="bg-slate-50 border-b flex px-6 no-print overflow-x-auto">
              {[
                { id: 'ANAMNESE', label: '1. Anamnese Digital', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                { id: 'EVOLUCAO', label: '2. Evolução Clínica', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                { id: 'ARQUIVOS', label: '3. Exames & Fotos', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as RecordTab)}
                  className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id ? 'border-blue-900 text-blue-900 bg-white shadow-inner' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} /></svg>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-100/50">
              {/* ABA ANAMNESE - CORREÇÃO DE VISIBILIDADE */}
              {(activeTab === 'ANAMNESE' || window.matchMedia('print').matches) && (
                <div className="p-6 space-y-6 animate-in fade-in duration-300">
                  {/* Dados Básicos */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm no-print">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">DADOS DO PACIENTE (EDITÁVEIS)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 group focus-within:border-blue-500">
                        <label className="block text-[8px] font-black text-slate-400 uppercase mb-1">Telefone</label>
                        <input className="w-full text-xs font-bold text-slate-700 bg-transparent border-none p-0 focus:ring-0 outline-none" value={selectedPatient.phone} onChange={e => handleUpdatePatientField('phone', e.target.value)} />
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 group focus-within:border-blue-500">
                        <label className="block text-[8px] font-black text-slate-400 uppercase mb-1">E-mail</label>
                        <input className="w-full text-xs font-bold text-slate-700 bg-transparent border-none p-0 focus:ring-0 outline-none" value={selectedPatient.email} onChange={e => handleUpdatePatientField('email', e.target.value)} />
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 group focus-within:border-blue-500">
                        <label className="block text-[8px] font-black text-slate-400 uppercase mb-1">Nascimento</label>
                        <input type="date" className="w-full text-xs font-bold text-slate-700 bg-transparent border-none p-0 focus:ring-0 outline-none" value={selectedPatient.birthDate} onChange={e => handleUpdatePatientField('birthDate', e.target.value)} />
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 group focus-within:border-blue-500">
                        <label className="block text-[8px] font-black text-slate-400 uppercase mb-1">Última Visita</label>
                        <input type="date" className="w-full text-xs font-bold text-slate-700 bg-transparent border-none p-0 focus:ring-0 outline-none" value={selectedPatient.lastVisit || ''} onChange={e => handleUpdatePatientField('lastVisit', e.target.value)} />
                      </div>
                    </div>
                  </div>

                  {/* FOLHA DE ANAMNESE - DESTAQUE TOTAL */}
                  <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-2xl border border-slate-200 relative">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 no-print">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-900 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
                          {/* Ícone de Estetoscópio no lugar do arquivo */}
                          {ICONS.Stethoscope("w-6 h-6")}
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Área de Anamnese</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Preencha os dados clínicos abaixo</p>
                        </div>
                      </div>
                      <button onClick={handleLoadTemplate} className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 hover:scale-105 transition-all shadow-xl shadow-blue-100 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        CARREGAR MODELO PRONTO
                      </button>
                    </div>

                    <div className="relative">
                      {/* Efeito de linhas estilo caderno (opcional) */}
                      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{backgroundImage: 'linear-gradient(#000 1px, transparent 1px)', backgroundSize: '100% 2.5rem'}}></div>
                      <textarea 
                        className="w-full min-h-[600px] bg-transparent border-none p-0 text-base focus:ring-0 resize-none font-medium text-slate-800 leading-[2.5rem] placeholder:text-slate-200"
                        placeholder="Nenhum registro. Use o botão acima para carregar o modelo estruturado de anamnese..."
                        value={selectedPatient.notes}
                        onChange={(e) => handleUpdatePatientField('notes', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* OUTRAS ABAS (EVOLUCAO / ARQUIVOS) - MANTIDAS E REVISADAS */}
              {activeTab === 'EVOLUCAO' && (
                <div className="p-6 space-y-6 animate-in fade-in duration-300">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Nova Evolução Clínica</h4>
                    <div className="bg-slate-50 p-6 rounded-3xl space-y-4 no-print border border-slate-100">
                      <div className="flex flex-wrap gap-2">
                        {(['CONSULTA', 'EXAME', 'PROCEDIMENTO', 'OBSERVAÇÃO'] as const).map(type => (
                          <button key={type} onClick={() => setNewEvolution({...newEvolution, type})} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newEvolution.type === type ? 'bg-blue-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}>{type}</button>
                        ))}
                      </div>
                      <textarea className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-900 h-32 resize-none" placeholder="O que mudou hoje?" value={newEvolution.content} onChange={(e) => setNewEvolution({...newEvolution, content: e.target.value})} />
                      <button onClick={handleAddEvolution} className="w-full bg-blue-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-800 shadow-xl transition-all">Salvar Registro</button>
                    </div>

                    <div className="relative pl-6 border-l-2 border-slate-100 space-y-6">
                      {selectedPatient.history.map((entry) => (
                        <div key={entry.id} className="relative group">
                          <div className="absolute -left-[31px] top-2 w-3 h-3 rounded-full bg-slate-200 border-2 border-white group-hover:bg-blue-600 transition-colors"></div>
                          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[9px] font-black px-3 py-1 bg-slate-100 rounded-lg uppercase">{entry.type}</span>
                              <span className="text-[10px] font-bold text-slate-400">{new Date(entry.date).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed font-medium">{entry.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ARQUIVOS' && (
                <div className="p-6 space-y-6 animate-in fade-in duration-300">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Arquivos & Exames</h4>
                      <button onClick={() => fileInputRef.current?.click()} className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase border border-emerald-100 hover:bg-emerald-100 transition-all flex items-center gap-2 no-print shadow-sm">Anexar Novo</button>
                      <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileUpload} />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {selectedPatient.files?.map(file => (
                        <div key={file.id} className="group relative bg-slate-50 border border-slate-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all h-48">
                          {file.type.startsWith('image/') ? <img src={file.data} className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center bg-blue-50 text-blue-400 font-bold text-[8px]">PDF</div>}
                          <div className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <a href={file.data} target="_blank" className="p-2 bg-white rounded-lg text-slate-900"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></a>
                            <button onClick={() => removeFile(file.id)} className="p-2 bg-rose-500 rounded-lg text-white"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-blue-600/20">
              {/* Ícone de Estetoscópio no lugar do arquivo vazio */}
              {ICONS.Stethoscope("w-12 h-12")}
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tighter">Selecione um Paciente</h3>
            <p className="text-sm text-slate-400 max-w-xs mx-auto font-medium">Use a barra lateral para navegar pelos prontuários ou clique em "+" para adicionar um novo registro Alpha.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalRecords;
