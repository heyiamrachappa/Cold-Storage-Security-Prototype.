export type AnomalyCategory = 
  | 'OPERATIONAL' 
  | 'SENSOR_INCONSISTENCY' 
  | 'CYBER_ATTACK' 
  | 'EVIDENCE_INTEGRITY';

export type Severity = 'info' | 'warning' | 'critical';

export interface AlertItem {
  id: string;
  category: AnomalyCategory;
  severity: 'warning' | 'critical';
  title: string;
  timestamp: string;
  affectedComponent: string;
  explanation: string;
  suggestedResponse: string;
  snapshot: {
    primarySensor: number | string;
    referenceSensor: number | string;
    door: string;
    cooling: string;
    network: string;
  };
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 
    | 'TEMP_CHANGE' 
    | 'DOOR_STATE' 
    | 'COOLING_STATE' 
    | 'SENSOR_ANOMALY' 
    | 'NETWORK_EVENT' 
    | 'CYBER_COMMAND' 
    | 'DETECTION' 
    | 'EVIDENCE_INTEGRITY';
  severity: Severity;
  title: string;
  description: string;
  component: string;
}

export interface EvidenceRecord {
  id: string;
  seqNumber: number;
  timestamp: string;
  eventType: string;
  payload: {
    primaryTemp: number | null;
    referenceTemp: number | null;
    doorOpen: boolean;
    coolingActive: boolean;
    networkOnline: boolean;
    description: string;
  };
  hash: string;
  isTampered: boolean;
  tamperedPayload?: {
    primaryTemp: number | null;
    referenceTemp: number | null;
    doorOpen: boolean;
    coolingActive: boolean;
    networkOnline: boolean;
    description: string;
  };
  verificationResult?: 'MATCH' | 'MISMATCH';
}

export interface TemperatureDataPoint {
  time: string;
  timestamp: number;
  actualTemp: number;
  primaryReading: number | null;
  referenceReading: number | null;
  ambientTemp: number;
  targetMin: number;
  targetMax: number;
  doorOpen: boolean;
  coolingActive: boolean;
}

export interface ForensicReport {
  id: string;
  incidentTitle: string;
  incidentStartTime: string;
  severity: 'warning' | 'critical';
  category: AnomalyCategory;
  affectedComponents: string[];
  observedValues: {
    primaryTemp: string;
    referenceTemp: string;
    doorState: string;
    coolingState: string;
    networkState: string;
  };
  relatedNetworkOrCommandEvents: string[];
  evidenceIntegrityStatus: 'VERIFIED' | 'TAMPERED_DETECTED' | 'UNVERIFIED';
  flaggedReason: string;
  possibleCauses: string[];
  recommendedSteps: string[];
  conclusion: string;
}

