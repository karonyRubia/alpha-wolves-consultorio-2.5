
import React, { useState } from 'react';
import { Appointment, Patient } from '../types';
import { ICONS } from '../constants';

interface AgendaProps {
  appointments: Appointment[];
  patients: Patient[];
  onAdd: (app: Appointment) => void;
  onUpdate: (app: Appointment) => void;
  onCancel: (id: string) => void;
}

const Agenda: React.FC<AgendaProps> = ({ appointments, patients, onAdd, onUpdate, onCancel }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [formApp, setFormApp] = useState<Partial<Appointment>>({
    patientId: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    type: 'Consulta',
    status: 'SCHEDULED',
    amount: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === formApp.patientId);
    if (!patient) return alert('Selecione um paciente');
    
    if (editingId) {
      onUpdate({
        ...formApp as Appointment,
        id: editingId,
        patientName: patient.name,
      });
    } else {
      onAdd({
        ...formApp as Appointment,
        id: '',
        patientName: patient.name,
      });
    }
    
    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormApp({
      patientId: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      type: 'Consulta',
      status: 'SCHEDULED',
      amount: 0
    });
  };

  const handleEdit = (app: Appointment) => {
    setFormApp(app);
    setEditingId(app.id);
    setShowForm(true);
  };

  const filteredAppointments = appointments.filter(app => app.date === filterDate);

  const changeDate = (days: number) => {
    const current = new Date(filterDate + 'T12:00:00');
    current.setDate(current.getDate() + days);
    setFilterDate(current.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
      {/* Header & Date Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Agenda</h3>
          <p className="text-xs text-slate-400 font-medium">Gestão de horários e fluxos</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
          <button onClick={() => changeDate(-1)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          
          <input 
            type="date" 
            className="text-sm font-bold text-slate-700 bg-transparent border-none focus:ring-0 cursor-pointer"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
          />

          <button onClick={() => changeDate(1)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          
          <div className="w-px h-4 bg-slate-100 mx-1"></div>
          
          <button 
            onClick={() => setFilterDate(new Date().toISOString().split('T')[0])}
            className="text-[10px] font-black uppercase tracking-widest px-3 py-2 hover:bg-slate-50 rounded-xl transition-colors text-indigo-500"
          >
            Hoje
          </button>
        </div>

        <button 
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-slate-900 text-white px-5 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-slate-200 hover:scale-[1.02] transition-transform"
        >
          {ICONS.Plus("w-4 h-4")} Novo Agendamento
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 animate-in fade-in slide-in-from-top-4">
          <div className="mb-6">
            <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">
              {editingId ? 'Editar Agendamento' : 'Novo Registro de Agenda'}
            </h4>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Paciente</label>
              <select 
                required
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                value={formApp.patientId}
                onChange={e => setFormApp({...formApp, patientId: e.target.value})}
              >
                <option value="">Selecione o paciente...</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Data do Atendimento</label>
              <input 
                type="date" 
                required
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                value={formApp.date}
                onChange={e => setFormApp({...formApp, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Horário</label>
              <input 
                type="time" 
                required
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                value={formApp.time}
                onChange={e => setFormApp({...formApp, time: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Tipo de Sessão</label>
              <select 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                value={formApp.type}
                onChange={e => setFormApp({...formApp, type: e.target.value})}
              >
                <option value="Consulta">Consulta</option>
                <option value="Retorno">Retorno</option>
                <option value="Procedimento">Procedimento</option>
                <option value="Urgência">Urgência</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Valor Cobrado (R$)</label>
              <input 
                type="number" 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                value={formApp.amount}
                onChange={e => setFormApp({...formApp, amount: parseFloat(e.target.value)})}
              />
            </div>
            <div className="md:col-span-2 flex gap-3 mt-4">
              <button type="submit" className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-slate-200">
                {editingId ? 'Atualizar Agendamento' : 'Confirmar Agendamento'}
              </button>
              <button type="button" onClick={resetForm} className="px-8 py-4 bg-slate-50 text-slate-500 rounded-2xl font-bold uppercase tracking-widest text-xs border border-slate-100">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5">Horário</th>
                <th className="px-6 py-5">Paciente</th>
                <th className="px-6 py-5">Tipo</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.sort((a,b) => a.time.localeCompare(b.time)).map(app => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5 text-sm font-black text-slate-900">{app.time}</td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-slate-800">{app.patientName}</p>
                      <p className="text-[10px] text-slate-400">{app.date}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg uppercase tracking-tight">
                        {app.type}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${
                        app.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-600' : 
                        app.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                        'bg-rose-50 text-rose-600'
                      }`}>
                        {app.status === 'SCHEDULED' ? 'Agendado' : app.status === 'COMPLETED' ? 'Concluído' : 'Cancelado'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(app)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          title="Editar Agendamento"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        {app.status === 'SCHEDULED' && (
                          <button 
                            onClick={() => onCancel(app.id)} 
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Cancelar Agendamento"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhum atendimento para este dia</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Agenda;
