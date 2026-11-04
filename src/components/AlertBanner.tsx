import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { 
  AlertTriangle, 
  AlertOctagon, 
  X, 
  Check, 
  ShieldAlert, 
  Wrench, 
  RotateCcw,
  Sparkles,
  Fan
} from 'lucide-react';

export const AlertBanner: React.FC = () => {
  const { 
    activeAlerts, 
    acknowledgeAlert, 
    clearAlerts, 
    remediateAndNormalize,
    isRemediating,
    remediationStatus,
    actualTemp
  } = useSimulation();

  // If remediation is active and normalizing, display active remediation progress
  if (isRemediating && activeAlerts.length === 0) {
    return (
      <div className="bg-gradient-to-r from-emerald-950/40 via-cyan-950/40 to-[#080e1b] border-b border-cyan-500/40 text-cyan-100 px-4 py-2.5 shadow-lg glow-cyan">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
              <Fan className="w-4 h-4 animate-spin" style={{ animationDuration: '1.5s' }} />
            </div>
            <div>
              <span className="font-bold text-white flex items-center gap-1.5 font-mono">
                <span>[REMEDIATION IN PROGRESS]</span>
                <span className="text-cyan-300">Chamber Actively Normalizing</span>
              </span>
              <p className="text-[11px] text-slate-300">
                {remediationStatus || 'Root cause resolved. Door sealed and 3.2kW compressor engaged at full pull-down power.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="px-2.5 py-1 rounded bg-[#0d182b] border border-[#1b2f52] text-slate-300">
              Current: <strong className="text-amber-300">{actualTemp > 0 ? `+${actualTemp.toFixed(1)}` : actualTemp.toFixed(1)}°C</strong>
            </div>
            <span className="text-slate-400">➔</span>
            <div className="px-2.5 py-1 rounded bg-[#0d182b] border border-[#1b2f52] text-slate-300">
              Target: <strong className="text-emerald-400">4.2°C (Safe)</strong>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeAlerts.length === 0) {
    return null;
  }

  // Display top prioritized alert (critical first, then most recent)
  const sortedAlerts = [...activeAlerts].sort((a, b) => {
    if (a.severity === 'critical' && b.severity !== 'critical') return -1;
    if (a.severity !== 'critical' && b.severity === 'critical') return 1;
    return 0;
  });

  const currentAlert = sortedAlerts[0];
  const isCritical = currentAlert.severity === 'critical';

  return (
    <div className={`border-b transition-all duration-300 ${
      isCritical 
        ? 'bg-red-950/40 border-red-500/60 text-red-100 glow-red' 
        : 'bg-amber-950/30 border-amber-500/50 text-amber-100 glow-amber'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Left: Icon & Core Alert Body */}
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 p-2 rounded-lg shrink-0 ${
              isCritical ? 'bg-red-600/30 text-red-400 border border-red-500/40 animate-pulse' : 'bg-amber-600/20 text-amber-400 border border-amber-500/40'
            }`}>
              {isCritical ? <AlertOctagon className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-0.5 text-[11px] font-mono font-bold tracking-wider uppercase rounded ${
                  isCritical ? 'bg-red-600 text-white' : 'bg-amber-500 text-slate-950'
                }`}>
                  {currentAlert.severity} ALERT
                </span>
                <span className="text-sm font-bold tracking-wide">
                  {currentAlert.title}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  [{currentAlert.timestamp}]
                </span>
              </div>

              {/* Component affected */}
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="text-slate-400 font-medium">Affected Component:</span>
                <span className="font-mono text-cyan-300 bg-[#0f192a] px-2 py-0.5 rounded border border-[#1e2f4e]">
                  {currentAlert.affectedComponent}
                </span>
              </div>

              {/* Live Snapshot Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs font-mono">
                <div className="bg-[#0b1220]/80 p-1.5 rounded border border-[#1c2a47]">
                  <span className="text-slate-400 block text-[10px]">Primary Sensor</span>
                  <span className="font-bold text-amber-300">{currentAlert.snapshot.primarySensor}</span>
                </div>
                <div className="bg-[#0b1220]/80 p-1.5 rounded border border-[#1c2a47]">
                  <span className="text-slate-400 block text-[10px]">Reference Sensor</span>
                  <span className="font-bold text-cyan-300">{currentAlert.snapshot.referenceSensor}</span>
                </div>
                <div className="bg-[#0b1220]/80 p-1.5 rounded border border-[#1c2a47]">
                  <span className="text-slate-400 block text-[10px]">Door Status</span>
                  <span className="font-bold text-slate-200">{currentAlert.snapshot.door}</span>
                </div>
                <div className="bg-[#0b1220]/80 p-1.5 rounded border border-[#1c2a47]">
                  <span className="text-slate-400 block text-[10px]">Cooling System</span>
                  <span className="font-bold text-slate-200">{currentAlert.snapshot.cooling}</span>
                </div>
              </div>

              {/* AI Explanation & Recommendation */}
              <div className="text-xs pt-1 space-y-1">
                <p className="text-slate-300 leading-relaxed">
                  <strong className="text-cyan-300">ColdTrace-AI Explanation:</strong> “{currentAlert.explanation}”
                </p>
                <p className="text-emerald-300">
                  <strong>Suggested Response:</strong> {currentAlert.suggestedResponse}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col sm:flex-row items-end lg:items-center gap-2 shrink-0">
            {/* Primary Action: Acknowledge & Solve Issue */}
            <button
              onClick={() => remediateAndNormalize(currentAlert.id)}
              className="px-3.5 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              title="Acknowledge alert, seal door, restore cooling & sensors, and return temperature to 4.2°C"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Acknowledge & Solve Issue (Normalize Temp)</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => acknowledgeAlert(currentAlert.id)}
                className="px-3 py-1.5 rounded text-xs font-medium bg-[#131f35] hover:bg-[#1a2b49] text-slate-200 border border-[#23385e] flex items-center gap-1 transition-colors"
                title="Acknowledge alert only"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dismiss</span>
              </button>

              <button
                onClick={clearAlerts}
                className="px-2 py-1.5 rounded text-xs font-medium text-slate-400 hover:text-white transition-colors"
                title="Clear all alerts"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
