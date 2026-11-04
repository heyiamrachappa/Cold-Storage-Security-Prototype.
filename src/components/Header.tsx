import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Play, 
  Pause, 
  RotateCcw, 
  Wifi, 
  WifiOff, 
  DoorClosed, 
  DoorOpen, 
  Fan, 
  AlertTriangle,
  Zap,
  Gauge
} from 'lucide-react';

interface HeaderProps {
  activeView: string;
}

export const Header: React.FC<HeaderProps> = ({ activeView }) => {
  const {
    actualTemp,
    doorOpen,
    coolingActive,
    networkOnline,
    simulationRunning,
    simulationSpeed,
    riskScore,
    riskLevel,
    activeAlerts,
    toggleSimulation,
    setSimulationSpeed,
    resetEnvironment
  } = useSimulation();

  const getRiskBadgeColor = () => {
    switch (riskLevel) {
      case 'Critical':
        return 'bg-red-500/20 text-red-400 border-red-500/50 glow-red animate-pulse';
      case 'High':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50 glow-amber';
      case 'Moderate':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40 glow-amber';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 glow-green';
    }
  };

  return (
    <header className="bg-[#090e1a]/95 backdrop-blur border-b border-[#1b2a47] sticky top-0 z-40 px-4 py-2.5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Left: Title & Simulation Badge */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/40">
              <ShieldAlert className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span>ColdTrace-AI</span>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                  v2.4-PROTOTYPE
                </span>
              </h1>
              
              {/* Prominent Simulation Mode Label */}
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/40">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>SIMULATION MODE</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              AI-Assisted IoT Cold Storage Cyber-Physical & Forensic Telemetry System
            </p>
          </div>
        </div>

        {/* Center: Real-time Telemetry Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Chamber Temp Pill */}
          <div className="px-3 py-1.5 rounded-md bg-[#0f192c] border border-[#1e3052] flex items-center gap-2">
            <span className="text-slate-400">Chamber:</span>
            <span className={`font-mono font-bold text-sm ${actualTemp > 8.0 ? 'text-red-400' : actualTemp < 2.0 ? 'text-cyan-300' : 'text-emerald-400'}`}>
              {actualTemp > 0 ? `+${actualTemp.toFixed(1)}` : actualTemp.toFixed(1)}°C
            </span>
          </div>

          {/* Cooling Status */}
          <div className={`px-2.5 py-1.5 rounded-md border flex items-center gap-1.5 font-medium ${
            coolingActive 
              ? 'bg-cyan-950/40 text-cyan-300 border-cyan-800/50' 
              : 'bg-red-950/30 text-red-300 border-red-800/50'
          }`}>
            <Fan className={`w-3.5 h-3.5 ${coolingActive ? 'animate-spin' : ''}`} style={{ animationDuration: '2s' }} />
            <span>Cooling: {coolingActive ? 'ACTIVE' : 'OFF'}</span>
          </div>

          {/* Door Status */}
          <div className={`px-2.5 py-1.5 rounded-md border flex items-center gap-1.5 font-medium ${
            doorOpen 
              ? 'bg-amber-950/40 text-amber-300 border-amber-800/60 animate-pulse' 
              : 'bg-emerald-950/30 text-emerald-300 border-emerald-800/50'
          }`}>
            {doorOpen ? <DoorOpen className="w-3.5 h-3.5" /> : <DoorClosed className="w-3.5 h-3.5" />}
            <span>Door: {doorOpen ? 'UNSEALED' : 'SEALED'}</span>
          </div>

          {/* Gateway Link */}
          <div className={`px-2.5 py-1.5 rounded-md border flex items-center gap-1.5 font-medium ${
            networkOnline 
              ? 'bg-emerald-950/30 text-emerald-300 border-emerald-800/50' 
              : 'bg-red-950/40 text-red-300 border-red-800/60'
          }`}>
            {networkOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-red-400" />}
            <span>Gateway: {networkOnline ? 'ONLINE' : 'DROP'}</span>
          </div>

          {/* Risk Level Badge */}
          <div className={`px-3 py-1.5 rounded-md border flex items-center gap-1.5 font-semibold ${getRiskBadgeColor()}`}>
            <Gauge className="w-3.5 h-3.5" />
            <span>Risk: {riskScore}/100 ({riskLevel})</span>
          </div>
        </div>

        {/* Right: Simulation Controls (Play, Pause, Speed, Reset) */}
        <div className="flex items-center gap-2">
          {/* Pause/Resume */}
          <button
            onClick={toggleSimulation}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              simulationRunning 
                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40' 
                : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40'
            }`}
            title={simulationRunning ? 'Pause simulation loop' : 'Resume simulation loop'}
          >
            {simulationRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume</span>
              </>
            )}
          </button>

          {/* Speed Selector */}
          <div className="flex items-center bg-[#0d1627] rounded-md border border-[#1e3052] p-0.5 text-xs font-mono">
            {[1, 2, 4].map(speed => (
              <button
                key={speed}
                onClick={() => setSimulationSpeed(speed)}
                className={`px-2 py-1 rounded transition-colors ${
                  simulationSpeed === speed 
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Reset button */}
          <button
            onClick={resetEnvironment}
            className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#142036] hover:bg-[#1a2b49] text-slate-300 border border-[#23375c] flex items-center gap-1.5 transition-colors"
            title="Reset simulation parameters to default baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
