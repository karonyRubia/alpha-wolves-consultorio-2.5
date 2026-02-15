
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Patient, Appointment, FinancialRecord, AppSettings } from '../types';
import { ICONS } from '../constants';

interface DashboardProps {
  patients: Patient[];
  appointments: Appointment[];
  finances: FinancialRecord[];
  settings: AppSettings;
  onUpdateSettings: (s: AppSettings) => void;
  onUpdateAppointment: (a: Appointment) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  patients, 
  appointments, 
  finances, 
  settings, 
  onUpdateSettings,
  onUpdateAppointment 
}) => {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(settings.monthlyGoal.toString());

  const financialStats = useMemo(() => {
    const incomes = finances
      .filter(f => f.type === 'INCOME' || f.type === 'PIX')
      .reduce((acc, curr) => acc + curr.amount, 0);
    const expenses = finances
      .filter(f => f.type === 'EXPENSE')
      .reduce((acc, curr) => acc + curr.amount, 0);
    return { incomes, expenses };
  }, [finances]);

  const scheduledToday = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return appointments.filter(a => a.date === todayStr && a.status === 'SCHEDULED');
  }, [appointments]);

  const remindersPending = useMemo(() => {
    return scheduledToday.filter(a => !a.reminderSent).length;
  }, [scheduledToday]);
  
  const progressPercent = useMemo(() => {
    if (settings.monthlyGoal <= 0) return 0;
    return Math.min(Math.round((financialStats.incomes / settings.monthlyGoal) * 100), 100);
  }, [financialStats.incomes, settings.monthlyGoal]);

  const chartData = useMemo(() => [
    { name: 'Receitas', valor: financialStats.incomes, color: '#be123c' },
    { name: 'Despesas', valor: financialStats.expenses, color: '#f43f5e' },
  ], [financialStats]);

  const handleSaveGoal = () => {
    onUpdateSettings({ ...settings, monthlyGoal: parseFloat(tempGoal) || 0 });
    setIsEditingGoal(false);
  };

  const toggleAppointmentStatus = (app: Appointment) => {
    const newStatus = app.status === 'COMPLETED' ? 'SCHEDULED' : 'COMPLETED';
    onUpdateAppointment({ ...app, status: newStatus });
  };

  const stats = [
    { 
      label: 'Faturamento Total', 
      value: `R$ ${financialStats.incomes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-rose-50 text-rose-600' 
    },
    { 
      label: 'Agendados Hoje', 
      value: scheduledToday.length, 
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-blue-50 text-blue-600' 
    },
    { 
      label: 'Total Pacientes', 
      value: patients.length, 
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'bg-indigo-50 text-indigo-600' 
    },
    { 
      label: 'Lembretes Pendentes', 
      value: remindersPending, 
      icon: ICONS.WhatsApp("w-6 h-6"),
      color: remindersPending > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-400'
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="px-2 flex items-center gap-4">
        <div className="w-14 h-14 md:w-16 md:h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 shadow-sm border border-rose-100 shrink-0">
          {ICONS.RubIALogo("w-10 h-10")}
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Painel RubIA</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Seja bem-vindo(a), Dr(a) {settings.doctorName.split(' ')[0]}.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4 group hover:shadow-md transition-all">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${stat.color} group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-lg font-black text-slate-900 truncate">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest">Fluxo Financeiro</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Entradas vs Saídas</p>
              </div>
            </div>
            <div className="h-64 -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}} 
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}} 
                  />
                  <Bar dataKey="valor" radius={[10, 10, 0, 0]} barSize={60}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="alpha-gradient rounded-[2.5rem] p-8 text-white shadow-xl shadow-rose-200 relative overflow-hidden group border border-rose-800/20">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-200 mb-2">Meta Financeira</h5>
                  <div className="flex items-center gap-4">
                    <h4 className="text-4xl font-black tracking-tight">R$ {settings.monthlyGoal.toLocaleString('pt-BR')}</h4>
                    <button onClick={() => setIsEditingGoal(true)} className="p-2 hover:bg-white/10 rounded-xl text-rose-200 transition-all"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeWidth={2}/></svg></button>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-5xl font-black text-rose-300 tracking-tighter">{progressPercent}%</p>
                  <p className="text-[10px] font-black text-rose-200 uppercase tracking-widest mt-1">Atingido</p>
                </div>
              </div>
              <div className="w-full bg-black/20 h-4 rounded-full overflow-hidden p-1">
                <div className="bg-gradient-to-r from-rose-500 to-white h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-full">
            <h4 className="font-black text-slate-800 text-[11px] uppercase tracking-widest mb-6">Agenda do Dia</h4>
            <div className="space-y-4">
              {scheduledToday.slice(0, 5).map((app) => (
                <div key={app.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group transition-all">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${app.reminderSent ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {app.patientName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-800 truncate uppercase">{app.patientName}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{app.time} • {app.type}</p>
                  </div>
                  {app.reminderSent && <div className="text-emerald-500">{ICONS.WhatsApp("w-4 h-4")}</div>}
                </div>
              ))}
              {scheduledToday.length === 0 && (
                <div className="text-center py-10 opacity-30 uppercase font-black text-[10px] tracking-widest">Nenhum agendamento</div>
              )}
            </div>
            
            <div className="mt-8 p-6 bg-rose-50/50 rounded-3xl border border-rose-100 relative overflow-hidden">
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                Insight da Rubia IA
              </p>
              <p className="text-xs text-rose-900 leading-relaxed font-bold">
                {remindersPending > 0 
                  ? `Dr(a), temos ${remindersPending} lembretes pendentes para hoje. Vá até a Agenda para confirmar as consultas via WhatsApp.` 
                  : "Excelente! Todos os pacientes de hoje já foram confirmados via WhatsApp."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
