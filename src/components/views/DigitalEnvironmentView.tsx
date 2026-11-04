import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { ColdRoomGraphic } from '../ColdRoomGraphic';
import { 
  Sliders, 
  ThermometerSnowflake, 
  DoorOpen, 
  DoorClosed, 
  Fan, 
  ShieldAlert, 
  RotateCcw, 
  Plus, 
  Minus, 
  Radio, 
  Wifi, 
  WifiOff, 
  Repeat, 
  Lock, 
  FileCheck2, 
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const DigitalEnvironmentView: React.FC = () => {
  const {
    actualTemp,
    ambientTemp,
    targetMin,
    targetMax,
    doorOpen,
    doorOpenSeconds,
    coolingActive,
    disturbance,
    primarySensor,
    referenceSensor,
    networkOnline,
    simulationRunning,
    simulationSpeed,
    setActualTempDirectly,
    adjustActualTemp,
    setTargetRange,
    setAmbientTemp,
    setDisturbance,
    toggleDoor,
    toggleCooling,
    resetEnvironment,
    setPrimarySensorStatus,
    setPrimarySensorBias,
    setPrimarySensorSpoofedValue,
    toggleReferenceSensorStatus,
    restoreSensorsNormal,
    simulateUnauthorizedCommand,
    simulateReplayAttack,
    simulateNetworkInterruption,
    simulateSensorManipulation,
    simulateEvidenceTampering
  } = useSimulation();

  const [customNumericTemp, setCustomNumericTemp] = useState<string>(actualTemp.toFixed(1));
  const [minInput, setMinInput] = useState<string>(targetMin.toString());
  const [maxInput, setMaxInput] = useState<string>(targetMax.toString());

  const handleApplyDirectTemp = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customNumericTemp);
    if (!isNaN(val)) {
      setActualTempDirectly(Math.max(-10, Math.min(30, val)));
    }
  };

  const handleApplyTargetRange = (e: React.FormEvent) => {
    e.preventDefault();
    const minVal = parseFloat(minInput);
    const maxVal = parseFloat(maxInput);
    if (!isNaN(minVal) && !isNaN(maxVal) && minVal < maxVal) {
      setTargetRange(minVal, maxVal);
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual illustration banner */}
      <ColdRoomGraphic />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Thermal Environment Controls (Temperature, Ambient, Target Range, Door, Cooling) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Card: Primary Thermal Controls */}
          <div className="rounded-xl border border-[#1b2b48] bg-[#080e1b] p-5 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#182845]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
                  <ThermometerSnowflake className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Thermal Engine Controls</h3>
                  <p className="text-[11px] text-slate-400">Directly alter thermal state and physics variables</p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800/40">
                {actualTemp > 0 ? `+${actualTemp.toFixed(1)}` : actualTemp.toFixed(1)}°C
              </span>
            </div>

            {/* Continuous Temperature Slider (-10°C to 30°C) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="text-slate-300 font-medium">Chamber Temperature Slider (-10°C to 30°C):</label>
                <span className="font-mono text-cyan-300 font-bold">{actualTemp.toFixed(1)}°C</span>
              </div>
              <input
                type="range"
                min="-10"
                max="30"
                step="0.1"
                value={actualTemp}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setActualTempDirectly(val);
                  setCustomNumericTemp(val.toFixed(1));
                }}
                className="w-full accent-cyan-400 bg-[#14233c] h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>-10°C (Deep Freeze)</span>
                <span className="text-emerald-400">2°C–8°C (Safe Range)</span>
                <span>30°C (Warm Ambient)</span>
              </div>
            </div>

            {/* Stepper Buttons & Numeric Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Stepper Buttons */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium block">Step Adjustment:</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => adjustActualTemp(-1.0)}
                    className="flex-1 py-1.5 rounded-md bg-[#131f35] hover:bg-[#1a2b48] border border-[#23385e] text-xs font-mono font-bold text-cyan-300 flex items-center justify-center gap-1 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>-1.0°C</span>
                  </button>
                  <button
                    onClick={() => adjustActualTemp(1.0)}
                    className="flex-1 py-1.5 rounded-md bg-[#131f35] hover:bg-[#1a2b48] border border-[#23385e] text-xs font-mono font-bold text-amber-300 flex items-center justify-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+1.0°C</span>
                  </button>
                </div>
              </div>

              {/* Numeric Input */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium block">Exact Numeric Input (°C):</label>
                <form onSubmit={handleApplyDirectTemp} className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="-10"
                    max="30"
                    value={customNumericTemp}
                    onChange={(e) => setCustomNumericTemp(e.target.value)}
                    className="w-full bg-[#0d1627] border border-[#1b2b49] rounded-md px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-mono transition-colors"
                  >
                    Set
                  </button>
                </form>
              </div>
            </div>

            {/* Target Temperature Range Configuration */}
            <div className="pt-2 border-t border-[#162540] space-y-2">
              <label className="text-xs text-slate-300 font-medium block">
                Target Safe Storage Range [Min – Max] (°C):
              </label>
              <form onSubmit={handleApplyTargetRange} className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Min (°C)</span>
                  <input
                    type="number"
                    step="0.5"
                    value={minInput}
                    onChange={(e) => setMinInput(e.target.value)}
                    className="w-full bg-[#0d1627] border border-[#1b2b49] rounded-md px-2 py-1 text-xs font-mono text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Max (°C)</span>
                  <input
                    type="number"
                    step="0.5"
                    value={maxInput}
                    onChange={(e) => setMaxInput(e.target.value)}
                    className="w-full bg-[#0d1627] border border-[#1b2b49] rounded-md px-2 py-1 text-xs font-mono text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-1.5 rounded-md bg-[#13223c] hover:bg-[#1a2e52] border border-[#203762] text-xs font-mono text-cyan-300 font-semibold transition-colors"
                  >
                    Apply Range
                  </button>
                </div>
              </form>
            </div>

            {/* Ambient Temperature & Thermal Disturbance */}
            <div className="pt-2 border-t border-[#162540] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Outside Ambient Temperature:</span>
                <span className="font-mono text-amber-300 font-bold">{ambientTemp.toFixed(1)}°C</span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                step="0.5"
                value={ambientTemp}
                onChange={(e) => setAmbientTemp(parseFloat(e.target.value))}
                className="w-full accent-amber-400 bg-[#14233c] h-1.5 rounded-lg cursor-pointer"
              />

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Internal Heat Disturbance (kW):</span>
                <span className="font-mono text-purple-300 font-bold">+{disturbance.toFixed(1)} kW</span>
              </div>
              <input
                type="range"
                min="0"
                max="3"
                step="0.2"
                value={disturbance}
                onChange={(e) => setDisturbance(parseFloat(e.target.value))}
                className="w-full accent-purple-400 bg-[#14233c] h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Door & Cooling Hardware Toggles */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={toggleDoor}
                className={`p-3 rounded-lg border text-left flex items-center gap-2.5 transition-all ${
                  doorOpen 
                    ? 'bg-amber-950/40 border-amber-500/60 text-amber-200 glow-amber' 
                    : 'bg-[#0f192b] border-[#1b2f52] text-slate-300 hover:border-slate-400'
                }`}
              >
                {doorOpen ? <DoorOpen className="w-5 h-5 text-amber-400" /> : <DoorClosed className="w-5 h-5 text-emerald-400" />}
                <div>
                  <div className="font-bold text-xs">{doorOpen ? 'Door: UNSEALED' : 'Door: SEALED'}</div>
                  <div className="text-[10px] text-slate-400">{doorOpen ? `${doorOpenSeconds}s open (Heat ingress)` : 'Insulation intact'}</div>
                </div>
              </button>

              <button
                onClick={toggleCooling}
                className={`p-3 rounded-lg border text-left flex items-center gap-2.5 transition-all ${
                  coolingActive 
                    ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200 glow-cyan' 
                    : 'bg-red-950/40 border-red-500/50 text-red-200'
                }`}
              >
                <Fan className={`w-5 h-5 ${coolingActive ? 'text-cyan-400 animate-spin' : 'text-red-400'}`} style={{ animationDuration: '2s' }} />
                <div>
                  <div className="font-bold text-xs">{coolingActive ? 'Cooling: ACTIVE' : 'Cooling: OFF'}</div>
                  <div className="text-[10px] text-slate-400">{coolingActive ? 'Compressor active' : 'Passive heat gain'}</div>
                </div>
              </button>
            </div>
          </div>

          {/* Thermal Model Physics Callout */}
          <div className="rounded-xl border border-[#1b2b48] bg-[#0c1424] p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold font-mono">
              <Info className="w-4 h-4" />
              <span>Simulated Heat Exchange Differential Equation</span>
            </div>
            <div className="p-2.5 rounded bg-[#070b14] border border-[#182845] font-mono text-[11px] text-cyan-200">
              T(t+1) = T(t) + k_leakage·(T_ambient - T(t)) - P_cooling + P_disturbance
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              When the door is opened, convective exchange coefficient <code className="text-cyan-300">k_leakage</code> increases by 10x, causing rapid influx of warm ambient air. Closing the door isolates the chamber, allowing the 3.2kW compressor to pull temperature down to safe limits.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Sensor Manipulation & Cybersecurity Controls */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Card: Sensor Array Manipulation & Fault Injection */}
          <div className="rounded-xl border border-[#1b2b48] bg-[#080e1b] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#182845]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-950/60 text-purple-400 border border-purple-800/40">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Sensor Array Manipulation</h3>
                  <p className="text-[11px] text-slate-400">Simulate ADC faults, calibration drift, and probe spoofing</p>
                </div>
              </div>

              <button
                onClick={restoreSensorsNormal}
                className="px-2.5 py-1 rounded bg-[#13223c] hover:bg-[#1a2d50] text-cyan-300 text-[11px] font-mono border border-[#1f365f] transition-colors"
              >
                Restore Normal
              </button>
            </div>

            {/* Primary Sensor Status Buttons */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Primary Sensor (DS18B20 1-Wire) Mode:</span>
                <span className="font-mono text-cyan-300 uppercase font-bold px-2 py-0.5 rounded bg-[#0f192b]">
                  {primarySensor.status} ({primarySensor.reading !== null ? `${primarySensor.reading}°C` : 'N/A'})
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => setPrimarySensorStatus('online')}
                  className={`p-2 rounded text-xs font-medium border text-center transition-all ${
                    primarySensor.status === 'online' 
                      ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 font-bold' 
                      : 'bg-[#0e1627] border-[#182744] text-slate-300 hover:text-white'
                  }`}
                >
                  Online (True)
                </button>

                <button
                  onClick={() => setPrimarySensorStatus('spoofed')}
                  className={`p-2 rounded text-xs font-medium border text-center transition-all ${
                    primarySensor.status === 'spoofed' 
                      ? 'bg-purple-950/60 border-purple-500/60 text-purple-300 font-bold glow-amber' 
                      : 'bg-[#0e1627] border-[#182744] text-slate-300 hover:text-white'
                  }`}
                >
                  Spoofed
                </button>

                <button
                  onClick={() => setPrimarySensorStatus('frozen')}
                  className={`p-2 rounded text-xs font-medium border text-center transition-all ${
                    primarySensor.status === 'frozen' 
                      ? 'bg-blue-950/60 border-blue-500/60 text-blue-300 font-bold' 
                      : 'bg-[#0e1627] border-[#182744] text-slate-300 hover:text-white'
                  }`}
                >
                  Frozen
                </button>

                <button
                  onClick={() => setPrimarySensorStatus('disconnected')}
                  className={`p-2 rounded text-xs font-medium border text-center transition-all ${
                    primarySensor.status === 'disconnected' 
                      ? 'bg-red-950/60 border-red-500/60 text-red-300 font-bold' 
                      : 'bg-[#0e1627] border-[#182744] text-slate-300 hover:text-white'
                  }`}
                >
                  Disconnected
                </button>
              </div>
            </div>

            {/* Spoofed Value Slider */}
            {primarySensor.status === 'spoofed' && (
              <div className="p-3 rounded-lg bg-[#140e1f] border border-purple-500/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-purple-300 font-medium">Injected Spoofed Temperature:</span>
                  <span className="font-mono text-purple-200 font-bold">{primarySensor.spoofedValue.toFixed(1)}°C</span>
                </div>
                <input
                  type="range"
                  min="-5"
                  max="35"
                  step="0.5"
                  value={primarySensor.spoofedValue}
                  onChange={(e) => setPrimarySensorSpoofedValue(parseFloat(e.target.value))}
                  className="w-full accent-purple-400 bg-[#211536] h-1.5 rounded-lg cursor-pointer"
                />
              </div>
            )}

            {/* Bias slider */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Sensor Bias Offset (Calibration drift):</span>
                <span className="font-mono text-amber-300 font-bold">{primarySensor.bias > 0 ? `+${primarySensor.bias.toFixed(1)}` : primarySensor.bias.toFixed(1)}°C</span>
              </div>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.2"
                value={primarySensor.bias}
                onChange={(e) => setPrimarySensorBias(parseFloat(e.target.value))}
                className="w-full accent-amber-400 bg-[#14233c] h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Reference Sensor (Secondary Channel) */}
            <div className="pt-3 border-t border-[#162540] flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-200">Secondary Channel: Reference SHT40 Sensor</div>
                <div className="text-[10px] text-slate-400">Current Reading: {referenceSensor.reading !== null ? `${referenceSensor.reading}°C` : 'OFFLINE'}</div>
              </div>

              <button
                onClick={toggleReferenceSensorStatus}
                className={`px-3 py-1.5 rounded text-xs font-medium border font-mono transition-colors ${
                  referenceSensor.status === 'online'
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-red-950/40 border-red-500/40 text-red-300'
                }`}
              >
                {referenceSensor.status === 'online' ? 'Disconnect Reference' : 'Reconnect Reference'}
              </button>
            </div>
          </div>

          {/* Card: Cybersecurity Controls & Attack Simulator */}
          <div className="rounded-xl border border-[#1b2b48] bg-[#080e1b] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#182845]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-red-950/60 text-red-400 border border-red-800/40">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Cybersecurity Adversary Attacks</h3>
                  <p className="text-[11px] text-slate-400">Evaluate defense interlocks and forensic anomaly detection</p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {/* 1. Unauthorized Command */}
              <div className="p-3 rounded-lg bg-[#0f1524] border border-[#1c2e4e] flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-orange-400" />
                    <span>Unauthorized Actuator Command</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Inject command to shut down cooling from an unauthenticated IP address
                  </div>
                </div>
                <button
                  onClick={simulateUnauthorizedCommand}
                  className="px-3 py-1.5 rounded bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border border-orange-500/40 text-xs font-semibold whitespace-nowrap transition-colors"
                >
                  Inject Attack
                </button>
              </div>

              {/* 2. Replay Attack */}
              <div className="p-3 rounded-lg bg-[#0f1524] border border-[#1c2e4e] flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Repeat className="w-3.5 h-3.5 text-red-400" />
                    <span>Replay Attack with Stale Nonce</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Re-transmit captured payload; ESP32 cryptographic interlock evaluates sliding window
                  </div>
                </div>
                <button
                  onClick={simulateReplayAttack}
                  className="px-3 py-1.5 rounded bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-semibold whitespace-nowrap transition-colors"
                >
                  Inject Replay
                </button>
              </div>

              {/* 3. Network Interruption */}
              <div className="p-3 rounded-lg bg-[#0f1524] border border-[#1c2e4e] flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    {networkOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-red-400" />}
                    <span>Gateway Network Disconnect</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Cut telemetry stream between ESP32 controller and Raspberry Pi edge broker
                  </div>
                </div>
                <button
                  onClick={simulateNetworkInterruption}
                  className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-colors border ${
                    networkOnline 
                      ? 'bg-amber-600/20 text-amber-300 border-amber-500/40 hover:bg-amber-600/30' 
                      : 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/30'
                  }`}
                >
                  {networkOnline ? 'Sever Link' : 'Restore Link'}
                </button>
              </div>

              {/* 4. Evidence Record Tampering */}
              <div className="p-3 rounded-lg bg-[#0f1524] border border-[#1c2e4e] flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-pink-400" />
                    <span>Evidence Database Tampering</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Mutate historical temperature record in database to trigger SHA-256 mismatch
                  </div>
                </div>
                <button
                  onClick={() => simulateEvidenceTampering(0)}
                  className="px-3 py-1.5 rounded bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/40 text-xs font-semibold whitespace-nowrap transition-colors"
                >
                  Mutate Record
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

