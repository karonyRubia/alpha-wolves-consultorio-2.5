
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Patients from './components/Patients';
import MedicalRecords from './components/MedicalRecords';
import Secretary from './components/Secretary';
import MessageModal from './components/MessageModal';
import Agenda from './components/Agenda';
import Finances from './components/Finances';
import Settings from './components/Settings';
import Auth from './components/Auth';
import GetCode from './components/GetCode';
import AdminPanel from './components/AdminPanel';
import { View, Patient, Appointment, FinancialRecord, AppSettings } from './types';
import { db } from './db/storage';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!db.getCurrentUser());
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [finances, setFinances] = useState<FinancialRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(() => db.getSettings());
  const [messagingPatient, setMessagingPatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      setPatients(db.getPatients());
      setAppointments(db.getAppointments());
      setFinances(db.getFinances());
      setSettings(db.getSettings());
    }
  }, [isLoggedIn]);

  useEffect(() => { if (isLoggedIn) db.savePatients(patients); }, [patients, isLoggedIn]);
  useEffect(() => { if (isLoggedIn) db.saveAppointments(appointments); }, [appointments, isLoggedIn]);
  useEffect(() => { if (isLoggedIn) db.saveFinances(finances); }, [finances, isLoggedIn]);
  useEffect(() => { if (isLoggedIn) db.saveSettings(settings); }, [settings, isLoggedIn]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setCurrentView(View.DASHBOARD);
  };

  const handleLogout = () => {
    if (window.confirm('Deseja realmente encerrar sua sessão atual? Todos os dados foram salvos automaticamente.')) {
      db.logout();
    }
  };

  if (!isLoggedIn) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  const addPatient = (p: Patient) => {
    const newPatient = { ...p, id: `p_${Date.now()}`, history: p.history || [] };
    setPatients(prev => [...prev, newPatient]);
  };
  
  const deletePatient = (id: string) => {
    if(window.confirm('Excluir este prontuário permanentemente? Esta ação não pode ser desfeita.')) {
      setPatients(prev => prev.filter(p => p.id !== id));
    }
  };

  const updatePatient = (updatedPatient: Patient) => {
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };
  
  const addAppointment = (a: Appointment) => setAppointments(prev => [...prev, { ...a, id: `a_${Date.now()}` }]);
  const updateAppointment = (updated: Appointment) => {
    setAppointments(prev => prev.map(a => a.id === updated.id ? updated : a));
  };
  const cancelAppointment = (id: string) => setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a));

  const addFinance = (f: FinancialRecord) => setFinances(prev => [...prev, { ...f, id: `f_${Date.now()}` }]);
  const updateFinance = (updated: FinancialRecord) => {
    setFinances(prev => prev.map(f => f.id === updated.id ? updated : f));
  };
  const deleteFinance = (id: string) => {
    if (window.confirm('Remover este lançamento financeiro?')) {
      setFinances(prev => prev.filter(f => f.id !== id));
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard patients={patients} appointments={appointments} finances={finances} settings={settings} onUpdateSettings={setSettings} onUpdateAppointment={updateAppointment} />;
      case View.PATIENTS:
        return <Patients patients={patients} onAdd={addPatient} onDelete={deletePatient} onUpdate={updatePatient} onMessagePatient={setMessagingPatient} />;
      case View.PRONTUARIOS:
        return <MedicalRecords patients={patients} onUpdate={updatePatient} onAdd={addPatient} />;
      case View.AGENDA:
        return <Agenda appointments={appointments} patients={patients} onAdd={addAppointment} onUpdate={updateAppointment} onCancel={cancelAppointment} />;
      case View.FINANCES:
        return <Finances records={finances} onAdd={addFinance} onUpdate={updateFinance} onDelete={deleteFinance} />;
      case View.SECRETARY:
        return <Secretary patients={patients} appointments={appointments} doctorName={settings.doctorName} />;
      case View.SETTINGS:
        return <Settings settings={settings} onUpdate={setSettings} onLogout={handleLogout} />;
      case View.ADMIN:
        return <AdminPanel />;
      case View.GET_CODE:
        return <GetCode />;
      default:
        return <Dashboard patients={patients} appointments={appointments} finances={finances} settings={settings} onUpdateSettings={setSettings} onUpdateAppointment={updateAppointment} />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView} settings={settings}>
      <div className="h-full w-full">
        {renderContent()}
      </div>
      
      {messagingPatient && (
        <MessageModal 
          patient={messagingPatient} 
          onClose={() => setMessagingPatient(null)} 
          clinicName={settings.clinicName}
        />
      )}
    </Layout>
  );
};

export default App;
