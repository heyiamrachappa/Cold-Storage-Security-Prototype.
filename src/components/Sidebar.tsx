import React from 'react';
import { 
  LayoutDashboard, 
  ThermometerSnowflake, 
  ShieldAlert, 
  FileSearch, 
  Cpu, 
  Settings2,
  AlertCircle
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onSelectView }) => {
  const { activeAlerts, riskScore } = useSimulation();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'environment',
      label: 'Digital Environment',
      icon: ThermometerSnowflake,
      badge: null
    },
    {
      id: 'events',
      label: 'Security Events',
      icon: ShieldAlert,
      badge: activeAlerts.length > 0 ? activeAlerts.length : null,
      badgeColor: 'bg-red-500/80 text-white'
    },
    {
      id: 'forensics',
      label: 'Forensic Report',
      icon: FileSearch,
      badge: riskScore > 60 ? 'INCIDENT' : null,
      badgeColor: 'bg-amber-500/80 text-slate-950 font-bold'
    },
    {
      id: 'architecture',
      label: 'System Architecture',
      icon: Cpu,
      badge: 'ESP32/RPi'
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: Settings2,
      badge: null
    }
  ];

  return (
    <aside className="w-full md:w-64 bg-[#080d19] border-r border-[#15233c] flex flex-col justify-between shrink-0">
      <div className="p-3">
        {/* System Subtitle */}
        <div className="px-3 py-2 mb-2 rounded-md bg-[#0d1627] border border-[#1b2b48] text-xs text-slate-400">
          <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 font-semibold mb-1">
            <span>COLD-CHAIN DEFENSE</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              ONLINE
            </span>
          </div>
          <div className="text-[10px] text-slate-400 leading-relaxed">
            Cryptographic interlocks, dual-sensor coherence & SHA-256 evidence logging
          </div>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/60 text-cyan-300 border border-cyan-500/40 glow-cyan font-semibold'
                    : 'text-slate-300 hover:bg-[#101b2f] hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    item.badgeColor || 'bg-[#18263e] text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer info box */}
      <div className="p-3 border-t border-[#15233c] bg-[#070b14]/60">
        <div className="p-2.5 rounded-lg bg-[#0c1424] border border-[#1b2a47] space-y-1.5 text-[11px]">
          <div className="flex items-center gap-1.5 text-cyan-300 font-medium">
            <AlertCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Research Evaluation</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            College Cybersecurity Simulator: Evaluates cyber-physical sensor attacks, replay vulnerabilities, and tamper-evident logging.
          </p>
          <div className="pt-1 text-[9px] font-mono text-slate-400 flex justify-between">
            <span>TARGET: 2°C – 8°C</span>
            <span>AIR ISOLATION</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

