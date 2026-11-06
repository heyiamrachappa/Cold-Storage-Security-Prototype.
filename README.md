# ColdTrace-AI: IoT Cold-Storage Cyber-Physical Security & Forensic Simulator

> **Simulation Mode** — Digital prototype developed for college research project evaluation.
> Operates 100% locally in the browser runtime with real-time simulated thermal physics, dual-sensor coherence models, ESP32 cryptographic interlocks, and SHA-256 tamper-evident evidence preservation.

---

## ❄️ System Overview

**ColdTrace-AI** models an industrial pharmaceutical/biologics cold-storage facility requiring strict cold-chain compliance (standard safe envelope: **2.0°C to 8.0°C**). The system integrates cyber-physical threat monitoring with forensic telemetry logging to evaluate attacks against industrial IoT infrastructures without requiring physical microcontrollers or cloud services.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

---

## 🛠️ Key Features & Capabilities

### 1. Digital Cold-Storage Environment & Physics
- **Cross-Sectional Chamber Graphic**: Visualizes the insulated vault, 3.2kW compressor evaporator with animated fan airflow, heavy magnetic freezer door, and dual sensor positions.
- **Thermal Model**:
  $$\Delta T = k_{\text{leakage}} \cdot (T_{\text{ambient}} - T_{\text{current}}) - P_{\text{cooling}} + P_{\text{disturbance}}$$
  - **Closed Door**: $k_{\text{leakage}} = 0.008$ (slow ambient dissipation).
  - **Open Door**: $k_{\text{leakage}} = 0.08$ (10× rapid convective heat exchange).
  - **Compressor ON**: $P_{\text{cooling}} = 0.07$ (active refrigeration extraction).
  - **Compressor OFF**: $P_{\text{cooling}} = 0$ (passive heat drift).
- **Interactive Controls**:
  - Continuous temperature slider (-10°C to 30°C)
  - Step buttons ($\pm 1.0^\circ\text{C}$) & exact numeric input
  - Door open/close toggle (with continuous unsealed timer)
  - Cooling compressor power switch
  - Ambient outside temperature & internal disturbance sliders
  - Target safe storage range config ([Min – Max])

### 2. Sensor Array & Dual-Channel Coherence
- **Primary Sensor**: Simulates a DS18B20 1-Wire transducer (Modes: `Online`, `Spoofed`, `Frozen`, `Disconnected`, plus calibration bias adjustment).
- **Secondary Reference Sensor**: Simulates an independent SHT40 I2C transducer.
- **Sensor Inconsistency Detection**: When $|T_{\text{primary}} - T_{\text{reference}}| > 1.8^\circ\text{C}$, ColdTrace-AI flags a potential probe failure, calibration drift, or data injection attack.

### 3. Cybersecurity Adversary Simulator
- **Replay Attack**: Injects an expired actuator command payload with a previously consumed nonce. The simulated ESP32 interlock drops the packet via sliding replay window checks.
- **Unauthorized Actuator Command**: Injects an unauthenticated `OVERRIDE_KILL_COOLING_RELAY` command from an unregistered IP; the ESP32 interlock blocks execution.
- **Sensor Spoofing**: Simulates false data injection on the primary channel while physical air and reference sensors confirm nominal cold conditions.
- **Network Blackout**: Disconnects edge gateway telemetry to simulate denial-of-service or physical cabling disruption.

### 4. Dynamic ColdTrace-AI Risk Engine & Detection Rules
- Evaluates 10 real-time security rules.
- Computes dynamic **Risk Score (0–100)**:
  - `0–30`: **Low** (nominal operations)
  - `31–60`: **Moderate** (single operational drift or unsealed door)
  - `61–80`: **High** (sensor inconsistency or compressor cutoff)
  - `81–100`: **Critical** (adversarial replay, spoofing, or evidence tampering)
- Disambiguates between:
  1. Operational Anomaly
  2. Sensor Inconsistency
  3. Suspicious Cyber Activity
  4. Evidence Integrity Breach

### 5. Cryptographic Evidence Ledger & Tamper Detection
- Generates continuous event records with monotonic sequence numbers, timestamps, and full telemetry payload.
- Computes SHA-256 cryptographic digests in browser via standard **Web Crypto API** (`window.crypto.subtle.digest`).
- **Simulate Evidence Tampering**: Mutates a stored historical database record retroactively.
- **Verify Record Integrity**: Re-evaluates hashes against payload. Highlights corrupted records with **HASH_MISMATCH** warnings and triggers forensic alerts.
- *Forensic Principle*: Hashes verify record integrity after capture, not the physical truthfulness of the initial sensor measurement.

### 6. Forensic Investigation & Incident Reconstruction
- Generates detailed incident reports containing:
  - Incident title, timestamp, and severity
  - Primary & reference sensor divergence delta
  - Vault door & cooling compressor operational states
  - Replay and unauthorized actuator logs
  - Root cause deduction and prioritized remediation steps
  - Expert forensic conclusion
- Export reports as **JSON** or formatted **.txt** investigation files.

### 7. Instant 1-Click Evaluation Scenarios
1. **Normal Operation**: Stable 4.2°C, door sealed, cooling ON, dual sensors aligned.
2. **Temperature Excursion**: Door unsealed and compressor cuts out; temperature warms > 11°C.
3. **Sensor Manipulation**: Primary sensor spoofed to 14.8°C while reference confirms 4.3°C.
4. **Cooling Failure**: Compressor abruptly cuts out; benign operational warming where sensors agree.
5. **Replay Attack**: Duplicate nonce frame rejected by ESP32 interlock.
6. **Evidence Tampering**: Mutated database record triggers SHA-256 integrity failure.

### 8. System Architecture Visualization
Illustrates the pipeline:
$$\text{Sensors + Door} \longrightarrow \text{ESP32 Interlock} \longrightarrow \text{Raspberry Pi Gateway} \longrightarrow \text{ColdTrace-AI Analytics} \longrightarrow \text{Dashboard \& Forensics}$$

Emphasizes critical safety boundary separation:
- **ESP32**: Hardware-enforced deterministic command validation and immutable safety rules.
- **Raspberry Pi**: Industrial edge telemetry gateway.
- **ColdTrace-AI**: Advisory analytics and anomaly detection. **The AI does not directly actuate safety-critical plant machinery.**

---

## 💻 Tech Stack

- **React 18** + **TypeScript**
- **Tailwind CSS** (Industrial dark navy/cyan cybersecurity theme)
- **Recharts** (Live multi-sensor thermal charts with threshold bands)
- **Lucide Icons**
- **Vite**
- **Web Crypto API** (Browser-native SHA-256 hashing)

# Cold-Storage-Security-Prototype.
