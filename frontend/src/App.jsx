import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LiveGrid from './components/LiveGrid';
import ZoneConfigurator from './components/ZoneConfigurator';
import AlertTriage from './components/AlertTriage';
import AnprFrsHub from './components/AnprFrsHub';
import AnalyticsDashboard from './components/AnalyticsDashboard';

function MainLayout() {
  const { activeTab } = useApp();

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0B0F19] text-slate-100 overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex overflow-hidden">
          {activeTab === 'live' && <LiveGrid />}
          {activeTab === 'zones' && <ZoneConfigurator />}
          {activeTab === 'triage' && <AlertTriage />}
          {activeTab === 'anpr' && <AnprFrsHub />}
          {activeTab === 'analytics' && <AnalyticsDashboard />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
