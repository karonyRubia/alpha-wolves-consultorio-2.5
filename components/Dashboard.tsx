
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Patient, Appointment, FinancialRecord, AppSettings } from '../types';

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

  // Memoized calculations for maximum performance
  const financialStats = useMemo(() => {
    // Treat INCOME and PIX as incomes
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
    return appointments.filter(a => a.date === todayStr && a.status === 'SCHEDULED').length;
  }, [appointments]);
  
  const progressPercent = useMemo(() => {
    if (settings.monthlyGoal <= 0) return 0;
    return Math.min(Math.round((financialStats.incomes / settings.monthlyGoal) * 100), 100);
  }, [financialStats.incomes, settings.monthlyGoal]);

  const chartData = useMemo(() => [
    { name: 'Receitas', valor: financialStats.incomes, color: '#06b6d4' }, // Cyan for Income
    { name: 'Despesas', valor: financialStats.expenses, color: '#f43f5e' }, // Rose for Expense
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
      color: 'bg-cyan-50 text-cyan-600' 
    },
    { 
      label: 'Agendados Hoje', 
      value: scheduledToday, 
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
      label: 'Despesas Mês', 
      value: `R$ ${financialStats.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-rose-50 text-rose-600' 
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Welcome Header */}
      <div className="px-2">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Painel de Controle</h2>
        <p className="text-slate-500 text-sm font-medium">Bom dia, Dr(a) {settings.doctorName}. Veja como está sua clínica hoje.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 group hover:shadow-md transition-all">
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
          {/* Charts */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h4 className="font-black text-slate-800 text-base uppercase tracking-widest">Fluxo Financeiro</h4>
                <p className="text-xs text-slate-400 font-bold">Distribuição de Receitas vs Despesas</p>
              </div>
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5 text-[10px] font-black text-cyan-500 uppercase">
                  <span className="w-2 h-2 rounded-full bg-cyan-500"></span> Entradas
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-black text-rose-500 uppercase">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> Saídas
                </span>
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

          {/* Monthly Goal Card - Updated to Alpha Medical Theme */}
          <div className="alpha-gradient rounded-3xl p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden group border border-blue-800/20">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 p-10 opacity-10 transform translate-x-6 -translate-y-6 group-hover:scale-125 transition-transform duration-700">
               <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.45l8.15 14.1H3.85L12 5.45z"/></svg>
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200 mb-2">Meta Mensal da Clínica</h5>
                  {isEditingGoal ? (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-white/80">R$</span>
                      <input 
                        type="number" 
                        className="bg-white/10 border-none rounded-xl px-4 py-2 text-3xl font-black w-48 focus:ring-2 focus:ring-cyan-400 outline-none transition-all placeholder-white/50 text-white"
                        value={tempGoal}
                        onChange={e => setTempGoal(e.target.value)}
                        autoFocus
                      />
                      <button onClick={handleSaveGoal} className="bg-cyan-500 text-white p-3 rounded-xl hover:bg-cyan-400 shadow-lg shadow-cyan-900/40">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <h4 className="text-4xl font-black tracking-tight">R$ {settings.monthlyGoal.toLocaleString('pt-BR')}</h4>
                      <button onClick={() => setIsEditingGoal(true)} className="p-2 hover:bg-white/10 rounded-xl text-cyan-200 hover:text-white transition-all">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                    </div>
                  )}
                </div>
                <div className="text-left md:text-right">
                  <p className="text-5xl font-black text-cyan-300 tracking-tighter">{progressPercent}%</p>
                  <p className="text-[10px] font-black text-cyan-200 uppercase tracking-widest mt-1">Atingido</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="w-full bg-black/20 h-4 rounded-full overflow-hidden p-1 border border-white/5">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 via-cyan-400 to-white h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(34,211,238,0.4)]" 
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-cyan-200 uppercase tracking-widest">
                  <span>Progresso</span>
                  <span className="text-white">Meta: R$ {settings.monthlyGoal.toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest">Ações Recentes</h4>
              <p className="text-[10px] text-slate-400 font-bold">Status dos últimos agendamentos</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
            </div>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar">
            {appointments.slice(-8).reverse().map((app) => (
              <div key={app.id} className="group flex items-center gap-4 p-3.5 rounded-2xl border border-slate-50 hover:bg-slate-50 hover:border-slate-100 transition-all cursor-default">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 transition-transform group-hover:scale-105 ${
                  app.status === 'COMPLETED' ? 'bg-cyan-100 text-cyan-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {app.patientName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-800 truncate">{app.patientName}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{app.time} • {app.type}</p>
                </div>
                <button 
                  onClick={() => toggleAppointmentStatus(app)}
                  className={`p-2.5 rounded-xl transition-all shadow-sm ${
                    app.status === 'COMPLETED' 
                      ? 'text-cyan-500 bg-white border border-cyan-100 hover:bg-cyan-50' 
                      : 'text-slate-300 bg-white border border-slate-100 hover:text-cyan-500 hover:border-cyan-200'
                  }`}
                  title={app.status === 'COMPLETED' ? "Reabrir Atendimento" : "Finalizar Atendimento"}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
            ))}
            {appointments.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-5 text-slate-200">
                   <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Sem movimentação</p>
              </div>
            )}
          </div>
          
          <div className="mt-6 p-5 bg-blue-50/50 rounded-3xl border border-blue-100 relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <svg className="w-16 h-16 text-blue-900" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            </div>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              Rubia Insights
            </p>
            <p className="text-[11px] text-blue-900 leading-relaxed font-bold">
              {scheduledToday > 0 
                ? `Dr(a), você tem ${scheduledToday} pendências para hoje. Vamos focar em resolvê-las?` 
                : "Sua agenda de hoje está livre. Excelente momento para organizar as finanças!"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
