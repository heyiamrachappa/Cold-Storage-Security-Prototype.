import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { 
  AlertItem, 
  SecurityEvent, 
  EvidenceRecord, 
  TemperatureDataPoint, 
  ForensicReport,
  AnomalyCategory
} from '../types';
import { calculateNextTemperature } from '../utils/thermalModel';
import { calculateSHA256 } from '../utils/crypto';

interface CommandLog {
  id: string;
  command: string;
  nonce: string;
  timestamp: string;
  status: 'ACCEPTED' | 'REJECTED_STALE_NONCE' | 'REJECTED_UNAUTHORIZED';
  origin: string;
  details: string;
}

interface SimulationContextType {
  // Thermal & Env
  actualTemp: number;
  ambientTemp: number;
  targetMin: number;
  targetMax: number;
  doorOpen: boolean;
  doorOpenSeconds: number;
  coolingActive: boolean;
  disturbance: number;
  simulationRunning: boolean;
  simulationSpeed: number;
  sensorDeltaThreshold: number;
  
  // Sensors
  primarySensor: {
    reading: number | null;
    status: 'online' | 'frozen' | 'spoofed' | 'disconnected';
    bias: number;
    frozenValue: number | null;
    spoofedValue: number;
  };
  referenceSensor: {
    reading: number | null;
    status: 'online' | 'disconnected';
  };

  // Cyber & Interlock
  networkOnline: boolean;
  recentCommands: CommandLog[];
  esp32SafetyInterlockTriggered: boolean;
  usedNonces: Set<string>;

  // Detection & Score
  riskScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  categoryScores: {
    operational: number;
    sensorInconsistency: number;
    suspiciousCyber: number;
    evidenceIntegrity: number;
  };
  activeAlerts: AlertItem[];
  securityEvents: SecurityEvent[];
  temperatureHistory: TemperatureDataPoint[];
  evidenceRecords: EvidenceRecord[];
  forensicReport: ForensicReport | null;

  // Remediation & Recovery State
  isRemediating: boolean;
  remediationStatus: string | null;

  // Actions
  setActualTempDirectly: (temp: number) => void;
  adjustActualTemp: (delta: number) => void;
  setTargetRange: (min: number, max: number) => void;
  setAmbientTemp: (temp: number) => void;
  setDisturbance: (val: number) => void;
  toggleDoor: () => void;
  toggleCooling: () => void;
  toggleSimulation: () => void;
  setSimulationSpeed: (speed: number) => void;
  resetEnvironment: () => void;
  remediateAndNormalize: (alertId?: string) => Promise<void>;

  // Sensor Actions
  setPrimarySensorStatus: (status: 'online' | 'frozen' | 'spoofed' | 'disconnected') => void;
  setPrimarySensorBias: (bias: number) => void;
  setPrimarySensorSpoofedValue: (val: number) => void;
  toggleReferenceSensorStatus: () => void;
  restoreSensorsNormal: () => void;

  // Cyber Actions
  simulateUnauthorizedCommand: () => void;
  simulateReplayAttack: () => void;
  simulateNetworkInterruption: () => void;
  simulateSensorManipulation: () => void;
  simulateEvidenceTampering: (recordIndex?: number) => void;
  verifyEvidenceIntegrity: () => Promise<boolean>;

  // Scenarios
  loadScenario: (scenario: 'normal' | 'excursion' | 'sensor_spoof' | 'cooling_fail' | 'replay_attack' | 'evidence_tamper') => void;

  // Forensics & Alerts
  generateForensicReport: () => void;
  exportForensicReport: (format: 'json' | 'text') => void;
  acknowledgeAlert: (id: string) => void;
  clearAlerts: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Environmental physics
  const [actualTemp, setActualTemp] = useState<number>(4.2);
  const [ambientTemp, setAmbientTemp] = useState<number>(24.0);
  const [targetMin, setTargetMin] = useState<number>(2.0);
  const [targetMax, setTargetMax] = useState<number>(8.0);
  const [doorOpen, setDoorOpen] = useState<boolean>(false);
  const [doorOpenSeconds, setDoorOpenSeconds] = useState<number>(0);
  const [coolingActive, setCoolingActive] = useState<boolean>(true);
  const [disturbance, setDisturbance] = useState<number>(0);
  const [simulationRunning, setSimulationRunning] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [sensorDeltaThreshold, setSensorDeltaThreshold] = useState<number>(1.8);

  // Sensor states
  const [primarySensor, setPrimarySensor] = useState<{
    reading: number | null;
    status: 'online' | 'frozen' | 'spoofed' | 'disconnected';
    bias: number;
    frozenValue: number | null;
    spoofedValue: number;
  }>({
    reading: 4.2,
    status: 'online',
    bias: 0.1,
    frozenValue: null,
    spoofedValue: 18.5,
  });

  const [referenceSensor, setReferenceSensor] = useState<{
    reading: number | null;
    status: 'online' | 'disconnected';
  }>({
    reading: 4.2,
    status: 'online',
  });

  // Cyber states
  const [networkOnline, setNetworkOnline] = useState<boolean>(true);
  const [esp32SafetyInterlockTriggered, setEsp32SafetyInterlockTriggered] = useState<boolean>(false);
  const [recentCommands, setRecentCommands] = useState<CommandLog[]>([
    {
      id: 'cmd-init-01',
      command: 'SET_COMPRESSOR_POWER_ON',
      nonce: 'a8f93e2b10',
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(),
      status: 'ACCEPTED',
      origin: 'AUTHORIZED_HMI',
      details: 'Command validated by ESP32 Interlock and executed.'
    }
  ]);
  const [usedNonces, setUsedNonces] = useState<Set<string>>(new Set(['a8f93e2b10']));

  // History & Evidence
  const [temperatureHistory, setTemperatureHistory] = useState<TemperatureDataPoint[]>(() => {
    const initData: TemperatureDataPoint[] = [];
    const now = Date.now();
    for (let i = 20; i >= 0; i--) {
      const t = now - i * 3000;
      const tempVal = 4.1 + Math.sin(i / 2) * 0.2;
      initData.push({
        time: new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        timestamp: t,
        actualTemp: parseFloat(tempVal.toFixed(1)),
        primaryReading: parseFloat((tempVal + 0.1).toFixed(1)),
        referenceReading: parseFloat(tempVal.toFixed(1)),
        ambientTemp: 24.0,
        targetMin: 2.0,
        targetMax: 8.0,
        doorOpen: false,
        coolingActive: true,
      });
    }
    return initData;
  });

  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([
    {
      id: 'evt-boot',
      timestamp: new Date(Date.now() - 60000).toLocaleTimeString(),
      type: 'DETECTION',
      severity: 'info',
      title: 'ColdTrace-AI Engine Initialized',
      description: 'System diagnostic OK. Monitoring primary DS18B20 & secondary SHT40 sensors.',
      component: 'Core Analytics Engine'
    }
  ]);

  const [evidenceRecords, setEvidenceRecords] = useState<EvidenceRecord[]>([]);
  const seqCounterRef = useRef<number>(1);

  // Alerts & Risk
  const [activeAlerts, setActiveAlerts] = useState<AlertItem[]>([]);
  const [riskScore, setRiskScore] = useState<number>(8);
  const [riskLevel, setRiskLevel] = useState<'Low' | 'Moderate' | 'High' | 'Critical'>('Low');
  const [categoryScores, setCategoryScores] = useState({
    operational: 5,
    sensorInconsistency: 0,
    suspiciousCyber: 0,
    evidenceIntegrity: 0
  });

  const [forensicReport, setForensicReport] = useState<ForensicReport | null>(null);

