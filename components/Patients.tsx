
import React, { useState } from 'react';
import { Patient, HistoryEntry } from '../types';
import { ICONS } from '../constants';

interface PatientsProps {
  patients: Patient[];
  onAdd: (p: Patient) => void;
  onDelete: (id: string) => void;
  onUpdate: (p: Patient) => void;
  onMessagePatient: (patient: Patient) => void;
}

const Patients: React.FC<PatientsProps> = ({ patients, onAdd, onDelete, onUpdate, onMessagePatient }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [form, setForm] = useState<Partial<Patient>>({
    name: '', email: '', phone: '', birthDate: '', notes: ''
  });

  const [newHistory, setNewHistory] = useState({ type: 'CONSULTA' as HistoryEntry['type'], content: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ ...form as Patient, id: '', history: [] });
    setShowForm(false);
    setForm({ name: '', email: '', phone: '', birthDate: '', notes: '' });
  };

  const handleAddHistory = () => {
    if (!selectedPatient || !newHistory.content.trim()) return;
    
    const entry: HistoryEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: newHistory.type,
      content: newHistory.content
    };

    onUpdate({
      ...selectedPatient,
      history: [entry, ...selectedPatient.history]
    });
    
    // Refresh local selected state
    setSelectedPatient(prev => prev ? { ...prev, history: [entry, ...prev.history] } : null);
    setNewHistory({ type: 'CONSULTA', content: '' });
  };

  const handleUpdateNotes = (notes: string) => {
    if (!selectedPatient) return;
    const updated = { ...selectedPatient, notes };
    onUpdate(updated);
    setSelectedPatient(updated);
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="md:p-6 md:border-b flex items-center justify-between px-2 md:px-6">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Pacientes</h3>
          <p className="text-sm text-slate-500 hidden md:block">Gerencie registros, prontuários e histórico clínico.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors shadow-lg"
        >
          {ICONS.Plus("w-4 h-4")}
          <span>{showForm ? 'Fechar' : 'Novo Paciente'}</span>
        </button>
      </div>

      {/* Add Patient Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 animate-in fade-in zoom-in duration-300">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Nome Completo</label>
              <input 
                type="text" required
                className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-slate-900"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">E-mail</label>
              <input 
                type="email" required
                className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-slate-900"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Telefone</label>
              <input 
                type="text" required
                className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-slate-900"
                value={form.phone}
                onChange={e => setForm({...form, phone: e.target.value})}
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold">Cadastrar Paciente</button>
            </div>
          </form>
        </div>
      )}
      
      {/* Patient List (Mobile) */}
      <div className="md:hidden space-y-3">
        {patients.map((p) => (
          <div key={p.id} onClick={() => setSelectedPatient(p)} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3 cursor-pointer hover:border-slate-300 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
                {p.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{p.name}</p>
                <p className="text-xs text-slate-400 truncate">{p.phone}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={(e) => { e.stopPropagation(); onMessagePatient(p); }} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  {ICONS.WhatsApp("w-5 h-5")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Patient List (Desktop) */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
              <th className="px-6 py-4">Nome</th>
              <th className="px-6 py-4">Contato</th>
              <th className="px-6 py-4">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {patients.map((p) => (
              <tr key={p.id} onClick={() => setSelectedPatient(p)} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                <td className="px-6 py-4 font-semibold">{p.name}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{p.phone}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); onMessagePatient(p); }} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg">{ICONS.Send("w-5 h-5")}</button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(p.id); }} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-[110] flex items-center justify-end bg-slate-900/40 backdrop-blur-sm transition-all">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl alpha-gradient flex items-center justify-center text-white font-bold text-xl">
                  {selectedPatient.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedPatient.name}</h3>
                  <p className="text-sm text-slate-500">Prontuário Digital Alpha</p>
                </div>
              </div>
              <button onClick={() => setSelectedPatient(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Quick Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Telefone</p>
                  <p className="text-sm font-semibold">{selectedPatient.phone}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">E-mail</p>
                  <p className="text-sm font-semibold truncate">{selectedPatient.email}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Nascimento</p>
                  <p className="text-sm font-semibold">{selectedPatient.birthDate || 'N/A'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Última Visita</p>
                  <p className="text-sm font-semibold">{selectedPatient.lastVisit || 'Primeira'}</p>
                </div>
              </div>

              {/* Medical Notes */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Notas Médicas Detalhadas
                </h4>
                <textarea 
                  className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-slate-900 resize-none transition-all"
                  placeholder="Escreva notas clínicas permanentes aqui..."
                  value={selectedPatient.notes}
                  onChange={(e) => handleUpdateNotes(e.target.value)}
                />
              </div>

              {/* Clinical History Timeline */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Linha do Tempo Clínica
                </h4>

                {/* Add New Entry */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex gap-2">
                    <select 
                      className="bg-white border border-slate-200 rounded-lg text-xs font-bold px-2 py-1 outline-none"
                      value={newHistory.type}
                      onChange={(e) => setNewHistory({...newHistory, type: e.target.value as HistoryEntry['type']})}
                    >
                      <option value="CONSULTA">Consulta</option>
                      <option value="EXAME">Exame</option>
                      <option value="PROCEDIMENTO">Procedimento</option>
                      <option value="OBSERVAÇÃO">Observação</option>
                    </select>
                    <button 
                      onClick={handleAddHistory}
                      className="ml-auto bg-slate-900 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-slate-800"
                    >
                      Registrar Evento
                    </button>
                  </div>
                  <textarea 
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-slate-900 h-20 resize-none"
                    placeholder="O que aconteceu hoje?"
                    value={newHistory.content}
                    onChange={(e) => setNewHistory({...newHistory, content: e.target.value})}
                  />
                </div>

                {/* Timeline Entries */}
                <div className="space-y-6 relative ml-4 border-l-2 border-slate-100 pl-8 pb-8">
                  {selectedPatient.history?.length > 0 ? (
                    selectedPatient.history.map((entry) => (
                      <div key={entry.id} className="relative">
                        <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full border-2 border-white bg-slate-900"></div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-widest">{entry.type}</span>
                            <span className="text-[10px] font-bold text-slate-400">{entry.date}</span>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed">{entry.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-sm text-slate-400 py-10">Nenhum histórico registrado para este paciente.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
