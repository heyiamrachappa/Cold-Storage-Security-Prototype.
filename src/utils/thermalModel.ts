export interface ThermalParams {
  currentTemp: number;
  ambientTemp: number;
  coolingActive: boolean;
  doorOpen: boolean;
  disturbance: number; // User offset or heat source
  dt: number; // delta time factor
  targetSetpoint?: number; // Thermostat nominal setpoint (e.g. 4.2°C)
}

/**
 * Calculates next temperature based on physical heat exchange model:
 * T_next = T_current + heat_exchange - cooling_effect + disturbance_effect
 *
 * Designed with realistic industrial HVAC thermostatic feedback:
 * - When door is open: heavy convective heat ingress (+0.6°C to +1.0°C/tick).
 * - When door is closed and cooling is ON: active compressor pull-down
 *   smoothly drives temperature back down to target setpoint (~4.2°C)
 *   and dynamically throttles to maintain safe equilibrium.
 */
export function calculateNextTemperature({
  currentTemp,
  ambientTemp,
  coolingActive,
  doorOpen,
  disturbance,
  dt = 1,
  targetSetpoint = 4.2,
}: ThermalParams): number {
  // Convective heat exchange through perimeter insulation:
  // Closed door: small thermal leakage coefficient
  // Open door: heavy ambient air mixing
  const kLeakage = doorOpen ? 0.075 : 0.005;
  const heatExchange = (ambientTemp - currentTemp) * kLeakage * dt;

  // Active refrigeration compressor cooling power
  let coolingEffect = 0;
  if (coolingActive) {
    if (currentTemp > targetSetpoint) {
      // Temperature is higher than setpoint: active cooling pull-down
      // Stronger cooling proportional to thermal deviation, capped for realism
      const pullDownPower = Math.min(0.28, 0.08 + (currentTemp - targetSetpoint) * 0.035);
      coolingEffect = pullDownPower * dt;
    } else {
      // Temperature is at or below setpoint: thermostatic modulation
      // Compressor throttles to exactly balance passive ambient leakage and maintain ~setpoint
      coolingEffect = Math.max(0, heatExchange * 0.95);
      
      // If chamber is subcooled below setpoint - 0.5°C, compressor temporarily idles
      if (currentTemp < targetSetpoint - 0.5) {
        coolingEffect = 0;
      }
    }
  }

  // External disturbance effect (e.g., heater placed inside or direct heat injection)
  const disturbanceEffect = disturbance * 0.05 * dt;

  const nextTemp = currentTemp + heatExchange - coolingEffect + disturbanceEffect;

  // Clamp within reasonable physical simulation bounds (-15°C to 45°C)
  return Math.round(Math.max(-15, Math.min(45, nextTemp)) * 100) / 100;
}
