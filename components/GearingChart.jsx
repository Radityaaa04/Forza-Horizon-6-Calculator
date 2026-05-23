'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

export default function GearingChart({ chartData, peakTorqueRpm, peakPowerRpm, redlineRpm }) {
  if (!chartData || chartData.length === 0) {
    return (
      <div className="empty-results">
        <div className="empty-results-icon">📈</div>
        <div className="empty-results-text">
          Belum ada grafik. Silakan isi form atau upload screenshot terlebih dahulu.
        </div>
      </div>
    );
  }

  // Get keys (G1, G2, etc.) from the first few objects to dynamically render Lines
  const gearKeys = Object.keys(chartData[0]).filter(k => k.startsWith('G'));
  if (chartData.length > 1) {
      const moreKeys = Object.keys(chartData[2] || {}).filter(k => k.startsWith('G'));
      moreKeys.forEach(k => { if (!gearKeys.includes(k)) gearKeys.push(k); });
  }
  // Better approach: find all unique gear keys across all data
  const allGearKeys = new Set();
  chartData.forEach(d => Object.keys(d).forEach(k => k.startsWith('G') && allGearKeys.add(k)));
  const gears = Array.from(allGearKeys).sort();

  // Colors for different gears (gradient aesthetic)
  const colors = [
    '#f97316', '#ff4b5c', '#fb923c', '#ffa600', 
    '#22c55e', '#22d3ee', '#0088ff', '#22d3ee', 
    '#c850c0', '#f97316'
  ];

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          
          <XAxis 
            dataKey="speed" 
            type="number" 
            domain={['dataMin', 'dataMax']}
            tickFormatter={(val) => Math.round(val)}
            stroke="rgba(255,255,255,0.2)"
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'monospace' }}
            label={{ value: 'Speed (Relative)', position: 'insideBottom', offset: -10, fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
          />
          
          <YAxis 
            domain={[0, redlineRpm ? parseInt(redlineRpm) + 500 : 10000]}
            stroke="rgba(255,255,255,0.2)"
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'monospace' }}
            label={{ value: 'RPM', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
          />
          
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(6, 6, 15, 0.9)', 
              borderColor: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontFamily: 'monospace',
              backdropFilter: 'blur(10px)'
            }}
            itemStyle={{ color: '#fff' }}
            labelStyle={{ color: 'var(--color-accent)' }}
            formatter={(value, name) => [`${value} RPM`, name]}
            labelFormatter={(label) => `Speed: ${label}`}
          />

          {/* Reference Lines for Powerband */}
          {peakTorqueRpm && (
            <ReferenceLine 
              y={parseInt(peakTorqueRpm)} 
              stroke="#f97316" 
              strokeDasharray="4 4" 
              opacity={0.5} 
              label={{ position: 'top', value: 'Peak Torque', fill: '#f97316', fontSize: 10, opacity: 0.8 }} 
            />
          )}
          
          {peakPowerRpm && (
            <ReferenceLine 
              y={parseInt(peakPowerRpm)} 
              stroke="#f97316" 
              strokeDasharray="4 4" 
              opacity={0.5} 
              label={{ position: 'top', value: 'Peak Power', fill: '#f97316', fontSize: 10, opacity: 0.8 }} 
            />
          )}
          
          {redlineRpm && (
            <ReferenceLine 
              y={parseInt(redlineRpm)} 
              stroke="#ef4444" 
              strokeDasharray="3 3" 
              opacity={0.6} 
              label={{ position: 'top', value: 'Redline', fill: '#ef4444', fontSize: 10, opacity: 0.8 }} 
            />
          )}

          {/* Plot each gear */}
          {gears.map((gear, idx) => (
            <Line
              key={gear}
              type="linear"
              dataKey={gear}
              stroke={colors[idx % colors.length]}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: colors[idx % colors.length], stroke: '#fff', strokeWidth: 2 }}
              connectNulls={false}
              animationDuration={1000}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
