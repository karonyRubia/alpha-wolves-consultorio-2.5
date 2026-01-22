
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FinancialRecord } from '../types';
import { ICONS } from '../constants';

interface FinancesProps {
  records: FinancialRecord[];
  onAdd: (record: FinancialRecord) => void;
  onUpdate: (record: FinancialRecord) => void;
  onDelete: (id: string) => void;
}

const Finances: React.FC<FinancesProps> = ({ records, onAdd, onUpdate, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);
  
  const [form, setForm] = useState<Partial<FinancialRecord>>({
    type: 'INCOME',
    category: 'Consultas',
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0]
  });

  // Performance: Sort records only when necessary
  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => b.date.localeCompare(a.date));
  }, [records]);

  useEffect(() => {
    if (showForm && descriptionRef.current) {
      descriptionRef.current.focus();
    }
  }, [showForm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdate({ ...form as FinancialRecord, id: editingId });
    } else {
      onAdd({ ...form as FinancialRecord, id: '' });
    }
    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({
      type: 'INCOME',
      category: 'Consultas',
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleEdit = (rec: FinancialRecord) => {
    setForm(rec);
    setEditingId(rec.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between px-2">
        <div>
          <h3 className="font-black text-slate-900 text-2xl tracking-tight">Fluxo de Caixa</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Gestão de Patrimônio Alpha</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-2 shadow-xl shadow-slate-200 transition-all hover:scale-[1.05] active:scale-[0.98] uppercase tracking-widest"
          >
            {ICONS.Plus("w-5 h-5")} Novo Registro
          </button>
        )}
      </div>

      {showForm && (
        <div className={`bg-white p-8 rounded-[2.5rem] shadow-2xl border-2 transition-all duration-500 ${editingId ? 'border-indigo-100 shadow-indigo-100/20' : 'border-slate-100 shadow-slate-200/50'} animate-in fade-in slide-in-from-top-6`}>
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-3">
                <h4 className="font-black text-slate-900 uppercase tracking-widest text-sm">
                  {editingId ? 'Editar Transação Existente' : 'Registrar Novo Movimento Alpha'}
                </h4>
                {editingId && (
                  <span className="bg-indigo-500 text-white text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest animate-pulse">
                    Modo Edição
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-bold mt-1">Altere os valores de Descrição, Data, Categoria e Valor.</p>
            </div>
            <button onClick={resetForm} className="p-2 hover:bg-slate-100 rounded-full transition-colors group">
              <svg className="w-6 h-6 text-slate-300 group-hover:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Natureza da Operação</label>
              <select 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all cursor-pointer"
                value={form.type}
                onChange={e => setForm({...form, type: e.target.value as 'INCOME' | 'EXPENSE' | 'PIX'})}
              >
                <option value="INCOME">Entrada (+) Crédito</option>
                <option value="EXPENSE">Saída (-) Débito</option>
                <option value="PIX">Recebimento via PIX (⚡)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Valor Total (R$)</label>
              <div className="relative group">
                <span className="absolute left-5 top-5 text-slate-400 font-bold text-sm transition-colors group-focus-within:text-slate-900">R$</span>
                <input 
                  type="number" step="0.01" required
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 pl-12 text-sm font-black focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
                  placeholder="0,00"
                  value={form.amount || ''}
                  onChange={e => setForm({...form, amount: parseFloat(e.target.value)})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Data do Lançamento</label>
              <input 
                type="date" required
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
                value={form.date}
                onChange={e => setForm({...form, date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Categoria Patrimonial</label>
              <input 
                type="text" required
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
                placeholder="Ex: Consultas, Aluguel, Provisão..."
                value={form.category}
                onChange={e => setForm({...form, category: e.target.value})}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Descrição Detalhada da Atividade</label>
              <input 
                ref={descriptionRef}
                type="text" required
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
                placeholder="Ex: Honorários profissionais Dr. Wolves"
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
              />
            </div>
            <div className="md:col-span-2 flex flex-col md:flex-row gap-4 mt-6">
              <button type="submit" className={`flex-1 ${editingId ? 'bg-indigo-600' : 'bg-slate-900'} text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl transition-all hover:brightness-110 active:scale-[0.99]`}>
                {editingId ? 'Confirmar Alterações Alpha' : 'Finalizar Registro Alpha'}
              </button>
              <button type="button" onClick={resetForm} className="px-10 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-xs border border-slate-200 transition-all hover:bg-slate-200">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Financial Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/70 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-7">Atividade / Descrição</th>
                <th className="px-8 py-7">Data</th>
                <th className="px-8 py-7">Categoria</th>
                <th className="px-8 py-7 text-right">Valor Líquido</th>
                <th className="px-8 py-7 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sortedRecords.map(rec => (
                <tr key={rec.id} className={`hover:bg-slate-50/80 transition-all group ${editingId === rec.id ? 'bg-indigo-50/30' : ''}`}>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-slate-800 leading-tight group-hover:text-slate-900 transition-colors">{rec.description}</p>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg mt-2 inline-block shadow-sm ${
                      rec.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700' : 
                      rec.type === 'PIX' ? 'bg-cyan-100 text-cyan-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {rec.type === 'INCOME' ? 'Entrada' : rec.type === 'PIX' ? 'PIX' : 'Saída'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-slate-500">
                      {new Date(rec.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black text-slate-400 bg-white border border-slate-100 px-3 py-1.5 rounded-xl uppercase tracking-tighter shadow-sm">
                      {rec.category}
                    </span>
                  </td>
                  <td className={`px-8 py-6 text-base font-black text-right ${
                    (rec.type === 'INCOME' || rec.type === 'PIX') ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {(rec.type === 'INCOME' || rec.type === 'PIX') ? '+' : '-'} R$ {rec.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => handleEdit(rec)}
                        className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 bg-white border border-slate-100 rounded-2xl shadow-sm transition-all"
                        title="Editar Registro"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => onDelete(rec.id)}
                        className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 bg-white border border-slate-100 rounded-2xl shadow-sm transition-all"
                        title="Excluir Registro"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-5">
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 shadow-inner">
                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Fluxo de Caixa Vazio</p>
                        <p className="text-xs text-slate-300 font-bold">Nenhuma movimentação registrada no sistema.</p>
                      </div>
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

export default Finances;
