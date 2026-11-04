import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  Cpu, 
  Server, 
  ShieldAlert, 
  Radio, 
  DoorClosed, 
  Fan, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Layers, 
  Eye, 
  FileText,
  Zap,
  Info
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const { 
    actualTemp, 
    doorOpen, 
    coolingActive, 
    networkOnline, 
    esp32SafetyInterlockTriggered,
    simulateReplayAttack,
    simulateUnauthorizedCommand
  } = useSimulation();

  const [selectedNode, setSelectedNode] = useState<string>('esp32');

  const nodes = [
    {
      id: 'sensors',
      title: 'Edge Sensors & Actuator',
      subtitle: 'Physical Transducers',
      icon: Radio,
      color: 'border-cyan-500/50 text-cyan-300 bg-cyan-950/20',
      activeStatus: 'NOMINAL',
      protocol: '1-Wire, I2C, Dry Contact GPIO, 24V Relay',
      role: 'Measures chamber internal physics and actuates 3.2kW refrigeration compressor.',
      details: 'Dual sensors (DS18B20 & SHT40) prevent single-point-of-failure or probe spoofing blindness. Door magnetic switch detects vault perimeter breach.'
    },
    {
      id: 'esp32',
      title: 'ESP32 Interlock Controller',
      subtitle: 'Hardware Safety Boundary',
      icon: Cpu,
      color: 'border-blue-500/50 text-blue-300 bg-blue-950/20',
      activeStatus: esp32SafetyInterlockTriggered ? 'DEFENSE ACTIVE' : 'MONITORING',
      protocol: 'FreeRTOS, Hardware Crypto (AES-GCM, SHA-256)',
      role: 'Simulated command validation, nonce verification, and hardwired immutable safety rules.',
      details: 'Evaluates commands against fixed physical rules (e.g., never shut down compressor if temp > 8°C without physical key; reject replayed nonces). Hardware interlock CANNOT be overridden by cloud or software!'
    },
    {
      id: 'rpi',
      title: 'Raspberry Pi Gateway',
      subtitle: 'Industrial Edge Broker',
      icon: Server,
      color: 'border-purple-500/50 text-purple-300 bg-purple-950/20',
      activeStatus: networkOnline ? 'CONNECTED' : 'DISCONNECTED',
      protocol: 'MQTT over TLS, Local SQLite Forensic Cache',
      role: 'Local telemetry aggregator, store-and-forward edge cache, network boundary.',
      details: 'Aggregates ESP32 telemetry, maintains local offline ledger if wide-area network drops, and signs periodic telemetry frames with SHA-256 digests.'
    },
    {
      id: 'analytics',
      title: 'ColdTrace-AI Engine',
      subtitle: 'Cyber-Physical Reasoning',
      icon: ShieldAlert,
      color: 'border-amber-500/50 text-amber-300 bg-amber-950/20',
      activeStatus: 'ANALYZING',
      protocol: 'Continuous Rule Heuristics & Divergence Models',
      role: 'Analyzes anomalies, disambiguates operational faults from cyberattacks, computes risk scores.',
      details: 'Important: ColdTrace-AI is an advisory and forensic detection platform. The AI does NOT directly control safety-critical refrigeration equipment, preserving safety interlock integrity.'
    },
    {
      id: 'dashboard',
      title: 'HMI & Forensic Portal',
      subtitle: 'Presentation & Evidence',
      icon: FileText,
      color: 'border-emerald-500/50 text-emerald-300 bg-emerald-950/20',
      activeStatus: 'PRESENTING',
      protocol: 'WebCrypto SHA-256 Verification, JSON/CSV Export',
      role: 'Real-time operator visibility, alert triaging, timeline reconstruction, and cryptographic audit.',
      details: 'Provides operators and forensic investigators with verifiable event evidence and guided remediation plans.'
    }
  ];

  const currentNode = nodes.find(n => n.id === selectedNode) || nodes[1];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="rounded-xl border border-[#1b2b48] bg-[#080e1b] p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Cyber-Physical Security Architecture Pipeline</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101b30] text-cyan-300 border border-[#1c2e52]">
                  ZERO-TRUST IOT
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Data pipeline from edge sensor transducers to ESP32 interlock, Raspberry Pi gateway, and ColdTrace-AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={simulateReplayAttack}
              className="px-3 py-1.5 rounded-md bg-red-950/40 hover:bg-red-900/40 text-red-300 border border-red-500/40 text-xs font-mono font-medium transition-colors"
            >
              Test ESP32 Interlock Defense
            </button>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Flowchart */}
      <div className="rounded-xl border border-[#1b2b48] bg-[#080e1b] p-6 shadow-xl overflow-x-auto">
        <div className="min-w-[850px] flex items-center justify-between gap-3 relative py-4">
          
          {nodes.map((node, index) => {
            const Icon = node.icon;
            const isSelected = selectedNode === node.id;

            return (
              <React.Fragment key={node.id}>
                <div 
                  onClick={() => setSelectedNode(node.id)}
                  className={`flex-1 rounded-xl border p-4 cursor-pointer transition-all duration-300 ${
                    isSelected 
                      ? 'bg-[#0f1b33] border-cyan-400 glow-cyan scale-105 z-10' 
                      : 'bg-[#0a1222] border-[#182845] hover:border-[#243e6b]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg border ${node.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#101c32] text-slate-300 border border-[#1c2e50]">
                      STEP {index + 1}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white tracking-wide">
                    {node.title}
                  </h4>
                  <div className="text-[10px] text-slate-400 mb-2 font-mono">
                    {node.subtitle}
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Status:</span>
                    <span className="font-mono text-cyan-300 font-bold">{node.activeStatus}</span>
                  </div>
                </div>

                {index < nodes.length - 1 && (
                  <div className="flex flex-col items-center justify-center shrink-0 px-1 text-slate-500">
                    <ArrowRight className="w-5 h-5 text-cyan-500 animate-pulse" />
                    <span className="text-[9px] font-mono text-slate-400 mt-1">telemetry</span>
                  </div>
                )}
              </React.Fragment>
            );
          })}

        </div>
      </div>

      {/* Selected Node Inspector Details & Safety Principle */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Inspector Card */}
        <div className="lg:col-span-7 rounded-xl border border-[#1b2b48] bg-[#080e1b] p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#182845]">
            <div className="p-1.5 rounded-lg bg-blue-950/60 text-blue-400 border border-blue-800/40">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Component Inspector: {currentNode.title}
              </h4>
              <p className="text-[11px] text-slate-400">
                Detailed hardware specification and security boundary
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs leading-relaxed">
            <div>
              <span className="text-slate-400 block font-mono text-[10px] uppercase">Primary Architectural Role:</span>
              <p className="text-slate-200 mt-0.5">{currentNode.role}</p>
            </div>

            <div>
              <span className="text-slate-400 block font-mono text-[10px] uppercase">Protocols & Bus Interface:</span>
              <p className="text-cyan-300 font-mono mt-0.5">{currentNode.protocol}</p>
            </div>

            <div>
              <span className="text-slate-400 block font-mono text-[10px] uppercase">Cyber-Physical Implementation Details:</span>
              <p className="text-slate-300 mt-0.5">{currentNode.details}</p>
            </div>
          </div>
        </div>

        {/* Right: Explicit Research Principles & Safety Isolation */}
        <div className="lg:col-span-5 rounded-xl border border-[#1b2b48] bg-[#0c1424] p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#182845]">
            <div className="p-1.5 rounded-lg bg-amber-950/60 text-amber-400 border border-amber-800/40">
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">
              Critical Safety Separation Principles
            </h4>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-2.5 rounded-lg bg-[#070b14] border border-[#182845] space-y-1">
              <strong className="text-cyan-300 font-mono block">1. ESP32 Interlock Isolation:</strong>
              <p className="text-slate-400 text-[11px]">
                The ESP32 microcontroller enforces deterministic safety rules in hardware. If an actuator command would breach cold-chain safety limits or contains an invalid nonce, it is immediately discarded at the interlock level.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-[#070b14] border border-[#182845] space-y-1">
              <strong className="text-amber-300 font-mono block">2. AI Advisory Separation:</strong>
              <p className="text-slate-400 text-[11px]">
                ColdTrace-AI acts purely as an analytics and forensic reasoning engine. It does <span className="text-white underline">NOT</span> directly control safety-critical actuators, preventing software glitches or adversarial prompt injections from destabilizing the refrigeration plant.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-[#070b14] border border-[#182845] space-y-1">
              <strong className="text-purple-300 font-mono block">3. Cryptographic Nonce Sliders:</strong>
              <p className="text-slate-400 text-[11px]">
                Every actuator modification frame must carry a monotonically incrementing nonce signed with HMAC. Replay attacks are rejected before the relay can toggle.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

