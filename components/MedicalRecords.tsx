
import React, { useState, useRef } from 'react';
import { Patient, HistoryEntry, PatientFile } from '../types';

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
              onClick={() => { setSelectedPatient(p); setIsAdding(false); setActiveTab('ANAMNESE'); }}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                selectedPatient?.id === p.id 
                ? 'bg-blue-900 border-blue-900 text-white shadow-lg' 
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

      {/* Área Principal (Formulário ou Prontuário) */}
      <div className="flex-1 h-full min-h-0 main-content-area">
        {isAdding ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 h-full overflow-y-auto animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-900">Novo Prontuário</h3>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Admissão de Paciente</p>
              </div>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors no-print">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleAddPatient} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nome Completo</label>
                  <input 
                    type="text" required
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-900"
                    placeholder="Nome do paciente"
                    value={newPatientForm.name}
                    onChange={e => setNewPatientForm({...newPatientForm, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Data de Nascimento</label>
                  <input 
                    type="date"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-900"
                    value={newPatientForm.birthDate}
                    onChange={e => setNewPatientForm({...newPatientForm, birthDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Telefone / WhatsApp</label>
                  <input 
                    type="text" required
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-900"
                    placeholder="(00) 00000-0000"
                    value={newPatientForm.phone}
                    onChange={e => setNewPatientForm({...newPatientForm, phone: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">E-mail</label>
                  <input 
                    type="email"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-900"
                    placeholder="exemplo@email.com"
                    value={newPatientForm.email}
                    onChange={e => setNewPatientForm({...newPatientForm, email: e.target.value})}
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-200 hover:scale-[1.01] transition-all no-print"
              >
                Criar e Abrir Prontuário
              </button>
            </form>
          </div>
        ) : selectedPatient ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300 overflow-hidden medical-record-container">
            {/* Cabeçalho do Prontuário */}
            <div className="p-6 border-b flex items-center justify-between alpha-gradient text-white medical-record-header">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedPatient(null)} className="md:hidden p-2 bg-white/10 rounded-lg no-print">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl font-black border border-white/20">
                  {selectedPatient.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-black">{selectedPatient.name}</h3>
                  <p className="text-[10px] text-blue-200 uppercase font-black tracking-widest">ID Médico: #{selectedPatient.id.slice(-6)}</p>
                </div>
              </div>
              <button 
                onClick={handlePrint}
                className="md:flex items-center gap-2 px-4 py-2 bg-white/10 text-white border border-white/20 rounded-xl text-[10px] font-black uppercase hover:bg-white/20 transition-all shadow-lg no-print"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Exportar (PDF)
              </button>
            </div>

            {/* Sistema de Abas */}
            <div className="bg-slate-50 border-b flex px-6 overflow-x-auto no-print">
              <button 
                onClick={() => setActiveTab('ANAMNESE')}
                className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${activeTab === 'ANAMNESE' ? 'border-blue-900 text-blue-900 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                1. Dados & Anamnese
              </button>
              <button 
                onClick={() => setActiveTab('EVOLUCAO')}
                className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${activeTab === 'EVOLUCAO' ? 'border-blue-900 text-blue-900 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                2. Evolução Clínica
              </button>
              <button 
                onClick={() => setActiveTab('ARQUIVOS')}
                className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${activeTab === 'ARQUIVOS' ? 'border-blue-900 text-blue-900 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                3. Arquivos & Exames
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
              <div className="print-only-header text-center py-6">
                <h1 className="text-2xl font-black text-slate-900">Alpha Wolves - Relatório Clínico</h1>
                <p className="text-sm text-slate-500 uppercase tracking-widest">Documento Gerado em {new Date().toLocaleDateString('pt-BR')}</p>
              </div>

              {/* CONTEÚDO DA ABA: ANAMNESE */}
              {(activeTab === 'ANAMNESE' || window.matchMedia('print').matches) && (
                <div className="p-6 space-y-8 animate-in fade-in duration-300">
                  {/* Informações Cadastrais */}
                  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      Informações de Contato
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 hover:border-blue-300 transition-colors group">
                        <label className="block text-[8px] font-black text-slate-400 uppercase mb-1">Telefone</label>
                        <input className="w-full text-xs font-bold text-slate-700 bg-transparent border-none p-0 focus:ring-0 outline-none" value={selectedPatient.phone} onChange={e => handleUpdatePatientField('phone', e.target.value)} />
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 hover:border-blue-300 transition-colors group">
                        <label className="block text-[8px] font-black text-slate-400 uppercase mb-1">E-mail</label>
                        <input className="w-full text-xs font-bold text-slate-700 bg-transparent border-none p-0 focus:ring-0 outline-none" value={selectedPatient.email} onChange={e => handleUpdatePatientField('email', e.target.value)} />
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 hover:border-blue-300 transition-colors group">
                        <label className="block text-[8px] font-black text-slate-400 uppercase mb-1">Data de Nasc.</label>
                        <input type="date" className="w-full text-xs font-bold text-slate-700 bg-transparent border-none p-0 focus:ring-0 outline-none" value={selectedPatient.birthDate} onChange={e => handleUpdatePatientField('birthDate', e.target.value)} />
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 hover:border-blue-300 transition-colors group">
                        <label className="block text-[8px] font-black text-slate-400 uppercase mb-1">Última Visita</label>
                        <input type="date" className="w-full text-xs font-bold text-slate-700 bg-transparent border-none p-0 focus:ring-0 outline-none" value={selectedPatient.lastVisit || ''} onChange={e => handleUpdatePatientField('lastVisit', e.target.value)} />
                      </div>
                    </div>
                  </div>

                  {/* ÁREA DE ANAMNESE - ONDE O USUÁRIO PROCURA */}
                  <div className="bg-white p-8 rounded-[3rem] border-2 border-blue-50 shadow-xl space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">ANAMNESE DIGITAL ALPHA</h4>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Histórico Clínico Vital do Paciente</p>
                        </div>
                      </div>
                      <button 
                        onClick={handleLoadTemplate}
                        className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-blue-700 hover:bg-blue-700 hover:scale-105 transition-all flex items-center gap-2 no-print shadow-lg shadow-blue-200"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.3} d="M12 4v16m8-8H4" /></svg>
                        CARREGAR MODELO ALFA
                      </button>
                    </div>
                    
                    <textarea 
                      className="w-full h-[500px] bg-slate-50/50 border border-slate-100 rounded-[2rem] p-8 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-300 resize-none transition-all leading-relaxed font-medium text-slate-700 shadow-inner"
                      placeholder="Nenhuma anamnese registrada. Clique em 'CARREGAR MODELO' para iniciar o prontuário estruturado..."
                      value={selectedPatient.notes}
                      onChange={(e) => handleUpdatePatientField('notes', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* CONTEÚDO DA ABA: EVOLUÇÃO */}
              {activeTab === 'EVOLUCAO' && (
                <div className="p-6 space-y-8 animate-in fade-in duration-300">
                  <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-2 h-4 bg-cyan-500 rounded-full"></span>
                      Novo Registro de Atendimento
                    </h4>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4 no-print">
                      <div className="flex flex-wrap gap-2">
                        {(['CONSULTA', 'EXAME', 'PROCEDIMENTO', 'OBSERVAÇÃO'] as const).map(type => (
                          <button key={type} onClick={() => setNewEvolution({...newEvolution, type})} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newEvolution.type === type ? 'bg-blue-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100 hover:border-blue-200'}`}>
                            {type}
                          </button>
                        ))}
                      </div>
                      <textarea className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-900 h-32 resize-none" placeholder="Descreva os achados clínicos e conduta deste atendimento..." value={newEvolution.content} onChange={(e) => setNewEvolution({...newEvolution, content: e.target.value})} />
                      <button onClick={handleAddEvolution} className="w-full bg-cyan-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-700 shadow-lg shadow-cyan-100 transition-all">
                        Salvar Evolução no Histórico
                      </button>
                    </div>

                    <div className="relative pl-6 border-l-2 border-slate-100 space-y-6 mt-10">
                      {selectedPatient.history.length > 0 ? (
                        selectedPatient.history.map((entry) => (
                          <div key={entry.id} className="relative group">
                            <div className="absolute -left-[31px] top-2 w-3 h-3 rounded-full bg-slate-200 border-2 border-white group-hover:bg-blue-500 transition-colors"></div>
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-[9px] font-black px-3 py-1.5 rounded-lg bg-blue-900 text-white uppercase tracking-widest">{entry.type}</span>
                                <span className="text-[10px] font-bold text-slate-400">{new Date(entry.date).toLocaleDateString('pt-BR')}</span>
                              </div>
                              <p className="text-sm text-slate-700 leading-relaxed font-medium">{entry.content}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                          <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Nenhuma evolução registrada até o momento</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* CONTEÚDO DA ABA: ARQUIVOS */}
              {activeTab === 'ARQUIVOS' && (
                <div className="p-6 space-y-8 animate-in fade-in duration-300">
                  <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-4 bg-emerald-500 rounded-full"></span>
                        Biblioteca de Arquivos & Exames
                      </h4>
                      <button onClick={() => fileInputRef.current?.click()} className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase border border-emerald-100 hover:bg-emerald-100 transition-all flex items-center gap-2 no-print shadow-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.3} d="M12 4v16m8-8H4" /></svg>
                        Anexar Novo Arquivo
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileUpload} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {selectedPatient.files?.map(file => (
                        <div key={file.id} className="group relative bg-slate-50 border border-slate-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all">
                          {file.type.startsWith('image/') ? (
                            <img src={file.data} className="w-full h-40 object-cover" alt={file.name} />
                          ) : (
                            <div className="w-full h-40 flex flex-col items-center justify-center bg-blue-50">
                              <svg className="w-12 h-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                              <span className="text-[9px] font-black text-blue-600 uppercase mt-2">PDF Documento</span>
                            </div>
                          )}
                          <div className="p-3 bg-white">
                            <p className="text-[10px] font-bold text-slate-600 truncate">{file.name}</p>
                            <p className="text-[8px] text-slate-400 uppercase font-black">{new Date(file.date).toLocaleDateString()}</p>
                          </div>
                          <div className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <a href={file.data} target="_blank" rel="noopener noreferrer" className="p-3 bg-white rounded-xl text-slate-900 hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></a>
                            <button onClick={() => removeFile(file.id)} className="p-3 bg-rose-500 rounded-xl text-white hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                          </div>
                        </div>
                      ))}
                      {(!selectedPatient.files || selectedPatient.files.length === 0) && (
                        <div className="col-span-full py-20 border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center text-slate-300">
                          <svg className="w-12 h-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                          <span className="text-xs font-black uppercase tracking-widest">Aguardando anexos clínicos</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Ecossistema de Prontuários Alpha</h3>
            <p className="text-sm text-slate-400 max-w-xs mx-auto font-medium">
              Selecione um paciente na barra lateral para acessar o histórico clínico completo ou criar uma nova anamnese estruturada.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalRecords;
