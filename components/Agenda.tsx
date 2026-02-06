
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
    amount: 0,
    reminderSent: false
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
      amount: 0,
      reminderSent: false
    });
  };

  const handleEdit = (app: Appointment) => {
    setFormApp(app);
    setEditingId(app.id);
    setShowForm(true);
  };

  const handleSendReminder = (app: Appointment) => {
    const patient = patients.find(p => p.id === app.patientId);
    if (!patient) return;

    const message = `Olá ${patient.name.split(' ')[0]}! Tudo bem? Passando para confirmar seu atendimento hoje às ${app.time}. Podemos confirmar sua presença?`;
    const encoded = encodeURIComponent(message);
    const phone = patient.phone.replace(/\D/g, '');
    
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
    
    // Marcar como enviado
    onUpdate({ ...app, reminderSent: true });
  };

  const filteredAppointments = appointments.filter(app => app.date === filterDate);
  const pendingReminders = filteredAppointments.filter(app => !app.reminderSent && app.status === 'SCHEDULED');

  const changeDate = (days: number) => {
    const current = new Date(filterDate + 'T12:00:00');
    current.setDate(current.getDate() + days);
    setFilterDate(current.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Date Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-2">
        <div>
          <h3 className="font-black text-slate-900 text-2xl tracking-tight">Agenda Médica</h3>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Gestão de Fluxo Alpha</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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
          </div>

          <button 
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-blue-900 text-white px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-blue-100 hover:scale-[1.02] transition-all"
          >
            {ICONS.Plus("w-4 h-4")} Novo Agendamento
          </button>
        </div>
      </div>

      {/* Seção de Automação de Lembretes */}
      {pendingReminders.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-[2.5rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 animate-pulse">
               {ICONS.WhatsApp("w-8 h-8")}
            </div>
            <div>
              <h4 className="text-sm font-black text-emerald-900 uppercase tracking-widest">Lembretes Alpha Wolves</h4>
              <p className="text-xs text-emerald-700 font-bold">Existem {pendingReminders.length} pacientes para confirmar hoje.</p>
            </div>
          </div>
          <button 
            onClick={() => pendingReminders.forEach(app => handleSendReminder(app))}
            className="w-full md:w-auto bg-emerald-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
          >
            Disparar Todos Lembretes
          </button>
        </div>
      )}

      {showForm && (
        <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-300">
          <div className="mb-8 flex justify-between items-center">
            <h4 className="font-black text-slate-900 uppercase tracking-widest text-sm">
              {editingId ? 'Editar Agendamento' : 'Novo Registro de Agenda Alpha'}
            </h4>
            <button onClick={resetForm} className="text-slate-300 hover:text-slate-500"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2.5}/></svg></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest px-2">Paciente</label>
              <select 
                required
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                value={formApp.patientId}
                onChange={e => setFormApp({...formApp, patientId: e.target.value})}
              >
                <option value="">Selecione o paciente...</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest px-2">Data do Atendimento</label>
              <input type="date" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold focus:ring-4 focus:ring-blue-50 outline-none transition-all" value={formApp.date} onChange={e => setFormApp({...formApp, date: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest px-2">Horário</label>
              <input type="time" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold focus:ring-4 focus:ring-blue-50 outline-none transition-all" value={formApp.time} onChange={e => setFormApp({...formApp, time: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest px-2">Tipo de Atendimento</label>
              <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold focus:ring-4 focus:ring-blue-50 outline-none transition-all" value={formApp.type} onChange={e => setFormApp({...formApp, type: e.target.value})}>
                <option value="Consulta">Consulta</option>
                <option value="Retorno">Retorno</option>
                <option value="Procedimento">Procedimento</option>
                <option value="Urgência">Urgência</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest px-2">Honorários (R$)</label>
              <input type="number" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold focus:ring-4 focus:ring-blue-50 outline-none transition-all" value={formApp.amount} onChange={e => setFormApp({...formApp, amount: parseFloat(e.target.value)})} />
            </div>
            <div className="md:col-span-2 flex flex-col md:flex-row gap-4 mt-6">
              <button type="submit" className="flex-1 bg-blue-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl">Confirmar Registro</button>
              <button type="button" onClick={resetForm} className="px-10 py-5 bg-slate-50 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[11px] border border-slate-100">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-6">Horário</th>
                <th className="px-8 py-6">Paciente Alpha</th>
                <th className="px-8 py-6">Status / Lembrete</th>
                <th className="px-8 py-6 text-right">Controles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.sort((a,b) => a.time.localeCompare(b.time)).map(app => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-all group">
                    <td className="px-8 py-6 text-sm font-black text-slate-900">{app.time}</td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-slate-800">{app.patientName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{app.type}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${
                          app.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-600' : 
                          app.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {app.status === 'SCHEDULED' ? 'Agendado' : app.status === 'COMPLETED' ? 'Concluído' : 'Cancelado'}
                        </span>
                        {app.reminderSent && (
                          <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 111.414-1.414L9 10.586l3.293-3.293a1 1 0 011.414 1.414z" /></svg>
                            Lembrete OK
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        {app.status === 'SCHEDULED' && !app.reminderSent && (
                          <button 
                            onClick={() => handleSendReminder(app)}
                            className="p-3 text-emerald-600 hover:bg-emerald-50 bg-white border border-emerald-100 rounded-2xl shadow-sm transition-all"
                            title="Enviar Lembrete WhatsApp"
                          >
                            {ICONS.WhatsApp("w-5 h-5")}
                          </button>
                        )}
                        <button 
                          onClick={() => handleEdit(app)}
                          className="p-3 text-slate-400 hover:text-blue-900 hover:bg-blue-50 bg-white border border-slate-100 rounded-2xl shadow-sm transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button 
                          onClick={() => onCancel(app.id)} 
                          className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 bg-white border border-slate-100 rounded-2xl shadow-sm transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-5">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                        {ICONS.Stethoscope("w-10 h-10")}
                      </div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Nenhum atendimento para esta data</p>
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
