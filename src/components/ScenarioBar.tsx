import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { 
  CheckCircle2, 
  Flame, 
  Sliders, 
  Snowflake, 
  Repeat, 
  FileWarning, 
  Sparkles 
} from 'lucide-react';

export const ScenarioBar: React.FC = () => {
  const { loadScenario } = useSimulation();

  const scenarios = [
    {
      id: 'normal',
      label: '1. Normal Operation',
      desc: 'Stable 4.2°C, Door closed, Cooling ON, Sensors aligned',
      icon: CheckCircle2,
      color: 'border-emerald-500/40 hover:bg-emerald-950/30 text-emerald-300'
    },
    {
      id: 'excursion',
      label: '2. Temp Excursion',
      desc: 'Door left open & compressor stops, room warms > 11°C',
      icon: Flame,
      color: 'border-amber-500/40 hover:bg-amber-950/30 text-amber-300'
    },
    {
      id: 'sensor_spoof',
      label: '3. Sensor Manipulation',
      desc: 'Primary sensor spoofed to 14.8°C; Reference confirms 4.3°C',
      icon: Sliders,
      color: 'border-cyan-500/40 hover:bg-cyan-950/30 text-cyan-300'
    },
    {
      id: 'cooling_fail',
      label: '4. Cooling Failure',
      desc: 'Compressor unexpectedly cuts out, operational rise',
      icon: Snowflake,
      color: 'border-blue-500/40 hover:bg-blue-950/30 text-blue-300'
    },
    {
      id: 'replay_attack',
      label: '5. Replay Attack',
      desc: 'Adversary re-sends stale nonce frame; ESP32 interlock drops it',
      icon: Repeat,
      color: 'border-red-500/40 hover:bg-red-950/30 text-red-300'
    },
    {
      id: 'evidence_tamper',
      label: '6. Evidence Tampering',
      desc: 'Stored database record altered; SHA-256 hash mismatch flagged',
      icon: FileWarning,
      color: 'border-purple-500/40 hover:bg-purple-950/30 text-purple-300'
    }
  ] as const;

  return (
    <div className="bg-[#0b1322] border-b border-[#182846] p-2.5 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-center gap-2 shrink-0">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200">
            Research Evaluation Scenarios:
          </span>
          <span className="text-[11px] text-slate-400 hidden xl:inline">
            (Instant one-click cyber-physical demonstration profiles)
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {scenarios.map(s => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => loadScenario(s.id)}
                className={`px-2.5 py-1.5 rounded-md border text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-all bg-[#0d172a] shadow-sm ${s.color}`}
                title={s.desc}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

