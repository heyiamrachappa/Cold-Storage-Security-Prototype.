import React, { useState } from 'react';
import { SimulationProvider } from './context/SimulationContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ScenarioBar } from './components/ScenarioBar';
import { AlertBanner } from './components/AlertBanner';
import { DashboardView } from './components/views/DashboardView';
import { DigitalEnvironmentView } from './components/views/DigitalEnvironmentView';
import { SecurityEventsView } from './components/views/SecurityEventsView';
import { ForensicReportView } from './components/views/ForensicReportView';
import { ArchitectureView } from './components/views/ArchitectureView';
import { SettingsView } from './components/views/SettingsView';

export const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('dashboard');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView onNavigate={setCurrentView} />;
      case 'environment':
        return <DigitalEnvironmentView />;
      case 'events':
        return <SecurityEventsView />;
      case 'forensics':
        return <ForensicReportView />;
      case 'architecture':
        return <ArchitectureView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Application Header */}
      <Header activeView={currentView} />

      {/* Quick 1-Click Evaluation Scenarios Bar */}
      <ScenarioBar />

      {/* Dynamic Cyber-Physical Anomaly Alert Banner */}
      <AlertBanner />

      {/* Main Workspace: Sidebar Navigation + Active View */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <Sidebar currentView={currentView} onSelectView={setCurrentView} />

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto max-w-[1700px] w-full mx-auto">
          {renderCurrentView()}
        </main>
      </div>

      {/* Subtle Footer Bar */}
      <footer className="bg-[#070b14] border-t border-[#132036] py-2 px-4 text-center text-[11px] text-slate-400 font-mono flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>ColdTrace-AI: IoT Cold-Storage Cyber-Physical Security & Forensics</span>
        </div>
        <div>
          <span>Simulation Mode • College Research Presentation Testbed • No Physical Hardware Required</span>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <SimulationProvider>
      <AppContent />
    </SimulationProvider>
  );
};

export default App;