  // Remediation & Recovery State
  const [isRemediating, setIsRemediating] = useState<boolean>(false);
  const [remediationStatus, setRemediationStatus] = useState<string | null>(null);

  // Helper to append a timeline security event
  const addSecurityEvent = useCallback((
    type: SecurityEvent['type'],
    severity: SecurityEvent['severity'],
    title: string,
    description: string,
    component: string
  ) => {
    const newEvent: SecurityEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      severity,
      title,
      description,
      component
    };
    setSecurityEvents(prev => [newEvent, ...prev.slice(0, 79)]);
  }, []);

  // Helper to append a cryptographic evidence record
  const createEvidenceRecord = useCallback(async (
    eventType: string,
    description: string,
    primaryVal: number | null,
    refVal: number | null,
    door: boolean,
    cooling: boolean,
    network: boolean
  ) => {
    const seq = seqCounterRef.current++;
    const payload = {
      primaryTemp: primaryVal,
      referenceTemp: refVal,
      doorOpen: door,
      coolingActive: cooling,
      networkOnline: network,
      description
    };
    
    // Hash includes sequence, eventType and stringified sorted payload
    const canonicalStr = `${seq}|${eventType}|${JSON.stringify(payload, Object.keys(payload).sort())}`;
    const hash = await calculateSHA256(canonicalStr);

    const record: EvidenceRecord = {
      id: `evd-${seq}`,
      seqNumber: seq,
      timestamp: new Date().toLocaleTimeString(),
      eventType,
      payload,
      hash,
      isTampered: false,
      verificationResult: 'MATCH'
    };

    setEvidenceRecords(prev => [record, ...prev.slice(0, 49)]);
  }, []);

  // Seed initial evidence records once at startup
  useEffect(() => {
    const seed = async () => {
      await createEvidenceRecord('SYS_BOOT', 'Cold-storage interlock safe start check passed', 4.2, 4.2, false, true, true);
      await createEvidenceRecord('COOLING_CYCLE_NORMAL', 'Compressor modulation steady state at 4.2°C', 4.1, 4.2, false, true, true);
    };
    seed();
  }, [createEvidenceRecord]);

  // Main simulation tick loop
  useEffect(() => {
    if (!simulationRunning) return;

    const intervalTime = 1000 / simulationSpeed;
    const interval = setInterval(() => {
      // 1. Calculate physical heat delta
      setActualTemp(prevTemp => {
        const nextTemp = calculateNextTemperature({
          currentTemp: prevTemp,
          ambientTemp,
          coolingActive,
          doorOpen,
          disturbance,
          dt: 1,
          targetSetpoint: 4.2
        });

        // Small micro ambient noise ±0.02
        const noise = (Math.random() - 0.5) * 0.04;
        const noisyTemp = Math.round((nextTemp + noise) * 100) / 100;
        return noisyTemp;
      });

      // 2. Door timer
      setDoorOpenSeconds(prev => doorOpen ? prev + 1 : 0);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [simulationRunning, simulationSpeed, ambientTemp, coolingActive, doorOpen, disturbance]);

  // Monitor active remediation until temperature normalizes to 4.2°C
  useEffect(() => {
    if (!isRemediating) return;

    if (actualTemp >= targetMin && actualTemp <= 4.8 && !doorOpen && coolingActive) {
      setIsRemediating(false);
      setRemediationStatus(null);
      addSecurityEvent(
        'TEMP_CHANGE',
        'info',
        'Thermal Equilibrium Restored (4.2°C)',
        `Chamber has cooled back to nominal ${actualTemp.toFixed(1)}°C. Temperature normalized and safe cold-chain integrity verified.`,
        'Refrigeration Plant'
      );
      createEvidenceRecord(
        'THERMAL_RECOVERY_COMPLETE',
        `Chamber normalized at ${actualTemp.toFixed(1)}°C following remediation`,
        primarySensor.reading,
        referenceSensor.reading,
        doorOpen,
        coolingActive,
        networkOnline
      );
    }
  }, [isRemediating, actualTemp, targetMin, doorOpen, coolingActive, addSecurityEvent, createEvidenceRecord, primarySensor.reading, referenceSensor.reading, networkOnline]);

  // Update sensor readings when actual temperature or sensor config changes
  useEffect(() => {
    // Primary sensor computation
    let pVal: number | null = null;
    if (primarySensor.status === 'online') {
      const noise = (Math.random() - 0.5) * 0.06;
      pVal = Math.round((actualTemp + primarySensor.bias + noise) * 10) / 10;
    } else if (primarySensor.status === 'frozen') {
      pVal = primarySensor.frozenValue ?? 4.0;
    } else if (primarySensor.status === 'spoofed') {
      pVal = primarySensor.spoofedValue;
    } else if (primarySensor.status === 'disconnected') {
      pVal = null;
    }

    // Reference sensor computation
    let rVal: number | null = null;
    if (referenceSensor.status === 'online') {
      const noise = (Math.random() - 0.5) * 0.04;
      rVal = Math.round((actualTemp + noise) * 10) / 10;
    } else {
      rVal = null;
    }

    setPrimarySensor(prev => ({ ...prev, reading: pVal }));
    setReferenceSensor(prev => ({ ...prev, reading: rVal }));

    // Append to continuous temperature trend chart (limit to last 35 points)
    const now = Date.now();
    const timeLabel = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setTemperatureHistory(prev => {
      const updated = [
        ...prev.slice(Math.max(0, prev.length - 34)),
        {
          time: timeLabel,
          timestamp: now,
          actualTemp,
          primaryReading: pVal,
          referenceReading: rVal,
          ambientTemp,
          targetMin,
          targetMax,
          doorOpen,
          coolingActive
        }
      ];
      return updated;
    });

  }, [actualTemp, primarySensor.status, primarySensor.bias, primarySensor.frozenValue, primarySensor.spoofedValue, referenceSensor.status, ambientTemp, targetMin, targetMax, doorOpen, coolingActive]);

  // Periodic automatic evidence checkpoint every 12 seconds
  useEffect(() => {
    if (!simulationRunning) return;
    const evidenceTimer = setInterval(() => {
      createEvidenceRecord(
        'TELEMETRY_CHECKPOINT',
        `Periodic cryptographic integrity capture (Pri: ${primarySensor.reading ?? 'ERR'}°C, Ref: ${referenceSensor.reading ?? 'ERR'}°C)`,
        primarySensor.reading,
        referenceSensor.reading,
        doorOpen,
        coolingActive,
        networkOnline
      );
    }, 12000 / simulationSpeed);

    return () => clearInterval(evidenceTimer);
  }, [simulationRunning, simulationSpeed, primarySensor.reading, referenceSensor.reading, doorOpen, coolingActive, networkOnline, createEvidenceRecord]);

  // ==========================================
  // ColdTrace-AI Dynamic Detection Engine
  // ==========================================
  useEffect(() => {
    const alerts: AlertItem[] = [];
    let opScore = 0;
    let sensorScore = 0;
    let cyberScore = 0;
    let evidenceScore = 0;

    const pReading = primarySensor.reading;
    const rReading = referenceSensor.reading;

    // Rule 1: Temperature safe range excursion
    if (actualTemp > targetMax) {
      const diff = actualTemp - targetMax;
      opScore += Math.min(35, Math.round(15 + diff * 5));
      alerts.push({
        id: 'alt-temp-high',
        category: 'OPERATIONAL',
        severity: actualTemp > targetMax + 4 ? 'critical' : 'warning',
        title: `CRITICAL EXCURSION — TEMPERATURE HIGH (${actualTemp.toFixed(1)}°C > ${targetMax}°C)`,
        timestamp: new Date().toLocaleTimeString(),
        affectedComponent: 'Storage Chamber / Cold Chain Integrity',
        explanation: `Chamber internal temperature has risen to ${actualTemp.toFixed(1)}°C, exceeding maximum allowable cold-chain limit of ${targetMax.toFixed(1)}°C. Perishable goods and vaccines are at severe risk of degradation.`,
        suggestedResponse: 'Verify refrigeration power immediately, inspect door seals, and activate backup liquid nitrogen / backup chiller.',
        snapshot: {
          primarySensor: pReading !== null ? `${pReading}°C` : 'OFFLINE',
          referenceSensor: rReading !== null ? `${rReading}°C` : 'OFFLINE',
          door: doorOpen ? 'OPEN' : 'CLOSED',
          cooling: coolingActive ? 'ON' : 'OFF',
          network: networkOnline ? 'ONLINE' : 'OFFLINE'
        }
      });
    } else if (actualTemp < targetMin) {
      opScore += 20;
      alerts.push({
        id: 'alt-temp-low',
        category: 'OPERATIONAL',
        severity: 'warning',
        title: `TEMPERATURE SUB-COOLING WARNING (${actualTemp.toFixed(1)}°C < ${targetMin}°C)`,
        timestamp: new Date().toLocaleTimeString(),
        affectedComponent: 'Storage Chamber / Evaporator',
        explanation: `Temperature has fallen below minimum safe storage threshold (${targetMin}°C). Risk of freezing damage to aqueous biologics.`,
        suggestedResponse: 'Modulate compressor throttling and check thermal expansion valve.',
        snapshot: {
          primarySensor: pReading !== null ? `${pReading}°C` : 'OFFLINE',
          referenceSensor: rReading !== null ? `${rReading}°C` : 'OFFLINE',
          door: doorOpen ? 'OPEN' : 'CLOSED',
          cooling: coolingActive ? 'ON' : 'OFF',
          network: networkOnline ? 'ONLINE' : 'OFFLINE'
        }
      });
    }

    // Rule 2: Rapid temperature rise rate
    if (temperatureHistory.length >= 4) {
      const recentSlice = temperatureHistory.slice(-4);
      const tempDelta = Math.abs(recentSlice[recentSlice.length - 1].actualTemp - recentSlice[0].actualTemp);
      if (tempDelta > 1.2) {
        opScore += 15;
        alerts.push({
          id: 'alt-rapid-rate',
          category: 'OPERATIONAL',
          severity: 'warning',
          title: `ANOMALOUS THERMAL VELOCITY (|ΔT| = ${tempDelta.toFixed(1)}°C / 4s)`,
          timestamp: new Date().toLocaleTimeString(),
          affectedComponent: 'Chamber Thermal Envelope',
          explanation: `Thermal dissipation gradient is accelerating at an unnatural rate (${tempDelta.toFixed(1)}°C over recent intervals). Indicates sudden thermal breach or direct heat intrusion.`,
          suggestedResponse: 'Check physical perimeter, emergency seals, and external loading dock hatch.',
          snapshot: {
            primarySensor: pReading !== null ? `${pReading}°C` : 'OFFLINE',
            referenceSensor: rReading !== null ? `${rReading}°C` : 'OFFLINE',
            door: doorOpen ? 'OPEN' : 'CLOSED',
            cooling: coolingActive ? 'ON' : 'OFF',
            network: networkOnline ? 'ONLINE' : 'OFFLINE'
          }
        });
      }
    }

    // Rule 3: Sensor Inconsistency (Primary vs Reference)
    if (pReading !== null && rReading !== null) {
      const delta = Math.abs(pReading - rReading);
      if (delta >= sensorDeltaThreshold) {
        sensorScore += Math.min(45, Math.round(25 + (delta - sensorDeltaThreshold) * 4));
        alerts.push({
          id: 'alt-sensor-inconsistency',
          category: 'SENSOR_INCONSISTENCY',
          severity: 'critical',
          title: `CRITICAL ALERT — SENSOR INCONSISTENCY (Δ = ${delta.toFixed(1)}°C)`,
          timestamp: new Date().toLocaleTimeString(),
          affectedComponent: 'Dual Telemetry Sensor Array (DS18B20 vs SHT40)',
          explanation: `The primary sensor reports ${pReading.toFixed(1)}°C while independent reference sensor reports ${rReading.toFixed(1)}°C (divergence exceeds ${sensorDeltaThreshold}°C threshold). Door and cooling states do not justify differential telemetry. Possible physical probe fault, ADC bias drift, or deliberate sensor spoofing injection.`,
          suggestedResponse: 'Dispatch local technician to verify calibrated probe, check ESP32 ADC wiring, and correlate with reference sensor logs.',
          snapshot: {
            primarySensor: `${pReading}°C`,
            referenceSensor: `${rReading}°C`,
            door: doorOpen ? 'OPEN' : 'CLOSED',
            cooling: coolingActive ? 'ON' : 'OFF',
            network: networkOnline ? 'ONLINE' : 'OFFLINE'
          }
        });
      }
    }

    // Rule 4: Frozen Sensor Reading Detection
    if (primarySensor.status === 'frozen') {
      sensorScore += 30;
      alerts.push({
        id: 'alt-sensor-frozen',
        category: 'SENSOR_INCONSISTENCY',
        severity: 'critical',
        title: 'SENSOR STAGNATION / DEAD-VALUE FAULT DETECTED',
        timestamp: new Date().toLocaleTimeString(),
        affectedComponent: 'Primary Temperature Transducer',
        explanation: `Primary sensor output has remained locked at ${primarySensor.reading}°C across continuous time intervals despite micro-thermal dynamics and ambient changes. Characteristic of replay buffer freeze or physical sensor lockup.`,
        suggestedResponse: 'Power-cycle 1-Wire sensor bus on ESP32 GPIO pin and re-initialize bus master.',
        snapshot: {
          primarySensor: `${pReading}°C (FROZEN)`,
          referenceSensor: `${rReading}°C`,
          door: doorOpen ? 'OPEN' : 'CLOSED',
          cooling: coolingActive ? 'ON' : 'OFF',
          network: networkOnline ? 'ONLINE' : 'OFFLINE'
        }
      });
    }

    // Rule 5: Sensor Disconnected
    if (primarySensor.status === 'disconnected' || referenceSensor.status === 'disconnected') {
      sensorScore += 25;
      alerts.push({
        id: 'alt-sensor-disconnect',
        category: 'SENSOR_INCONSISTENCY',
        severity: 'warning',
        title: 'SENSOR HARDWARE TELEMETRY LOSS (NULL REPORT)',
        timestamp: new Date().toLocaleTimeString(),
        affectedComponent: primarySensor.status === 'disconnected' ? 'Primary DS18B20 Sensor' : 'Reference SHT40 Sensor',
        explanation: 'One or more physical sensor channels returned invalid packet or NULL reading. Possible cable severing, connector corrosion, or hardware failure.',
        suggestedResponse: 'Inspect hardware harness and check ESP32 digital bus pull-up resistors.',
        snapshot: {
          primarySensor: pReading !== null ? `${pReading}°C` : 'OFFLINE / DISCONNECTED',
          referenceSensor: rReading !== null ? `${rReading}°C` : 'OFFLINE / DISCONNECTED',
          door: doorOpen ? 'OPEN' : 'CLOSED',
          cooling: coolingActive ? 'ON' : 'OFF',
          network: networkOnline ? 'ONLINE' : 'OFFLINE'
        }
      });
    }

    // Rule 6: Unexpected Cooling Shutdown during Elevated Temp
    if (!coolingActive && actualTemp > targetMax) {
      opScore += 25;
      alerts.push({
        id: 'alt-cooling-unexp-off',
        category: 'OPERATIONAL',
        severity: 'critical',
        title: 'UNEXPECTED REFRIGERATION DEACTIVATION WHILE EXCEEDING THRESHOLD',
        timestamp: new Date().toLocaleTimeString(),
        affectedComponent: 'Compressor Power Relay / Thermostat Logic',
        explanation: `Cooling compressor is switched OFF despite room temperature (${actualTemp.toFixed(1)}°C) exceeding safe ceiling (${targetMax}°C). This violates automatic HVAC fallback policy.`,
        suggestedResponse: 'Force manual compressor override relay and inspect compressor trip breaker.',
        snapshot: {
          primarySensor: `${pReading}°C`,
          referenceSensor: `${rReading}°C`,
          door: doorOpen ? 'OPEN' : 'CLOSED',
          cooling: 'DEACTIVATED (CRITICAL)',
          network: networkOnline ? 'ONLINE' : 'OFFLINE'
        }
      });
    }

    // Rule 7: Door open for too long
    if (doorOpen && doorOpenSeconds > 10) {
      opScore += Math.min(30, 15 + (doorOpenSeconds - 10) * 2);
      alerts.push({
        id: 'alt-door-prolonged',
        category: 'OPERATIONAL',
        severity: doorOpenSeconds > 20 ? 'critical' : 'warning',
        title: `PROLONGED ACCESS BREACH — DOOR OPEN FOR ${doorOpenSeconds}s`,
        timestamp: new Date().toLocaleTimeString(),
        affectedComponent: 'Chamber Main Vault Door Sensor',
        explanation: `Chamber access portal has remained unsealed for ${doorOpenSeconds} continuous seconds (safety limit: 10s). Cold air column is dropping out, driving ambient heat ingress.`,
        suggestedResponse: 'Trigger audible loading dock chime and instruct dock staff to seal chamber hatch immediately.',
        snapshot: {
          primarySensor: `${pReading}°C`,
          referenceSensor: `${rReading}°C`,
          door: `OPEN (${doorOpenSeconds}s)`,
          cooling: coolingActive ? 'ON' : 'OFF',
          network: networkOnline ? 'ONLINE' : 'OFFLINE'
        }
      });
    }

    // Rule 8: Suspicious Cyber Command / Replay Attack / Unauthorized command
    const rejectedCmds = recentCommands.filter(c => c.status !== 'ACCEPTED');
    if (rejectedCmds.length > 0) {
      cyberScore += 45;
      const latestReject = rejectedCmds[0];
      alerts.push({
        id: 'alt-cyber-cmd',
        category: 'CYBER_ATTACK',
        severity: 'critical',
        title: latestReject.status === 'REJECTED_STALE_NONCE' 
          ? 'ESP32 INTERLOCK: CRYPTOGRAPHIC REPLAY ATTACK BLOCKED' 
          : 'SECURITY ALERT: UNAUTHORIZED ACTUATOR MANIPULATION ATTEMPT',
        timestamp: latestReject.timestamp,
        affectedComponent: 'ESP32 Interlock Controller / Actuator Bus',
        explanation: latestReject.details,
        suggestedResponse: 'Isolate compromised control IP address on Raspberry Pi gateway firewall and rotate cryptographic keys.',
        snapshot: {
          primarySensor: `${pReading}°C`,
          referenceSensor: `${rReading}°C`,
          door: doorOpen ? 'OPEN' : 'CLOSED',
          cooling: coolingActive ? 'ON' : 'OFF',
          network: networkOnline ? 'ONLINE' : 'OFFLINE'
        }
      });
    }

    // Rule 9: Network Connectivity Interrupted
    if (!networkOnline) {
      cyberScore += 30;
      alerts.push({
        id: 'alt-network-loss',
        category: 'CYBER_ATTACK',
        severity: 'warning',
        title: 'GATEWAY TELEMETRY BLACKOUT / NETWORK INTERRUPTION',
        timestamp: new Date().toLocaleTimeString(),
        affectedComponent: 'Raspberry Pi Industrial Edge Gateway / MQTT Broker',
        explanation: 'Network telemetry stream between ESP32 controller and ColdTrace-AI gateway is down. Edge buffering engaged.',
        suggestedResponse: 'Verify local switch uplink, Ethernet cable, and inspect gateway for ARP spoofing or DoS flood.',
        snapshot: {
          primarySensor: `${pReading}°C`,
          referenceSensor: `${rReading}°C`,
          door: doorOpen ? 'OPEN' : 'CLOSED',
          cooling: coolingActive ? 'ON' : 'OFF',
          network: 'DISCONNECTED / OFFLINE'
        }
      });
    }

    // Rule 10: Evidence Integrity Failure (Tampering)
    const tamperedEvidence = evidenceRecords.find(r => r.isTampered || r.verificationResult === 'MISMATCH');
    if (tamperedEvidence) {
      evidenceScore += 50;
      alerts.push({
        id: 'alt-evidence-tamper',
        category: 'EVIDENCE_INTEGRITY',
        severity: 'critical',
        title: `CRITICAL FORENSIC ALERT: EVIDENCE HASH MISMATCH AT SEQ #${tamperedEvidence.seqNumber}`,
        timestamp: new Date().toLocaleTimeString(),
        affectedComponent: 'Immutable Audit Log / SHA-256 Chain',
        explanation: `Record sequence #${tamperedEvidence.seqNumber} failed cryptographic hash verification! Stored SHA-256 checksum does not match computed digest of the payload. Post-capture forensic data has been intentionally manipulated or corrupted.`,
        suggestedResponse: 'Preserve gateway storage image immediately, lock write access to forensic partitions, and initiate chain-of-custody review.',
        snapshot: {
          primarySensor: `${pReading}°C`,
          referenceSensor: `${rReading}°C`,
          door: doorOpen ? 'OPEN' : 'CLOSED',
          cooling: coolingActive ? 'ON' : 'OFF',
          network: networkOnline ? 'ONLINE' : 'OFFLINE'
        }
      });
    }

    // Calculate aggregated dynamic risk score (0 - 100)
    const totalRaw = opScore + sensorScore + cyberScore + evidenceScore;
    const computedRisk = Math.min(100, Math.max(8, totalRaw));

    let level: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Low';
    if (computedRisk >= 81) level = 'Critical';
    else if (computedRisk >= 61) level = 'High';
    else if (computedRisk >= 31) level = 'Moderate';
    else level = 'Low';

    setRiskScore(computedRisk);
    setRiskLevel(level);
    setCategoryScores({
      operational: Math.min(100, opScore),
      sensorInconsistency: Math.min(100, sensorScore),
      suspiciousCyber: Math.min(100, cyberScore),
      evidenceIntegrity: Math.min(100, evidenceScore)
    });
    setActiveAlerts(alerts);

  }, [
    actualTemp, 
    targetMin, 
    targetMax, 
    doorOpen, 
    doorOpenSeconds, 
    coolingActive, 
    primarySensor, 
    referenceSensor, 
    sensorDeltaThreshold, 
    recentCommands, 
    networkOnline, 
    evidenceRecords, 
    temperatureHistory
  ]);

  // ==========================================
  // Controls & Action Handlers
  // ==========================================

  const setActualTempDirectly = useCallback((temp: number) => {
    setActualTemp(Math.round(temp * 10) / 10);
    addSecurityEvent('TEMP_CHANGE', 'info', 'Manual Chamber Temperature Set', `User set chamber temperature directly to ${temp}°C`, 'Manual Simulator Override');
  }, [addSecurityEvent]);

  const adjustActualTemp = useCallback((delta: number) => {
    setActualTemp(prev => Math.round((prev + delta) * 10) / 10);
  }, []);

  const setTargetRange = useCallback((min: number, max: number) => {
    setTargetMin(min);
    setTargetMax(max);
    addSecurityEvent('TEMP_CHANGE', 'info', 'Target Range Updated', `Target limits reconfigured to [${min}°C – ${max}°C]`, 'Cold-Storage Controller');
  }, [addSecurityEvent]);

  const toggleDoor = useCallback(() => {
    setDoorOpen(prev => {
      const next = !prev;
      addSecurityEvent(
        'DOOR_STATE', 
        next ? 'warning' : 'info', 
        next ? 'Cold Storage Door Opened' : 'Cold Storage Door Closed', 
        next ? 'Physical perimeter breached. Heat influx commencing.' : 'Chamber door sealed. Thermal recovery possible.', 
        'Magnetic Reed Switch'
      );
      createEvidenceRecord(
        next ? 'DOOR_OPENED' : 'DOOR_CLOSED',
        next ? 'Access door unsealed' : 'Access door sealed',
        primarySensor.reading,
        referenceSensor.reading,
        next,
        coolingActive,
        networkOnline
      );
      return next;
    });
  }, [addSecurityEvent, createEvidenceRecord, primarySensor.reading, referenceSensor.reading, coolingActive, networkOnline]);

  const toggleCooling = useCallback(() => {
    setCoolingActive(prev => {
      const next = !prev;
      addSecurityEvent(
        'COOLING_STATE', 
        next ? 'info' : 'warning', 
        next ? 'Cooling System Engaged (Compressor ON)' : 'Cooling System Stopped (Compressor OFF)', 
        next ? 'Refrigerant cycle activated. Chamber cooling down.' : 'Compressor shut down. Passive ambient heat gain underway.', 
        'ESP32 HVAC Relay'
      );
      createEvidenceRecord(
        next ? 'COOLING_ACTIVATED' : 'COOLING_DEACTIVATED',
        next ? 'Compressor turned ON' : 'Compressor turned OFF',
        primarySensor.reading,
        referenceSensor.reading,
        doorOpen,
        next,
        networkOnline
      );
      return next;
    });
  }, [addSecurityEvent, createEvidenceRecord, primarySensor.reading, referenceSensor.reading, doorOpen, networkOnline]);

  const toggleSimulation = useCallback(() => {
    setSimulationRunning(prev => !prev);
  }, []);

  const resetEnvironment = useCallback(() => {
    setActualTemp(4.2);
    setAmbientTemp(24.0);
    setTargetMin(2.0);
    setTargetMax(8.0);
    setDoorOpen(false);
    setDoorOpenSeconds(0);
    setCoolingActive(true);
    setDisturbance(0);
    setPrimarySensor({
      reading: 4.2,
      status: 'online',
      bias: 0.1,
      frozenValue: null,
      spoofedValue: 18.5,
    });
    setReferenceSensor({
      reading: 4.2,
      status: 'online',
    });
    setNetworkOnline(true);
    setEsp32SafetyInterlockTriggered(false);
    setRecentCommands([
      {
        id: `cmd-${Date.now()}`,
        command: 'SYSTEM_RESET_NOMINAL',
        nonce: 'reset-init-88',
        timestamp: new Date().toLocaleTimeString(),
        status: 'ACCEPTED',
        origin: 'OPERATOR_CONSOLE',
        details: 'Baseline settings restored. All sensors and interlocks calibrated.'
      }
    ]);
    addSecurityEvent('DETECTION', 'info', 'Environment Reset', 'Cold-storage simulator restored to factory baseline state (4.2°C, Door closed, Cooling ON).', 'Simulation Engine');
  }, [addSecurityEvent]);

  // Sensor actions
  const setPrimarySensorStatus = useCallback((status: 'online' | 'frozen' | 'spoofed' | 'disconnected') => {
    setPrimarySensor(prev => {
      const frozenVal = status === 'frozen' ? (prev.reading ?? actualTemp) : null;
      return {
        ...prev,
        status,
        frozenValue: frozenVal
      };
    });
    addSecurityEvent(
      'SENSOR_ANOMALY', 
      status === 'online' ? 'info' : 'warning', 
      `Primary Sensor Mode: ${status.toUpperCase()}`, 
      `Operator modified primary transducer test mode to ${status}`, 
      'Primary DS18B20'
    );
  }, [actualTemp, addSecurityEvent]);

  const setPrimarySensorBias = useCallback((bias: number) => {
    setPrimarySensor(prev => ({ ...prev, bias }));
  }, []);

  const setPrimarySensorSpoofedValue = useCallback((val: number) => {
    setPrimarySensor(prev => ({ ...prev, spoofedValue: val }));
  }, []);

  const toggleReferenceSensorStatus = useCallback(() => {
    setReferenceSensor(prev => {
      const nextStatus = prev.status === 'online' ? 'disconnected' : 'online';
      addSecurityEvent(
        'SENSOR_ANOMALY',
        nextStatus === 'online' ? 'info' : 'warning',
        `Reference Sensor ${nextStatus.toUpperCase()}`,
        `Secondary channel (SHT40) state toggled to ${nextStatus}`,
        'Reference SHT40'
      );
      return { ...prev, status: nextStatus };
    });
  }, [addSecurityEvent]);

  const restoreSensorsNormal = useCallback(() => {
    setPrimarySensor(prev => ({
      ...prev,
      status: 'online',
      bias: 0.1,
      frozenValue: null
    }));
    setReferenceSensor({
      reading: actualTemp,
      status: 'online'
    });
    addSecurityEvent('SENSOR_ANOMALY', 'info', 'Sensors Restored to Normal', 'All sensor channels re-aligned to genuine physical chamber telemetry.', 'Sensor Subsystem');
  }, [actualTemp, addSecurityEvent]);

  // ==========================================
  // Cybersecurity Actions
  // ==========================================

  const simulateUnauthorizedCommand = useCallback(() => {
    const cmdId = `cmd-unauth-${Date.now()}`;
    const newCmd: CommandLog = {
      id: cmdId,
      command: 'OVERRIDE_KILL_COOLING_RELAY',
      nonce: 'rogue-packet-' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toLocaleTimeString(),
      status: 'REJECTED_UNAUTHORIZED',
      origin: 'UNREGISTERED_SUBNET (192.168.1.189)',
      details: 'ESP32 Interlock REJECTED: Sender lacks HMAC-SHA256 signature authorization token. Actuator state preserved.'
    };
    setRecentCommands(prev => [newCmd, ...prev]);
    setEsp32SafetyInterlockTriggered(true);

    addSecurityEvent(
      'CYBER_COMMAND',
      'critical',
      'Unauthorized Actuator Control Attempt Intercepted',
      'Rogue host 192.168.1.189 injected unauthenticated command OVERRIDE_KILL_COOLING_RELAY. Intercepted by ESP32 Interlock.',
      'ESP32 Interlock Controller'
    );

    createEvidenceRecord(
      'UNAUTHORIZED_COMMAND_DETECTED',
      'Rogue command injection rejected by cryptographic interlock',
      primarySensor.reading,
      referenceSensor.reading,
      doorOpen,
      coolingActive,
      networkOnline
    );
  }, [addSecurityEvent, createEvidenceRecord, primarySensor.reading, referenceSensor.reading, doorOpen, coolingActive, networkOnline]);

  const simulateReplayAttack = useCallback(() => {
    // Re-use an existing nonce from recentCommands
    const staleNonce = recentCommands[recentCommands.length - 1]?.nonce || 'a8f93e2b10';
    const cmdId = `cmd-replay-${Date.now()}`;

    const newCmd: CommandLog = {
      id: cmdId,
      command: 'SET_COMPRESSOR_POWER_OFF',
      nonce: staleNonce,
      timestamp: new Date().toLocaleTimeString(),
      status: 'REJECTED_STALE_NONCE',
      origin: 'REPLAY_INJECTOR (Tap on Gateway SPI)',
      details: `ESP32 Interlock REJECTED: Cryptographic nonce [${staleNonce}] was already consumed in previous session. Stale timestamp delta > 300s. Replay attack defeated by sliding replay window.`
    };

    setRecentCommands(prev => [newCmd, ...prev]);
    setEsp32SafetyInterlockTriggered(true);

    addSecurityEvent(
      'CYBER_COMMAND',
      'critical',
      'Replay Attack Neutralized by ESP32 Interlock',
      `Replayed payload with stale nonce [${staleNonce}] rejected by hardware-enforced replay filter.`,
      'ESP32 Interlock Controller'
    );

    createEvidenceRecord(
      'REPLAY_ATTACK_DETECTED',
      `Replay attempt intercepted with stale nonce ${staleNonce}`,
      primarySensor.reading,
      referenceSensor.reading,
      doorOpen,
      coolingActive,
      networkOnline
    );
  }, [recentCommands, addSecurityEvent, createEvidenceRecord, primarySensor.reading, referenceSensor.reading, doorOpen, coolingActive, networkOnline]);

  const simulateNetworkInterruption = useCallback(() => {
    setNetworkOnline(prev => {
      const next = !prev;
      addSecurityEvent(
        'NETWORK_EVENT',
        next ? 'info' : 'warning',
        next ? 'Network Connection Restored' : 'Network Telemetry Interruption',
        next ? 'MQTT gateway connection established with cloud forensic node.' : 'Edge-to-gateway telemetry link severed. Edge buffer active.',
        'Raspberry Pi Gateway'
      );
      createEvidenceRecord(
        next ? 'NETWORK_RECONNECTED' : 'NETWORK_OFFLINE',
        next ? 'Uplink restored' : 'Uplink disconnected',
        primarySensor.reading,
        referenceSensor.reading,
        doorOpen,
        coolingActive,
        next
      );
      return next;
    });
  }, [addSecurityEvent, createEvidenceRecord, primarySensor.reading, referenceSensor.reading, doorOpen, coolingActive]);

  const simulateSensorManipulation = useCallback(() => {
    // Spoofs primary sensor to high value while actual room and reference remain cold
    setPrimarySensor(prev => ({
      ...prev,
      status: 'spoofed',
      spoofedValue: 16.8
    }));

    addSecurityEvent(
      'SENSOR_ANOMALY',
      'critical',
      'Sensor Telemetry Injection / Spoofing Active',
      'Primary DS18B20 channel artificially forced to 16.8°C while physical chamber remains nominal. Dual-sensor divergence activated.',
      'Primary Sensor Interceptor'
    );

    createEvidenceRecord(
      'SENSOR_SPOOF_INJECTED',
      'Primary sensor manipulated to 16.8°C',
      16.8,
      referenceSensor.reading,
      doorOpen,
      coolingActive,
      networkOnline
    );
  }, [addSecurityEvent, createEvidenceRecord, referenceSensor.reading, doorOpen, coolingActive, networkOnline]);

  // Simulate evidence tampering: alters a historical record payload without recomputing hash
  const simulateEvidenceTampering = useCallback((recordIndex: number = 0) => {
    if (evidenceRecords.length === 0) return;

    setEvidenceRecords(prev => {
      const copy = [...prev];
      const targetIdx = Math.min(recordIndex, copy.length - 1);
      const target = copy[targetIdx];

      // Mutate the payload to a falsified reading
      const fakePrimary = target.payload.primaryTemp !== null ? target.payload.primaryTemp + 12.5 : 19.5;
      const tamperedRecord: EvidenceRecord = {
        ...target,
        isTampered: true,
        tamperedPayload: {
          ...target.payload,
          primaryTemp: fakePrimary,
          description: '[ALTERED BY ADVERSARY] Telemetry modified in database'
        },
        verificationResult: 'MISMATCH'
      };

      copy[targetIdx] = tamperedRecord;
      return copy;
    });

    addSecurityEvent(
      'EVIDENCE_INTEGRITY',
      'critical',
      'Evidence Record Tampering Simulated',
      'A stored database evidence record was retroactively modified. SHA-256 hash mismatch will trigger upon forensic verification.',
      'Forensic Evidence Store'
    );
  }, [evidenceRecords, addSecurityEvent]);

  // Verify all evidence records against browser SHA-256
  const verifyEvidenceIntegrity = useCallback(async (): Promise<boolean> => {
    let allValid = true;
    const updated = await Promise.all(
      evidenceRecords.map(async record => {
        const payloadToHash = record.isTampered && record.tamperedPayload ? record.tamperedPayload : record.payload;
        const canonicalStr = `${record.seqNumber}|${record.eventType}|${JSON.stringify(payloadToHash, Object.keys(payloadToHash).sort())}`;
        const computedHash = await calculateSHA256(canonicalStr);

        const isMatch = computedHash === record.hash;
        if (!isMatch) allValid = false;

        return {
          ...record,
          verificationResult: (isMatch ? 'MATCH' : 'MISMATCH') as 'MATCH' | 'MISMATCH'
        };
      })
    );

    setEvidenceRecords(updated);

    if (!allValid) {
      addSecurityEvent(
        'EVIDENCE_INTEGRITY',
        'critical',
        'Cryptographic Audit Failed: Tampered Record Detected',
        'One or more evidence records failed SHA-256 integrity verification. Tampering confirmed in audit trail.',
        'Forensic Hash Verifier'
      );
    } else {
      addSecurityEvent(
        'EVIDENCE_INTEGRITY',
        'info',
        'Evidence Integrity Audit: 100% Verified',
        'All records match signed SHA-256 digests. Audit trail intact.',
        'Forensic Hash Verifier'
      );
    }

    return allValid;
  }, [evidenceRecords, addSecurityEvent]);

  // ==========================================
  // Quick Scenarios
  // ==========================================

  const loadScenario = useCallback((scenario: 'normal' | 'excursion' | 'sensor_spoof' | 'cooling_fail' | 'replay_attack' | 'evidence_tamper') => {
    // First reset to nominal
    setSimulationRunning(true);
    setSimulationSpeed(1);
    setAmbientTemp(24.0);
    setTargetMin(2.0);
    setTargetMax(8.0);
    setDisturbance(0);

    switch (scenario) {
      case 'normal':
        setActualTemp(4.2);
        setDoorOpen(false);
        setDoorOpenSeconds(0);
        setCoolingActive(true);
        setNetworkOnline(true);
        setPrimarySensor({
          reading: 4.2,
          status: 'online',
          bias: 0.1,
          frozenValue: null,
          spoofedValue: 18.5
        });
        setReferenceSensor({
          reading: 4.2,
          status: 'online'
        });
        addSecurityEvent('DETECTION', 'info', 'Scenario: Normal Operation', 'Chamber stable at 4.2°C, door sealed, cooling ON, both sensors synchronized.', 'Scenario Engine');
        break;

      case 'excursion':
        setActualTemp(11.5);
        setDoorOpen(true);
        setDoorOpenSeconds(18);
        setCoolingActive(false);
        setNetworkOnline(true);
        setPrimarySensor({
          reading: 11.5,
          status: 'online',
          bias: 0.2,
          frozenValue: null,
          spoofedValue: 18.5
        });
        setReferenceSensor({
          reading: 11.3,
          status: 'online'
        });
        addSecurityEvent('TEMP_CHANGE', 'critical', 'Scenario: Temperature Excursion', 'Simulating acute thermal excursion (11.5°C) caused by unsealed door and deactivated compressor.', 'Scenario Engine');
        break;

      case 'sensor_spoof':
        setActualTemp(4.3);
        setDoorOpen(false);
        setCoolingActive(true);
        setNetworkOnline(true);
        setPrimarySensor({
          reading: 14.8,
          status: 'spoofed',
          bias: 0,
          frozenValue: null,
          spoofedValue: 14.8
        });
        setReferenceSensor({
          reading: 4.3,
          status: 'online'
        });
        addSecurityEvent('SENSOR_ANOMALY', 'critical', 'Scenario: Sensor Manipulation', 'Simulating malicious primary sensor spoofing (14.8°C) while independent reference sensor confirms room is safely at 4.3°C.', 'Scenario Engine');
        break;

      case 'cooling_fail':
        setActualTemp(7.8);
        setDoorOpen(false);
        setCoolingActive(false); // Cooling abruptly turned off
        setDisturbance(0.5);
        setNetworkOnline(true);
        setPrimarySensor({
          reading: 7.8,
          status: 'online',
          bias: 0.1,
          frozenValue: null,
          spoofedValue: 18.5
        });
        setReferenceSensor({
          reading: 7.7,
          status: 'online'
        });
        addSecurityEvent('COOLING_STATE', 'warning', 'Scenario: Cooling Failure', 'Compressor failure simulated. Temperature gradually trending upwards while sensors agree.', 'Scenario Engine');
        break;

      case 'replay_attack':
        setActualTemp(4.4);
        setDoorOpen(false);
        setCoolingActive(true);
        setNetworkOnline(true);
        restoreSensorsNormal();
        simulateReplayAttack();
        break;

      case 'evidence_tamper':
        simulateEvidenceTampering(0);
        break;
    }
  }, [addSecurityEvent, restoreSensorsNormal, simulateReplayAttack, simulateEvidenceTampering]);

  // ==========================================
  // Forensic Report Generation & Export
  // ==========================================

  const generateForensicReport = useCallback(() => {
    const isTampered = evidenceRecords.some(r => r.isTampered || r.verificationResult === 'MISMATCH');
    const pVal = primarySensor.reading;
    const rVal = referenceSensor.reading;
    const delta = pVal !== null && rVal !== null ? Math.abs(pVal - rVal) : null;

    let title = 'Incident Triage & Forensic Analysis';
    let cat: AnomalyCategory = 'OPERATIONAL';
    let severity: 'warning' | 'critical' = riskScore > 60 ? 'critical' : 'warning';
    let reason = 'System telemetry review completed.';
    const causes: string[] = [];
    const steps: string[] = [];
    let conclusion = '';

    if (isTampered) {
      title = 'FORENSIC INCIDENT: Database Audit Log Integrity Breach';
      cat = 'EVIDENCE_INTEGRITY';
      severity = 'critical';
      reason = 'SHA-256 cryptographic hash mismatch detected across recorded evidence chain.';
      causes.push('Direct unauthorized SQL/database modification', 'Malicious insider altering historical records to conceal excursion', 'Filesystem corruption on gateway storage volume');
      steps.push('Immediately seize Raspberry Pi gateway microSD/eMMC storage for bit-level DD image.', 'Cross-reference gateway audit log with cloud cold-chain ledger.', 'Review physical access badge logs for gateway control enclosure.');
      conclusion = 'Evidence demonstrates deliberate post-capture record tampering. Stored telemetry was retroactively modified, failing SHA-256 verification. A formal chain-of-custody incident must be opened.';
    } else if (recentCommands.some(c => c.status === 'REJECTED_STALE_NONCE')) {
      title = 'CYBER INCIDENT: Blocked Replay Attack on Actuator Bus';
      cat = 'CYBER_ATTACK';
      severity = 'critical';
      reason = 'ESP32 Interlock intercepted duplicated packet with previously consumed nonce.';
      causes.push('Adversary eavesdropped on unencrypted RS485/WiFi command stream', 'Injected historical compressor disable frame to cause product spoiling', 'Man-in-the-Middle (MitM) node on local subnet');
      steps.push('Inspect local Ethernet switch mirror port for promiscuous ARP spoofing.', 'Rotate ESP32 session keys and verify AES-GCM nonce counters.', 'Confirm physical interlock hardware prevented equipment shutdown.');
      conclusion = 'Evidence indicates an active replay attack attempted to disable storage refrigeration. The ESP32 hardware interlock successfully dropped the frame due to nonce reuse.';
    } else if (delta !== null && delta >= sensorDeltaThreshold) {
      title = 'SENSOR INCIDENT: Discrepancy Between Primary and Reference Transducers';
      cat = 'SENSOR_INCONSISTENCY';
      severity = 'critical';
      reason = `Primary sensor (${pVal}°C) and reference sensor (${rVal}°C) show severe divergence (Δ = ${delta.toFixed(1)}°C).`;
      causes.push('Primary DS18B20 1-Wire calibration drift or ground loop voltage bias', 'ADC injection / MITM spoofing on primary sensor lead', 'Physical detachment of primary probe from cold-room wall bracket');
      steps.push('Deploy certified handheld reference thermometer to sample room air directly.', 'Test 1-Wire bus impedance and check pull-up resistor voltage.', 'Review reference sensor SHT40 historical curve to determine true chamber condition.');
      conclusion = 'Evidence suggests a sensor inconsistency. The primary sensor deviated significantly from the independent reference while door and cooling states remained nominal. This may indicate sensor failure, calibration drift, or data manipulation. The available simulation does not establish malicious intent without further physical probe inspection.';
    } else if (actualTemp > targetMax) {
      title = 'OPERATIONAL INCIDENT: Sustained Thermal Excursion';
      cat = 'OPERATIONAL';
      severity = actualTemp > targetMax + 3 ? 'critical' : 'warning';
      reason = `Chamber temperature (${actualTemp.toFixed(1)}°C) exceeded maximum specification (${targetMax}°C).`;
      causes.push(doorOpen ? 'Chamber door left unsealed during inventory restocking' : 'Refrigeration compressor mechanical failure or refrigerant leak', 'Thermostat relay failure');
      steps.push('Inspect magnetic door switch and door gasket integrity.', 'Check compressor discharge pressure and thermal overload switch.', 'Perform quarantine review of biologics and pharmaceuticals stored during excursion period.');
      conclusion = 'Incident attributed to operational thermal stress. Both sensors remained concordant, validating the chamber was physically warm.';
    } else {
      title = 'NOMINAL SYSTEM STATUS: Routine Diagnostic Audit';
      cat = 'OPERATIONAL';
      severity = 'warning';
      reason = 'All monitored parameters are currently within baseline tolerance.';
      causes.push('Routine scheduled forensic baseline check');
      steps.push('Continue continuous automated telemetry capture.', 'Maintain standard weekly cryptographic hash validation.');
      conclusion = 'All physical and cyber systems are operating within defined safety envelopes. Cryptographic hashes match and sensor telemetry is coherent.';
    }

    const report: ForensicReport = {
      id: `rep-${Date.now()}`,
      incidentTitle: title,
      incidentStartTime: new Date(Date.now() - 180000).toLocaleTimeString(),
      severity,
      category: cat,
      affectedComponents: [
        'Storage Chamber Interior',
        'Primary DS18B20 Transducer',
        'Secondary Reference SHT40',
        'ESP32 Interlock Controller',
        'Raspberry Pi Gateway'
      ],
      observedValues: {
        primaryTemp: pVal !== null ? `${pVal}°C` : 'OFFLINE',
        referenceTemp: rVal !== null ? `${rVal}°C` : 'OFFLINE',
        doorState: doorOpen ? `OPEN (${doorOpenSeconds}s)` : 'CLOSED',
        coolingState: coolingActive ? 'ACTIVE (ON)' : 'DEACTIVATED (OFF)',
        networkState: networkOnline ? 'CONNECTED' : 'DISCONNECTED'
      },
      relatedNetworkOrCommandEvents: recentCommands.slice(0, 3).map(c => `[${c.timestamp}] ${c.command} (${c.status}) - ${c.details}`),
      evidenceIntegrityStatus: isTampered ? 'TAMPERED_DETECTED' : 'VERIFIED',
      flaggedReason: reason,
      possibleCauses: causes,
      recommendedSteps: steps,
      conclusion
    };

    setForensicReport(report);
  }, [evidenceRecords, primarySensor.reading, referenceSensor.reading, sensorDeltaThreshold, recentCommands, actualTemp, targetMax, doorOpen, doorOpenSeconds, coolingActive, networkOnline, riskScore]);

  // Generate initial forensic report when alerts change or on mount
  useEffect(() => {
    generateForensicReport();
  }, [riskScore, generateForensicReport]);

  const exportForensicReport = useCallback((format: 'json' | 'text') => {
    if (!forensicReport) return;

    let content = '';
    let mimeType = 'text/plain';
    let filename = `ColdTrace_Forensic_Report_${Date.now()}`;

    if (format === 'json') {
      content = JSON.stringify(
        {
          meta: {
            system: 'ColdTrace-AI IoT Forensic Platform',
            mode: 'SIMULATION_MODE',
            exportTimestamp: new Date().toISOString()
          },
          report: forensicReport,
          auditEvidence: evidenceRecords.slice(0, 20)
        },
        null,
        2
      );
      mimeType = 'application/json';
      filename += '.json';
    } else {
      content = `================================================================================
COLDTRACE-AI: CYBER-PHYSICAL FORENSIC INCIDENT INVESTIGATION REPORT
Simulation Mode — Research Project Evaluation
Generated: ${new Date().toLocaleString()}
================================================================================

INCIDENT OVERVIEW
--------------------------------------------------------------------------------
Title:           ${forensicReport.incidentTitle}
Timestamp:       ${forensicReport.incidentStartTime}
Severity:        ${forensicReport.severity.toUpperCase()}
Category:        ${forensicReport.category}
Evidence Status: ${forensicReport.evidenceIntegrityStatus}

OBSERVED SENSOR & SYSTEM STATE
--------------------------------------------------------------------------------
Primary Sensor (DS18B20):    ${forensicReport.observedValues.primaryTemp}
Reference Sensor (SHT40):    ${forensicReport.observedValues.referenceTemp}
Vault Door Status:           ${forensicReport.observedValues.doorState}
Cooling Subsystem:           ${forensicReport.observedValues.coolingState}
Gateway Uplink:              ${forensicReport.observedValues.networkState}

INCIDENT TRIGGER & FLAGGED REASON
--------------------------------------------------------------------------------
${forensicReport.flaggedReason}

POSSIBLE ROOT CAUSES
--------------------------------------------------------------------------------
${forensicReport.possibleCauses.map((c, i) => `  ${i + 1}. ${c}`).join('\n')}

RECOMMENDED INVESTIGATION & REMEDIATION
--------------------------------------------------------------------------------
${forensicReport.recommendedSteps.map((s, i) => `  [+] ${s}`).join('\n')}

EXPERT FORENSIC CONCLUSION
--------------------------------------------------------------------------------
${forensicReport.conclusion}

RELATED ACTUATOR & NETWORK COMMANDS
--------------------------------------------------------------------------------
${forensicReport.relatedNetworkOrCommandEvents.join('\n') || 'No anomalous actuator commands recorded.'}

================================================================================
END OF REPORT — COLDTRACE-AI SECURITY ENGINE
================================================================================`;
      filename += '.txt';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [forensicReport, evidenceRecords]);

  const remediateAndNormalize = useCallback(async (alertId?: string) => {
    // 1. Resolve physical conditions
    setDoorOpen(false);
    setDoorOpenSeconds(0);
    setCoolingActive(true);
    setDisturbance(0);

    // 2. Resolve sensor inconsistencies
    setPrimarySensor(prev => ({
      ...prev,
      status: 'online',
      bias: 0.1,
      frozenValue: null
    }));
    setReferenceSensor({
      reading: actualTemp,
      status: 'online'
    });

    // 3. Resolve cyber states
    setNetworkOnline(true);
    setEsp32SafetyInterlockTriggered(false);
    setRecentCommands(prev => [
      {
        id: `cmd-resolve-${Date.now()}`,
        command: 'OPERATOR_ENGAGE_RECOVERY',
        nonce: 'auth-remed-' + Math.random().toString(36).substring(2, 6),
        timestamp: new Date().toLocaleTimeString(),
        status: 'ACCEPTED',
        origin: 'OPERATOR_OVERRIDE',
        details: 'Operator acknowledged alert and initiated automated system normalization protocol.'
      },
      ...prev
    ]);

    // 4. Resolve any evidence tampering
    setEvidenceRecords(prev =>
      prev.map(r => ({
        ...r,
        isTampered: false,
        tamperedPayload: undefined,
        verificationResult: 'MATCH'
      }))
    );

    // 5. Dismiss specific alert or all active alerts
    if (alertId) {
      setActiveAlerts(prev => prev.filter(a => a.id !== alertId));
    } else {
      setActiveAlerts([]);
    }

    // 6. Set remediation active
    setIsRemediating(true);
    setRemediationStatus('Remediation Engaged: Door sealed, 3.2kW compressor active. Temperature normalizing back to nominal 4.2°C...');

    addSecurityEvent(
      'DETECTION',
      'info',
      'Incident Acknowledged & Solved by Operator',
      'Root cause resolved: Vault door sealed, cooling engaged, sensors synchronized. Temperature actively returning to normal (4.2°C).',
      'Operator Console'
    );

    await createEvidenceRecord(
      'OPERATOR_REMEDIATION_ENGAGED',
      'Fault remediated; active thermal normalization engaged',
      primarySensor.reading,
      referenceSensor.reading,
      false,
      true,
      true
    );
  }, [actualTemp, addSecurityEvent, createEvidenceRecord, primarySensor.reading, referenceSensor.reading]);

  const acknowledgeAlert = useCallback((id: string) => {
    setActiveAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const clearAlerts = useCallback(() => {
    setActiveAlerts([]);
  }, []);

  return (
    <SimulationContext.Provider
      value={{
        actualTemp,
        ambientTemp,
        targetMin,
        targetMax,
        doorOpen,
        doorOpenSeconds,
        coolingActive,
        disturbance,
        simulationRunning,
        simulationSpeed,
        sensorDeltaThreshold,
        primarySensor,
        referenceSensor,
        networkOnline,
        recentCommands,
        esp32SafetyInterlockTriggered,
        usedNonces,
        riskScore,
        riskLevel,
        categoryScores,
        activeAlerts,
        securityEvents,
        temperatureHistory,
        evidenceRecords,
        forensicReport,
        isRemediating,
        remediationStatus,
        setActualTempDirectly,
        adjustActualTemp,
        setTargetRange,
        setAmbientTemp,
        setDisturbance,
        toggleDoor,
        toggleCooling,
        toggleSimulation,
        setSimulationSpeed,
        resetEnvironment,
        remediateAndNormalize,
        setPrimarySensorStatus,
        setPrimarySensorBias,
        setPrimarySensorSpoofedValue,
        toggleReferenceSensorStatus,
        restoreSensorsNormal,
        simulateUnauthorizedCommand,
        simulateReplayAttack,
        simulateNetworkInterruption,
        simulateSensorManipulation,
        simulateEvidenceTampering,
        verifyEvidenceIntegrity,
        loadScenario,
        generateForensicReport,
        exportForensicReport,
        acknowledgeAlert,
        clearAlerts
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be used within a SimulationProvider');
  return ctx;
};

