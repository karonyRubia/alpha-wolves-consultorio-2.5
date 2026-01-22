
import React, { useState } from 'react';
import { Patient } from '../types';
import { ICONS } from '../constants';

interface MessageModalProps {
  patient: Patient | null;
  onClose: () => void;
  clinicName: string;
}

const MessageModal: React.FC<MessageModalProps> = ({ patient, onClose, clinicName }) => {
  const [message, setMessage] = useState(`Olá ${patient?.name.split(' ')[0]}! Tudo bem? Passando para confirmar seu atendimento no ${clinicName}.`);

  if (!patient) return null;

  const handleSendWhatsApp = () => {
    const encoded = encodeURIComponent(message);
    const phone = patient.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-700">
              {patient.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Mensagem para {patient.name.split(' ')[0]}</h3>
              <p className="text-xs text-slate-400">{patient.phone}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Mensagem de Confirmação</label>
            <textarea
              autoFocus
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none transition-all"
            />
          </div>

          <button
            onClick={handleSendWhatsApp}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200"
          >
            {ICONS.WhatsApp("w-5 h-5")} Enviar via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
