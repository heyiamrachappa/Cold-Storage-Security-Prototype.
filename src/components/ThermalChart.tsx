import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { useSimulation } from '../context/SimulationContext';
import { TrendingUp, Activity, SlidersHorizontal } from 'lucide-react';

export const ThermalChart: React.FC = () => {
  const { 
    temperatureHistory, 
    targetMin, 
    targetMax, 
    actualTemp,
    primarySensor,
    referenceSensor
  } = useSimulation();

  const pVal = primarySensor.reading;
  const rVal = referenceSensor.reading;
  const delta = (pVal !== null && rVal !== null) ? Math.abs(pVal - rVal) : null;

  // Calculate rate of change over the last 6 data points
  let rateOfChange = 0;
  if (temperatureHistory.length >= 6) {
    const recent = temperatureHistory.slice(-6);
    const dtSeconds = (recent[recent.length - 1].timestamp - recent[0].timestamp) / 1000;
    const dTemp = recent[recent.length - 1].actualTemp - recent[0].actualTemp;
    if (dtSeconds > 0) {
      rateOfChange = Math.round((dTemp / (dtSeconds / 60)) * 10) / 10;
    }
  }

  return (
    <div className="rounded-xl border border-[#1b2b48] bg-[#080e1b] p-4 shadow-xl">
      <div className="flex flex-wrap items-center justify-between pb-3 mb-2 border-b border-[#182845] gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-950/60 text-blue-400 border border-blue-800/40">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Real-Time Thermal Dynamics & Sensor Coherence</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Live trend comparison: Physical chamber vs. Primary DS18B20 vs. Reference SHT40
            </p>
          </div>
        </div>

        {/* Live Metrics Header */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="px-2 py-1 rounded bg-[#0f192b] border border-[#1b2f52] text-slate-300">
            Sensor Divergence Δ: <span className={`font-bold ${delta && delta > 1.8 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
              {delta !== null ? `${delta.toFixed(1)}°C` : 'N/A'}
            </span>
          </div>

          <div className="px-2 py-1 rounded bg-[#0f192b] border border-[#1b2f52] text-slate-300">
            Thermal Velocity: <span className={`font-bold ${Math.abs(rateOfChange) > 2 ? 'text-amber-400' : 'text-cyan-300'}`}>
              {rateOfChange > 0 ? `+${rateOfChange}` : rateOfChange}°C/min
            </span>
          </div>
        </div>
      </div>

      {/* Chart container */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={temperatureHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#132138" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#41577c" 
              fontSize={10} 
              tickLine={false} 
              axisLine={{ stroke: '#1a2b47' }}
            />
            <YAxis 
              stroke="#41577c" 
              fontSize={10} 
              tickLine={false} 
              axisLine={{ stroke: '#1a2b47' }}
              domain={['auto', 'auto']}
              unit="°C"
            />
            
            {/* Safe Target Cold-Chain Range Shading */}
            <ReferenceArea 
              y1={targetMin} 
              y2={targetMax} 
              fill="#00e676" 
              fillOpacity={0.06} 
              stroke="#00e676" 
              strokeOpacity={0.3} 
              strokeDasharray="4 4"
            />

            <ReferenceLine y={targetMax} stroke="#ff5252" strokeDasharray="3 3" opacity={0.6} />
            <ReferenceLine y={targetMin} stroke="#2979ff" strokeDasharray="3 3" opacity={0.6} />

            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#09101e', 
                borderColor: '#1d3054', 
                borderRadius: '8px',
                fontSize: '11px',
                color: '#e2e8f0',
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
              }}
              formatter={(value: any, name: any) => {
                const label = 
                  name === 'actualTemp' ? 'Physical Chamber' :
                  name === 'primaryReading' ? 'Primary DS18B20' :
                  name === 'referenceReading' ? 'Reference SHT40' : String(name || '');
                return [`${value !== null ? `${value}°C` : 'OFFLINE'}`, label];
              }}
            />

            {/* True Chamber Physical Temperature */}
            <Line 
              type="monotone" 
              dataKey="actualTemp" 
              name="actualTemp"
              stroke="#00f0ff" 
              strokeWidth={2.5} 
              dot={false}
              isAnimationActive={false}
            />

            {/* Primary Sensor Reading */}
            <Line 
              type="monotone" 
              dataKey="primaryReading" 
              name="primaryReading"
              stroke="#ffb300" 
              strokeWidth={2} 
              strokeDasharray="4 3"
              dot={false}
              isAnimationActive={false}
            />

            {/* Reference Sensor Reading */}
            <Line 
              type="monotone" 
              dataKey="referenceReading" 
              name="referenceReading"
              stroke="#00e676" 
              strokeWidth={1.8} 
              strokeDasharray="2 2"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & explanations */}
      <div className="flex flex-wrap items-center justify-between pt-3 mt-1 border-t border-[#14233c] text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-cyan-400 inline-block" />
            <span className="text-slate-300">Physical Chamber (°C)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-amber-400 border-b border-dashed border-amber-400 inline-block" />
            <span className="text-slate-300">Primary DS18B20</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-emerald-400 border-b border-dotted border-emerald-400 inline-block" />
            <span className="text-slate-300">Reference SHT40</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/20 border border-emerald-500/50" />
            <span>Safe Storage Band [2°C – 8°C]</span>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          Sample window: 35 intervals
        </div>
      </div>
    </div>
  );
};
