import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { 
  Fan, 
  DoorClosed, 
  DoorOpen, 
  Radio, 
  Thermometer, 
  Activity, 
  AlertTriangle,
  Snowflake,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  PackageCheck,
  Wrench,
  RotateCcw
} from 'lucide-react';

export const ColdRoomGraphic: React.FC = () => {
  const {
    actualTemp,
    ambientTemp,
    targetMin,
    targetMax,
    doorOpen,
    doorOpenSeconds,
    coolingActive,
    primarySensor,
    referenceSensor,
    toggleDoor,
    toggleCooling,
    setPrimarySensorStatus,
    remediateAndNormalize,
    isRemediating
  } = useSimulation();

  // Dynamic thermal atmosphere color gradient based on actual temp
  const getAtmosphereGradient = () => {
    if (actualTemp > 12) {
      return 'from-red-950/60 via-amber-950/40 to-slate-950/80';
    } else if (actualTemp > targetMax) {
      return 'from-amber-950/50 via-slate-900/50 to-slate-950/80';
    } else if (actualTemp < targetMin) {
      return 'from-cyan-900/60 via-blue-950/60 to-slate-950/90';
    } else {
      return 'from-cyan-950/40 via-blue-950/30 to-slate-950/90';
    }
  };

  const isSafeRange = actualTemp >= targetMin && actualTemp <= targetMax;

  return (
    <div className="relative rounded-xl border border-[#1b2b48] bg-[#080e1b] overflow-hidden shadow-2xl p-4">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />

      {/* Header bar of graphic */}
      <div className="relative z-10 flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-[#182845] gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
            <Thermometer className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Cold Storage Vault #1 — Cross-Sectional Chamber</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101b30] text-cyan-300 border border-[#1c2e52]">
                ISO-CLASS 7
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Dual-Probe Telemetry (DS18B20 1-Wire & SHT40 I2C) with Hardware Interlock
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 font-semibold ${
            isSafeRange 
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50' 
              : 'bg-red-950/40 text-red-400 border-red-800/50 animate-pulse'
          }`}>
            {isSafeRange ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            <span>{isSafeRange ? 'TARGET NOMINAL [2°C – 8°C]' : 'TEMPERATURE OUT OF RANGE'}</span>
          </div>

          <div className="px-2 py-1 rounded-md bg-[#0f192b] border border-[#1a2c4e] text-slate-300">
            Ambient: <span className="font-bold text-amber-300">{ambientTemp.toFixed(1)}°C</span>
          </div>
        </div>
      </div>

      {/* Main Chamber Graphic Area */}
      <div className={`relative h-80 sm:h-96 rounded-lg border-2 border-[#1c3055] bg-gradient-to-b ${getAtmosphereGradient()} p-4 overflow-hidden transition-all duration-700`}>
        
        {/* Cold Air Particle Mist / Haze */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {coolingActive && actualTemp < 10 && (
            <div className="absolute top-12 left-1/4 right-1/4 h-32 bg-cyan-400/5 blur-2xl rounded-full animate-pulse-slow" />
          )}
          {doorOpen && (
            <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-amber-500/20 to-transparent blur-md pointer-events-none" />
          )}
        </div>

        {/* CEILING: Industrial Cooling Evaporator Unit */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20">
          <div 
            onClick={toggleCooling}
            className={`cursor-pointer group flex items-center gap-3 px-4 py-2 rounded-lg border shadow-lg transition-all ${
              coolingActive 
                ? 'bg-[#0b172a] border-cyan-500/50 text-cyan-300 glow-cyan hover:border-cyan-400' 
                : 'bg-[#14121b] border-red-500/40 text-red-400 hover:border-red-400'
            }`}
            title="Click to toggle Cooling Compressor power"
          >
            <div className="relative">
              <Fan 
                className={`w-5 h-5 ${coolingActive ? 'animate-spin text-cyan-400' : 'text-slate-500'}`} 
                style={{ animationDuration: '1.2s' }} 
              />
              {coolingActive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              )}
            </div>
            <div className="text-left font-mono">
              <div className="text-[11px] font-bold flex items-center gap-1.5">
                <span>HVAC EVAPORATOR</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                  coolingActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-red-500/20 text-red-400'
                }`}>
                  {coolingActive ? 'ACTIVE' : 'OFF'}
                </span>
              </div>
              <div className="text-[9px] text-slate-400">
                {coolingActive ? 'Cooling power: 3.2 kW • Click to toggle' : 'Compressor disabled • Click to engage'}
              </div>
            </div>
          </div>
        </div>

        {/* LEFT WALL: Primary Temperature Sensor (DS18B20) */}
        <div className="absolute left-3 top-20 z-20">
          <div 
            onClick={() => {
              if (primarySensor.status === 'online') setPrimarySensorStatus('spoofed');
              else if (primarySensor.status === 'spoofed') setPrimarySensorStatus('frozen');
              else if (primarySensor.status === 'frozen') setPrimarySensorStatus('disconnected');
              else setPrimarySensorStatus('online');
            }}
            className={`cursor-pointer group p-2.5 rounded-lg border transition-all max-w-[190px] shadow-lg ${
              primarySensor.status === 'online'
                ? 'bg-[#0a1628]/90 border-cyan-500/40 text-cyan-300 hover:border-cyan-300'
                : primarySensor.status === 'disconnected'
                ? 'bg-[#181014]/90 border-slate-600 text-slate-400'
                : 'bg-[#1e131b]/95 border-amber-500/60 text-amber-300 glow-amber'
            }`}
            title="Click to cycle Primary Sensor modes (Online -> Spoofed -> Frozen -> Disconnected)"
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <div className="flex items-center gap-1 text-[11px] font-bold">
                <Radio className={`w-3.5 h-3.5 ${primarySensor.status === 'online' ? 'text-cyan-400' : 'text-amber-400'}`} />
                <span>PRIMARY (DS18B20)</span>
              </div>
              <span className={`text-[9px] font-mono px-1 rounded uppercase ${
                primarySensor.status === 'online' ? 'bg-cyan-900/60 text-cyan-300' : 'bg-amber-900/60 text-amber-300'
              }`}>
                {primarySensor.status}
              </span>
            </div>

            <div className="font-mono text-xl font-extrabold text-white">
              {primarySensor.reading !== null ? `${primarySensor.reading > 0 ? `+${primarySensor.reading.toFixed(1)}` : primarySensor.reading.toFixed(1)}°C` : 'OFFLINE'}
            </div>

            <div className="text-[9px] text-slate-400 mt-0.5 leading-tight">
              1-Wire bus #0 • Click to cycle modes
            </div>
          </div>

          {/* Mounting bracket line */}
          <div className="w-1 h-6 bg-slate-600 mx-auto" />
        </div>

        {/* RIGHT WALL: Reference Temperature Sensor (SHT40) */}
        <div className="absolute right-24 sm:right-32 top-20 z-20">
          <div className="p-2.5 rounded-lg border bg-[#091526]/90 border-cyan-500/30 text-cyan-300 max-w-[180px] shadow-lg">
            <div className="flex items-center justify-between gap-1 mb-1">
              <div className="flex items-center gap-1 text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>REFERENCE (SHT40)</span>
              </div>
              <span className="text-[9px] font-mono px-1 rounded bg-emerald-950/80 text-emerald-300 uppercase">
                {referenceSensor.status}
              </span>
            </div>

            <div className="font-mono text-xl font-extrabold text-emerald-300">
              {referenceSensor.reading !== null ? `${referenceSensor.reading > 0 ? `+${referenceSensor.reading.toFixed(1)}` : referenceSensor.reading.toFixed(1)}°C` : 'ERR'}
            </div>

            <div className="text-[9px] text-slate-400 mt-0.5 leading-tight">
              I2C secondary channel • Coherence check
            </div>
          </div>

          {/* Mounting bracket line */}
          <div className="w-1 h-6 bg-slate-600 mx-auto" />
        </div>

        {/* CENTER: Pharmaceutical Cold Storage Shelves with Inventory */}
        <div className="absolute bottom-4 left-16 sm:left-24 right-32 sm:right-40 h-36 bg-[#070d19]/80 rounded-lg border border-[#1b2d4c] p-2 flex flex-col justify-between z-10 backdrop-blur-sm">
          {/* Top Shelf */}
          <div className="border-b border-[#182845] pb-2 flex items-center justify-around">
            <div className="flex items-center gap-1 bg-[#0d182b] px-2 py-1 rounded border border-[#1b2f54] text-[10px] text-cyan-200">
              <PackageCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>mRNA Vaccines (Lot #402)</span>
            </div>
            <div className="flex items-center gap-1 bg-[#0d182b] px-2 py-1 rounded border border-[#1b2f54] text-[10px] text-cyan-200">
              <PackageCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Insulin Suspension (Glif-4)</span>
            </div>
          </div>

          {/* Middle Shelf: Actual Room Temperature Core Display */}
          <div className="flex items-center justify-between px-3 py-1">
            <div className="text-left font-mono">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider">True Physical Chamber Temp</span>
              <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                actualTemp > targetMax ? 'text-red-400' : actualTemp < targetMin ? 'text-cyan-300' : 'text-emerald-400'
              }`}>
                {actualTemp > 0 ? `+${actualTemp.toFixed(1)}` : actualTemp.toFixed(1)}°C
              </div>
            </div>

            <div className="text-right font-mono text-[10px] text-slate-400 space-y-0.5">
              <div>Safe Target: <span className="text-slate-200 font-bold">{targetMin}°C – {targetMax}°C</span></div>
              <div>Thermal Delta: <span className="text-slate-200 font-bold">{((actualTemp - ((targetMin + targetMax) / 2))).toFixed(1)}°C</span></div>
            </div>
          </div>

          {/* Bottom Shelf Floor */}
          <div className="border-t border-[#182845] pt-1 flex items-center justify-between text-[9px] text-slate-400 font-mono px-2">
            <span>R-404A Refrigerant Loop</span>
            <span>Passive Thermal Ingress: {doorOpen ? 'HIGH (Open Door)' : 'MINIMAL (Sealed)'}</span>
          </div>
        </div>

        {/* RIGHT: Heavy Vault Door with Open/Close Toggle */}
        <div className="absolute top-4 bottom-4 right-2 w-20 sm:w-24 z-30">
          <button
            onClick={toggleDoor}
            className={`w-full h-full rounded-lg border-2 flex flex-col items-center justify-center p-2 transition-all cursor-pointer shadow-2xl ${
              doorOpen
                ? 'bg-gradient-to-r from-amber-950/70 to-red-950/80 border-amber-500/80 text-amber-200 glow-amber translate-x-2'
                : 'bg-gradient-to-r from-[#121c2f] to-[#0c1424] border-slate-600 hover:border-cyan-400 text-slate-300'
            }`}
            title="Click to Open or Close Vault Door"
          >
            <div className="p-2 rounded-full bg-slate-900/80 border border-slate-700 mb-2">
              {doorOpen ? (
                <DoorOpen className="w-6 h-6 text-amber-400 animate-pulse" />
              ) : (
                <DoorClosed className="w-6 h-6 text-emerald-400" />
              )}
            </div>

            <span className="font-mono text-xs font-bold text-center block leading-tight">
              {doorOpen ? 'DOOR OPEN' : 'DOOR CLOSED'}
            </span>

            {doorOpen && (
              <span className="mt-1 text-[10px] font-mono px-1 rounded bg-amber-500/20 text-amber-300">
                {doorOpenSeconds}s
              </span>
            )}

            <span className="text-[9px] text-slate-400 mt-2 text-center leading-tight">
              Click to {doorOpen ? 'Seal' : 'Open'}
            </span>
          </button>
        </div>

      </div>

      {/* Quick interactive action toolbar under graphic */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
        <button
          onClick={toggleDoor}
          className={`p-2 rounded-lg border text-left flex items-center gap-2 font-medium transition-colors ${
            doorOpen 
              ? 'bg-amber-950/40 text-amber-300 border-amber-800/60' 
              : 'bg-[#0f192b] text-slate-300 border-[#1a2b48] hover:border-slate-500'
          }`}
        >
          {doorOpen ? <DoorOpen className="w-4 h-4 text-amber-400 shrink-0" /> : <DoorClosed className="w-4 h-4 text-slate-400 shrink-0" />}
          <div>
            <div className="font-semibold text-[11px]">{doorOpen ? 'Close Vault Door' : 'Open Vault Door'}</div>
            <div className="text-[9px] text-slate-400">{doorOpen ? 'Stop heat influx' : 'Simulate staff access'}</div>
          </div>
        </button>

        <button
          onClick={toggleCooling}
          className={`p-2 rounded-lg border text-left flex items-center gap-2 font-medium transition-colors ${
            coolingActive 
              ? 'bg-cyan-950/40 text-cyan-300 border-cyan-800/60' 
              : 'bg-red-950/40 text-red-300 border-red-800/60'
          }`}
        >
          <Fan className={`w-4 h-4 shrink-0 ${coolingActive ? 'text-cyan-400 animate-spin' : 'text-red-400'}`} style={{ animationDuration: '3s' }} />
          <div>
            <div className="font-semibold text-[11px]">{coolingActive ? 'Stop Compressor' : 'Start Compressor'}</div>
            <div className="text-[9px] text-slate-400">{coolingActive ? 'Cut HVAC cooling power' : 'Engage 3.2kW chiller'}</div>
          </div>
        </button>

        <button
          onClick={() => {
            if (primarySensor.status === 'spoofed') {
              setPrimarySensorStatus('online');
            } else {
              setPrimarySensorStatus('spoofed');
            }
          }}
          className={`p-2 rounded-lg border text-left flex items-center gap-2 font-medium transition-colors ${
            primarySensor.status === 'spoofed'
              ? 'bg-purple-950/40 text-purple-300 border-purple-800/60'
              : 'bg-[#0f192b] text-slate-300 border-[#1a2b48] hover:border-slate-500'
          }`}
        >
          <Radio className="w-4 h-4 text-purple-400 shrink-0" />
          <div>
            <div className="font-semibold text-[11px]">{primarySensor.status === 'spoofed' ? 'Restore Sensor' : 'Spoof Primary'}</div>
            <div className="text-[9px] text-slate-400">Trigger divergence</div>
          </div>
        </button>

        <button
          onClick={() => {
            if (primarySensor.status === 'frozen') {
              setPrimarySensorStatus('online');
            } else {
              setPrimarySensorStatus('frozen');
            }
          }}
          className={`p-2 rounded-lg border text-left flex items-center gap-2 font-medium transition-colors ${
            primarySensor.status === 'frozen'
              ? 'bg-blue-950/40 text-blue-300 border-blue-800/60'
              : 'bg-[#0f192b] text-slate-300 border-[#1a2b48] hover:border-slate-500'
          }`}
        >
          <Snowflake className="w-4 h-4 text-blue-400 shrink-0" />
          <div>
            <div className="font-semibold text-[11px]">{primarySensor.status === 'frozen' ? 'Unfreeze Sensor' : 'Freeze Reading'}</div>
            <div className="text-[9px] text-slate-400">Lock sensor in memory</div>
          </div>
        </button>

        <button
          onClick={() => remediateAndNormalize()}
          disabled={isRemediating}
          className={`col-span-2 sm:col-span-1 p-2 rounded-lg border text-left flex items-center gap-2 font-medium transition-all ${
            isRemediating
              ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 glow-cyan animate-pulse'
              : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/40 cursor-pointer'
          }`}
          title="Acknowledge and solve active issues, seal door, engage chiller, and normalize temperature back to 4.2°C"
        >
          <Wrench className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <div className="font-semibold text-[11px]">{isRemediating ? 'Normalizing...' : 'Solve & Normalize'}</div>
            <div className="text-[9px] text-slate-400">Recover temp to 4.2°C</div>
          </div>
        </button>
      </div>
    </div>
  );
};

