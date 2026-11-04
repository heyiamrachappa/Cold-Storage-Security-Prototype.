import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { ColdRoomGraphic } from '../ColdRoomGraphic';
import { ThermalChart } from '../ThermalChart';
import { RiskGauge } from '../RiskGauge';
import { EvidenceTable } from '../EvidenceTable';
import { 
  ShieldAlert, 
  Wifi, 
  WifiOff, 
  Cpu, 
  Flame, 
  ThermometerSnowflake, 
  Repeat, 
  Lock, 
  FileCheck2,
  ChevronRight,
  Sliders,
  AlertTriangle
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { 
    actualTemp, 
    doorOpen, 
    coolingActive, 
    networkOnline, 
    primarySensor, 
    referenceSensor,
    securityEvents,
    activeAlerts,
    simulateUnauthorizedCommand,
    simulateReplayAttack,
    simulateSensorManipulation,
    simulateEvidenceTampering,
    simulateNetworkInterruption
  } = useSimulation();

  return (
    <div className="space-y-6">
      {/* Top Section: Graphic & Risk Composite Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 xl:col-span-8">
          <ColdRoomGraphic />
        </div>
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
          <RiskGauge />

          {/* Quick Hardware & Cyber Threat Injection Panel */}
          <div className="rounded-xl border border-[#1b2b48] bg-[#080e1b] p-4 shadow-xl flex-1 flex flex-col justify-between">
            <div className="pb-2 mb-2 border-b border-[#182845] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-red-950/60 text-red-400 border border-red-800/40">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Live Attack Simulator</h4>
                  <p className="text-[10px] text-slate-400">Inject simulated cyber-physical disruptions</p>
                </div>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2">
              <button
                onClick={simulateReplayAttack}
                className="p-2 rounded-lg border border-red-500/30 bg-[#140e1a] hover:bg-red-950/40 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-red-300 group-hover:text-red-200">
                  <Repeat className="w-3.5 h-3.5 text-red-400" />
                  <span>Replay Attack</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Send stale command; ESP32 interlock drops it
                </div>
              </button>

              <button
                onClick={simulateUnauthorizedCommand}
                className="p-2 rounded-lg border border-orange-500/30 bg-[#161118] hover:bg-orange-950/40 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-300 group-hover:text-orange-200">
                  <Lock className="w-3.5 h-3.5 text-orange-400" />
                  <span>Unauthorized Cmd</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Rogue kill-cooling override without token
                </div>
              </button>

              <button
                onClick={simulateSensorManipulation}
                className="p-2 rounded-lg border border-purple-500/30 bg-[#120f20] hover:bg-purple-950/40 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300 group-hover:text-purple-200">
                  <Sliders className="w-3.5 h-3.5 text-purple-400" />
                  <span>Sensor Spoofing</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Inject high primary reading vs normal reference
                </div>
              </button>

              <button
                onClick={() => simulateEvidenceTampering(0)}
                className="p-2 rounded-lg border border-pink-500/30 bg-[#190d1a] hover:bg-pink-950/40 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-pink-300 group-hover:text-pink-200">
                  <FileCheck2 className="w-3.5 h-3.5 text-pink-400" />
                  <span>Evidence Tamper</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Modify database record to trigger hash mismatch
                </div>
              </button>
            </div>

            <div className="pt-2 border-t border-[#162540] flex items-center justify-between text-[10px] text-slate-400">
              <button 
                onClick={simulateNetworkInterruption}
                className="flex items-center gap-1 text-slate-300 hover:text-cyan-300 transition-colors"
              >
                {networkOnline ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-red-400" />}
                <span>{networkOnline ? 'Simulate Gateway Disconnect' : 'Reconnect Gateway'}</span>
              </button>
              <button 
                onClick={() => onNavigate('forensics')}
                className="text-cyan-400 hover:underline flex items-center gap-0.5 font-medium"
              >
                <span>Investigate</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Thermal Dynamic Chart */}
      <ThermalChart />

      {/* Bottom Section: Evidence Ledger & Live Security Timeline Snippet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 xl:col-span-8">
          <EvidenceTable />
        </div>

        <div className="lg:col-span-5 xl:col-span-4 rounded-xl border border-[#1b2b48] bg-[#080e1b] p-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#182845]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Live Incident Stream</h4>
                  <p className="text-[10px] text-slate-400">Real-time detection events</p>
                </div>
              </div>
              <button 
                onClick={() => onNavigate('events')}
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-0.5 font-mono"
              >
                <span>View Full Log</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2 mt-2">
              {securityEvents.slice(0, 5).map(event => (
                <div 
                  key={event.id}
                  className={`p-2.5 rounded-lg border text-xs space-y-1 transition-all ${
                    event.severity === 'critical'
                      ? 'bg-red-950/30 border-red-500/40 text-red-200'
                      : event.severity === 'warning'
                      ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                      : 'bg-[#0e1627] border-[#1a2b48] text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="font-bold text-slate-100">{event.title}</span>
                    <span className="text-slate-400">{event.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-[#14233c] text-center">
            <button
              onClick={() => onNavigate('forensics')}
              className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition-all"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Open Forensic Incident Investigation Panel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
