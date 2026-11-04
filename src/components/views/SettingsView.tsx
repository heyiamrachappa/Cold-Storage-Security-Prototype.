import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Settings2, Sliders, Shield, RotateCcw, Check, Info } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    targetMin,
    targetMax,
    sensorDeltaThreshold,
    simulationSpeed,
    simulationRunning,
    setTargetRange,
    setSimulationSpeed,
    resetEnvironment
  } = useSimulation();

  const [minVal, setMinVal] = useState(targetMin);
  const [maxVal, setMaxVal] = useState(targetMax);
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setTargetRange(minVal, maxVal);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="rounded-xl border border-[#1b2b48] bg-[#080e1b] p-5 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#182845]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">ColdTrace-AI System Configuration</h3>
              <p className="text-[11px] text-slate-400">Configure safety thresholds, detection sensitivity, and simulation clock</p>
            </div>
          </div>

          <button
            onClick={resetEnvironment}
            className="px-3 py-1.5 rounded bg-[#132036] hover:bg-[#1a2c4a] text-slate-300 border border-[#21355a] text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Baseline</span>
          </button>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleSave} className="space-y-5">
          {/* Target Cold-Chain Range */}
          <div className="p-4 rounded-lg bg-[#0c1424] border border-[#1a2a46] space-y-3">
            <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Cold-Chain Safe Temperature Envelope</span>
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Standard pharmaceutical and vaccine temperature regulation limits (e.g., WHO/CDC standard 2.0°C to 8.0°C). Excursions outside this envelope trigger operational alerts.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Minimum Allowable Temp (°C):</label>
                <input
                  type="number"
                  step="0.5"
                  value={minVal}
                  onChange={(e) => setMinVal(parseFloat(e.target.value))}
                  className="w-full bg-[#070b14] border border-[#1b2b48] rounded px-3 py-2 text-xs font-mono text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Maximum Allowable Temp (°C):</label>
                <input
                  type="number"
                  step="0.5"
                  value={maxVal}
                  onChange={(e) => setMaxVal(parseFloat(e.target.value))}
                  className="w-full bg-[#070b14] border border-[#1b2b48] rounded px-3 py-2 text-xs font-mono text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Sensor Divergence Threshold */}
          <div className="p-4 rounded-lg bg-[#0c1424] border border-[#1a2a46] space-y-2">
            <h4 className="text-xs font-bold text-amber-300 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Sensor Divergence Threshold (Δ Threshold)</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              When <code className="text-amber-300 font-mono">|T_primary - T_reference| &gt; {sensorDeltaThreshold}°C</code>, ColdTrace-AI flags a potential sensor probe failure, ground drift, or deliberate spoofing injection.
            </p>
            <div className="pt-2">
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Threshold:</span>
                <span className="font-mono text-amber-400 font-bold">{sensorDeltaThreshold}°C</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={sensorDeltaThreshold}
                disabled
                className="w-full accent-amber-400 bg-[#162540] h-1.5 rounded-lg opacity-80 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                Factory calibrated to 1.8°C standard deviation tolerance
              </span>
            </div>
          </div>

          {/* Simulation Clock Rate */}
          <div className="p-4 rounded-lg bg-[#0c1424] border border-[#1a2a46] space-y-2">
            <h4 className="text-xs font-bold text-slate-200">Simulation Clock Multiplier</h4>
            <p className="text-[11px] text-slate-400">
              Controls physical simulation tick rate: 1x real-time (1 second / tick), 2x, or 4x rapid evaluation.
            </p>

            <div className="flex items-center gap-3 pt-1">
              {[0.5, 1, 2, 4].map(spd => (
                <button
                  type="button"
                  key={spd}
                  onClick={() => setSimulationSpeed(spd)}
                  className={`px-3 py-1.5 rounded text-xs font-mono font-bold border transition-colors ${
                    simulationSpeed === spd
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                      : 'bg-[#070b14] text-slate-300 border-[#1c2c49] hover:border-slate-400'
                  }`}
                >
                  {spd}x Multiplier
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-emerald-400 flex items-center gap-1.5">
              {savedMessage && (
                <>
                  <Check className="w-4 h-4" />
                  <span>Configuration parameters saved to local memory!</span>
                </>
              )}
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg transition-all"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>

      {/* Simulator Meta Info */}
      <div className="p-4 rounded-lg bg-[#090f1e] border border-[#162642] flex items-start gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Digital Prototype Environment:</strong> All calculations, thermal updates, SHA-256 evidence digests, and simulated ESP32 interlock checks execute client-side directly in the browser runtime. No external backend, paid APIs, or physical microcontroller connections are required.
        </div>
      </div>
    </div>
  );
};
