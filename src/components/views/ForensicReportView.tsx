import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { EvidenceTable } from '../EvidenceTable';
import { 
  FileSearch, 
  Download, 
  FileText, 
  FileCode, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Search, 
  RefreshCw, 
  Layers, 
  Terminal,
  Activity
} from 'lucide-react';

export const ForensicReportView: React.FC = () => {
  const { 
    forensicReport, 
    generateForensicReport, 
    exportForensicReport,
    riskScore,
    riskLevel
  } = useSimulation();

  if (!forensicReport) {
    return (
      <div className="rounded-xl border border-[#1b2b48] bg-[#080e1b] p-8 text-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-400 mb-2" />
        <p>Compiling forensic incident telemetry...</p>
      </div>
    );
  }

  const isCritical = forensicReport.severity === 'critical';

  return (
    <div className="space-y-6">
      {/* Top Banner: Incident Title, Severity, and Export Actions */}
      <div className={`rounded-xl border p-5 shadow-xl transition-all ${
        isCritical 
          ? 'bg-gradient-to-r from-red-950/40 via-[#0c1424] to-[#080e1b] border-red-500/50 glow-red' 
          : 'bg-gradient-to-r from-amber-950/30 via-[#0c1424] to-[#080e1b] border-amber-500/40 glow-amber'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wider ${
                isCritical ? 'bg-red-600 text-white' : 'bg-amber-500 text-slate-950'
              }`}>
                {forensicReport.severity} SEVERITY
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#101c32] text-cyan-300 border border-[#1b2d4e]">
                CATEGORY: {forensicReport.category}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Triggered: {forensicReport.incidentStartTime}
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-white tracking-tight">
              {forensicReport.incidentTitle}
            </h2>

            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              <strong className="text-cyan-400">Root Trigger:</strong> {forensicReport.flaggedReason}
            </p>
          </div>

          {/* Export Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => generateForensicReport()}
              className="px-3 py-2 rounded-lg bg-[#111e33] hover:bg-[#182945] text-slate-200 border border-[#21355a] text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Re-run forensic heuristics across live telemetry"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Refresh Analysis</span>
            </button>

            <button
              onClick={() => exportForensicReport('json')}
              className="px-3 py-2 rounded-lg bg-[#14233c] hover:bg-[#1b3052] text-cyan-300 border border-cyan-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={() => exportForensicReport('text')}
              className="px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-600/20 transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download Official Report (.txt)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Forensic Grid: Observed Telemetry vs Root Causes vs Remediation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Observed Physical & Cyber Telemetry State */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl border border-[#1b2b48] bg-[#080e1b] p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#182845]">
              <div className="p-1.5 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-100">
                Observed Physical & Cyber Telemetry
              </h3>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 rounded bg-[#0b1322] border border-[#162540]">
                <span className="text-slate-400">Primary Sensor (DS18B20):</span>
                <span className="font-bold text-amber-300">{forensicReport.observedValues.primaryTemp}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-[#0b1322] border border-[#162540]">
                <span className="text-slate-400">Reference Sensor (SHT40):</span>
                <span className="font-bold text-cyan-300">{forensicReport.observedValues.referenceTemp}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-[#0b1322] border border-[#162540]">
                <span className="text-slate-400">Cold Storage Vault Door:</span>
                <span className="font-bold text-slate-200">{forensicReport.observedValues.doorState}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-[#0b1322] border border-[#162540]">
                <span className="text-slate-400">Cooling Actuator / Compressor:</span>
                <span className="font-bold text-slate-200">{forensicReport.observedValues.coolingState}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-[#0b1322] border border-[#162540]">
                <span className="text-slate-400">Gateway Telemetry Uplink:</span>
                <span className="font-bold text-slate-200">{forensicReport.observedValues.networkState}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-[#0b1322] border border-[#162540]">
                <span className="text-slate-400">Audit Ledger Hash Chain:</span>
                <span className={`font-bold ${forensicReport.evidenceIntegrityStatus === 'VERIFIED' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {forensicReport.evidenceIntegrityStatus}
                </span>
              </div>
            </div>

            {/* Affected System Components */}
            <div className="pt-2 border-t border-[#162540] space-y-1.5">
              <span className="text-xs font-semibold text-slate-300 block">Identified Target Components:</span>
              <div className="flex flex-wrap gap-1.5">
                {forensicReport.affectedComponents.map((comp, idx) => (
                  <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0f1b2f] text-slate-300 border border-[#1c3053]">
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Related Network or Interlock Commands */}
          <div className="rounded-xl border border-[#1b2b48] bg-[#080e1b] p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#182845]">
              <div className="p-1.5 rounded-lg bg-purple-950/60 text-purple-400 border border-purple-800/40">
                <Terminal className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-100">
                ESP32 Interlock Command Audit
              </h3>
            </div>

            <div className="space-y-2">
              {forensicReport.relatedNetworkOrCommandEvents.map((cmd, idx) => (
                <div key={idx} className="p-2.5 rounded bg-[#0a1220] border border-[#15233c] text-[11px] font-mono text-slate-300 leading-relaxed">
                  {cmd}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Expert Deduction, Root Causes, Remediation & Conclusion */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Forensic Conclusion Box */}
          <div className="rounded-xl border border-cyan-500/40 bg-[#091224] p-5 shadow-xl space-y-3 glow-cyan">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
                <FileSearch className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                ColdTrace-AI Forensic Conclusion
              </h3>
            </div>

            <blockquote className="p-3.5 rounded-lg bg-[#060b14] border-l-4 border-cyan-400 text-xs text-slate-200 font-mono leading-relaxed italic">
              “{forensicReport.conclusion}”
            </blockquote>

            <p className="text-[11px] text-slate-400 leading-normal">
              Note: This automated triage report correlates multi-point temporal telemetry, hardware interlock drop counters, and cryptographic hash verification to separate benign operational drift from adversarial cyber-physical interference.
            </p>
          </div>

          {/* Probable Root Causes */}
          <div className="rounded-xl border border-[#1b2b48] bg-[#080e1b] p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#182845]">
              <div className="p-1.5 rounded-lg bg-amber-950/60 text-amber-400 border border-amber-800/40">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-100">
                Hypothesized Root Causes
              </h3>
            </div>

            <ul className="space-y-2 text-xs">
              {forensicReport.possibleCauses.map((cause, idx) => (
                <li key={idx} className="flex items-start gap-2.5 p-2 rounded bg-[#0d1627] border border-[#182845] text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{cause}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Investigation Steps */}
          <div className="rounded-xl border border-[#1b2b48] bg-[#080e1b] p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#182845]">
              <div className="p-1.5 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-100">
                Recommended Forensic Actions & Protocol Steps
              </h3>
            </div>

            <ul className="space-y-2 text-xs">
              {forensicReport.recommendedSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5 p-2 rounded bg-[#0d1627] border border-[#182845] text-slate-200">
                  <span className="text-emerald-400 font-bold shrink-0">[+]</span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>

      {/* Embedded Forensic Evidence Table */}
      <EvidenceTable />
    </div>
  );
};

