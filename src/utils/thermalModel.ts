export interface ThermalParams {
  currentTemp: number;
  ambientTemp: number;
  coolingActive: boolean;
  doorOpen: boolean;
  disturbance: number; // User offset or heat source
  dt: number; // delta time factor
}

/**
 * Calculates next temperature based on physical heat exchange model:
 * T_next = T_current + heat_exchange - cooling_effect + disturbance_effect
 */
export function calculateNextTemperature({
  currentTemp,
  ambientTemp,
  coolingActive,
  doorOpen,
  disturbance,
  dt = 1,
}: ThermalParams): number {
  // Heat exchange coefficient through insulation:
  // Closed door: small thermal leakage coefficient
  // Open door: heavy convective thermal exchange
  const kLeakage = doorOpen ? 0.08 : 0.008;
  const heatExchange = (ambientTemp - currentTemp) * kLeakage * dt;

  // Active refrigeration compressor cooling power
  // The cooler it gets, the higher thermal resistance, asymptoting near minimum compressor limit ~ -12°C
  let coolingEffect = 0;
  if (coolingActive) {
    if (currentTemp > -10) {
      coolingEffect = 0.07 * dt;
    } else {
      coolingEffect = Math.max(0, (currentTemp - (-12)) * 0.02 * dt);
    }
  }

  // External disturbance effect (e.g., heater placed inside or direct heat injection)
  const disturbanceEffect = disturbance * 0.05 * dt;

  const nextTemp = currentTemp + heatExchange - coolingEffect + disturbanceEffect;

  // Clamp within reasonable physical simulation bounds (-15°C to 45°C)
  return Math.round(Math.max(-15, Math.min(45, nextTemp)) * 100) / 100;
}
