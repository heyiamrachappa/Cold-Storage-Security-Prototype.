import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { ShieldCheck, ShieldAlert, AlertTriangle, Flame, Shield, Radio, Server, FileWarning } from 'lucide-react';

export const RiskGauge: React.FC = () => {
  const { riskScore, riskLevel, categoryScores } = useSimulation();

  // Colors and radial calculations
  const getScoreColor = () => {
    if (riskScore >= 81) return { text: 'text-red-400', stroke: '#ff1744', bg: 'bg-red-500/15', border: 'border-red-500/40' };
    if (riskScore >= 61) return { text: 'text-orange-400', stroke: '#ff9100', bg: 'bg-orange-500/15', border: 'border-orange-500/40' };
    if (riskScore >= 31) return { text: 'text-amber-400', stroke: '#ffb300', bg: 'bg-amber-500/15', border: 'border-amber-500/40' };
    return { text: 'text-emerald-400', stroke: '#00e676', bg: 'bg-emerald-500/15', border: 'border-emerald-500/40' };
  };

  const colors = getScoreColor();
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (riskScore / 100) * circumference;

  return (
    <div className="rounded-xl border border-[#1b2b48] bg-[#080e1b] p-4 shadow-xl">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#182845]">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg border ${colors.bg} ${colors.border}`}>
            {riskScore > 60 ? (
              <ShieldAlert className={`w-4 h-4 ${colors.text}`} />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">ColdTrace-AI Composite Risk Engine</h3>
            <p className="text-[11px] text-slate-400">Multi-factor cyber-physical anomaly score (0–100)</p>
          </div>
        </div>

        <span className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-bold border ${colors.bg} ${colors.text} ${colors.border}`}>
          {riskLevel.toUpperCase()} THREAT
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Left: Circular gauge */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center p-2">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="56"
                cy="56"
                r={radius}
                className="text-[#132038]"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Animated Progress circle */}
              <circle
                cx="56"
                cy="56"
                r={radius}
                stroke={colors.stroke}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className={`text-3xl font-extrabold font-mono leading-none ${colors.text}`}>
                {riskScore}
              </span>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5">/ 100</span>
            </div>
          </div>

          <div className="mt-2 text-center">
            <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
              {riskLevel} Risk Profile
            </span>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              {riskScore <= 30 && 'Operating in nominal tolerance'}
              {riskScore > 30 && riskScore <= 60 && 'Operational anomaly or mild drift'}
              {riskScore > 60 && riskScore <= 80 && 'Elevated discrepancy or compressor fault'}
              {riskScore > 80 && 'Critical breach or data integrity violation'}
            </div>
          </div>
        </div>

        {/* Right: 4 Anomaly Categories Breakdown */}
        <div className="sm:col-span-7 space-y-2.5">
          {/* 1. Operational Anomaly */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Operational Anomaly</span>
              </div>
              <span className="font-mono text-xs font-bold text-amber-300">
                {categoryScores.operational}%
              </span>
            </div>
            <div className="h-1.5 bg-[#14233c] rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-400 transition-all duration-500 rounded-full"
                style={{ width: `${categoryScores.operational}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-400 block mt-0.5">
              Target range breaches, door open duration, compressor stall
            </span>
          </div>

          {/* 2. Sensor Inconsistency */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sensor Inconsistency</span>
              </div>
              <span className="font-mono text-xs font-bold text-cyan-300">
                {categoryScores.sensorInconsistency}%
              </span>
            </div>
            <div className="h-1.5 bg-[#14233c] rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-400 transition-all duration-500 rounded-full"
                style={{ width: `${categoryScores.sensorInconsistency}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-400 block mt-0.5">
              DS18B20 vs SHT40 divergence, sensor freeze, disconnected telemetry
            </span>
          </div>

          {/* 3. Suspicious Cyber Activity */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                <Server className="w-3.5 h-3.5 text-red-400" />
                <span>Suspicious Cyber Activity</span>
              </div>
              <span className="font-mono text-xs font-bold text-red-400">
                {categoryScores.suspiciousCyber}%
              </span>
            </div>
            <div className="h-1.5 bg-[#14233c] rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-400 transition-all duration-500 rounded-full"
                style={{ width: `${categoryScores.suspiciousCyber}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-400 block mt-0.5">
              Replay attacks, unauthorized override commands, network blackout
            </span>
          </div>

          {/* 4. Evidence Integrity */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                <FileWarning className="w-3.5 h-3.5 text-purple-400" />
                <span>Evidence Integrity</span>
              </div>
              <span className="font-mono text-xs font-bold text-purple-400">
                {categoryScores.evidenceIntegrity}%
              </span>
            </div>
            <div className="h-1.5 bg-[#14233c] rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-400 transition-all duration-500 rounded-full"
                style={{ width: `${categoryScores.evidenceIntegrity}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-400 block mt-0.5">
              SHA-256 tamper verification, historical ledger mismatch
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

