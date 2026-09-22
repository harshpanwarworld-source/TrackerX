import React, { useState } from 'react';

interface EquityPoint {
  time: number;
  equity: number;
  tradeIndex: number;
  pnl: number;
}

interface DailyPnlPoint {
  date: string;
  pnl: number;
  tradesCount: number;
}

export function EquityCurveChart({ data }: { data: EquityPoint[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length < 2) {
    return (
      <div className="h-64 flex items-center justify-center text-neutral-500 text-sm border border-neutral-800/80 rounded-xl bg-neutral-900/40">
        Insufficient trade data for equity curve.
      </div>
    );
  }

  const equities = data.map(d => d.equity);
  const minEquity = Math.min(...equities) * 0.995;
  const maxEquity = Math.max(...equities) * 1.005;
  const range = maxEquity - minEquity || 1;

  const width = 800;
  const height = 260;
  const padTop = 20;
  const padBottom = 30;
  const padLeft = 65;
  const padRight = 20;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const getX = (i: number) => padLeft + (i / (data.length - 1)) * chartW;
  const getY = (val: number) => padTop + chartH - ((val - minEquity) / range) * chartH;

  // Build path
  const points = data.map((d, i) => `${getX(i)},${getY(d.equity)}`);
  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${getX(data.length - 1)},${padTop + chartH} L ${padLeft},${padTop + chartH} Z`;

  // Calculate high-water mark peak line
  let peak = data[0].equity;
  const peakPoints = data.map((d, i) => {
    if (d.equity > peak) peak = d.equity;
    return `${getX(i)},${getY(peak)}`;
  });
  const peakLinePath = `M ${peakPoints.join(' L ')}`;

  const activePoint = hoveredIndex !== null ? data[hoveredIndex] : data[data.length - 1];

  return (
    <div className="relative w-full overflow-hidden">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-3 px-1 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-cyan-400 rounded-full inline-block"></span>
            <span className="text-neutral-400 font-medium">Cumulative Equity</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 border-t border-dashed border-neutral-500 inline-block"></span>
            <span className="text-neutral-500">High-Water Mark</span>
          </div>
        </div>
        {activePoint && (
          <div className="flex items-center gap-3 font-mono">
            <span className="text-neutral-400">{new Date(activePoint.time).toLocaleDateString()}</span>
            <span className="font-semibold text-neutral-200">
              ${activePoint.equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={activePoint.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {activePoint.pnl >= 0 ? '+' : ''}${activePoint.pnl.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto cursor-crosshair select-none"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <defs>
          <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = padTop + chartH * ratio;
          const val = maxEquity - ratio * range;
          return (
            <g key={idx}>
              <line x1={padLeft} y1={y} x2={width - padRight} y2={y} stroke="#1f242d" strokeDasharray="3 3" />
              <text x={padLeft - 8} y={y + 4} textAnchor="end" fill="#525866" fontSize="10" className="font-mono">
                ${Math.round(val).toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* High water mark peak line */}
        <path d={peakLinePath} fill="none" stroke="#4b5563" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.8" />

        {/* Gradient fill */}
        <path d={areaPath} fill="url(#equityGrad)" />

        {/* Main Equity line */}
        <path d={linePath} fill="none" stroke="#06b6d4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Interactive hover line and points */}
        {data.map((d, i) => {
          const cx = getX(i);
          const cy = getY(d.equity);
          const isHovered = hoveredIndex === i;

          return (
            <g key={i}>
              <rect
                x={cx - chartW / (data.length * 2)}
                y={padTop}
                width={chartW / data.length}
                height={chartH}
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(i)}
              />
              {isHovered && (
                <>
                  <line x1={cx} y1={padTop} x2={cx} y2={padTop + chartH} stroke="#06b6d4" strokeDasharray="2 2" strokeWidth="1" />
                  <circle cx={cx} cy={cy} r="4.5" fill="#06b6d4" stroke="#0a0b0d" strokeWidth="2" />
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function DailyPnlChart({ data }: { data: DailyPnlPoint[] }) {
  const [hoveredDate, setHoveredDate] = useState<DailyPnlPoint | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-neutral-500 text-sm border border-neutral-800/80 rounded-xl bg-neutral-900/40">
        No daily P&L records found.
      </div>
    );
  }

  const pnls = data.map(d => d.pnl);
  const maxAbsPnl = Math.max(...pnls.map(Math.abs), 500);

  const width = 800;
  const height = 180;
  const padTop = 15;
  const padBottom = 25;
  const padLeft = 55;
  const padRight = 15;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;
  const zeroY = padTop + chartH / 2;

  const barWidth = Math.max(3, Math.min(22, (chartW / data.length) * 0.65));

  return (
    <div className="relative w-full overflow-hidden">
      <div className="flex items-center justify-between mb-2 px-1 text-xs">
        <span className="text-neutral-400 font-medium">Daily Realized Net P&L</span>
        {hoveredDate && (
          <span className="font-mono text-neutral-300">
            {hoveredDate.date}:{' '}
            <strong className={hoveredDate.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {hoveredDate.pnl >= 0 ? '+' : ''}${hoveredDate.pnl.toFixed(2)}
            </strong>{' '}
            ({hoveredDate.tradesCount} {hoveredDate.tradesCount === 1 ? 'trade' : 'trades'})
          </span>
        )}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none" onMouseLeave={() => setHoveredDate(null)}>
        {/* Zero baseline */}
        <line x1={padLeft} y1={zeroY} x2={width - padRight} y2={zeroY} stroke="#374151" strokeWidth="1.2" />

        {/* +/- max labels */}
        <text x={padLeft - 8} y={padTop + 8} textAnchor="end" fill="#525866" fontSize="10" className="font-mono">
          +${Math.round(maxAbsPnl)}
        </text>
        <text x={padLeft - 8} y={zeroY + 3} textAnchor="end" fill="#525866" fontSize="10" className="font-mono">
          $0
        </text>
        <text x={padLeft - 8} y={height - padBottom - 2} textAnchor="end" fill="#525866" fontSize="10" className="font-mono">
          -${Math.round(maxAbsPnl)}
        </text>

        {data.map((d, i) => {
          const x = padLeft + (i / (data.length - 1 || 1)) * (chartW - barWidth);
          const barHeight = (Math.abs(d.pnl) / maxAbsPnl) * (chartH / 2);
          const y = d.pnl >= 0 ? zeroY - barHeight : zeroY;
          const isPos = d.pnl >= 0;

          return (
            <g key={d.date} onMouseEnter={() => setHoveredDate(d)} className="cursor-pointer">
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(2, barHeight)}
                fill={isPos ? '#10b981' : '#f43f5e'}
                rx="1.5"
                opacity={hoveredDate && hoveredDate.date !== d.date ? 0.4 : 0.9}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function WinLossDonutChart({
  winRate,
  wins,
  losses,
  breakevens,
}: {
  winRate: number;
  wins: number;
  losses: number;
  breakevens: number;
}) {
  const total = wins + losses + breakevens || 1;
  const winPercent = (wins / total) * 100;
  const lossPercent = (losses / total) * 100;
  const bePercent = (breakevens / total) * 100;

  const size = 130;
  const strokeW = 12;
  const radius = (size - strokeW) / 2;
  const circumference = 2 * Math.PI * radius;

  const winDash = (winPercent / 100) * circumference;
  const lossDash = (lossPercent / 100) * circumference;
  const beDash = (bePercent / 100) * circumference;

  return (
    <div className="flex items-center gap-5">
      <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="#1f242d" strokeWidth={strokeW} fill="transparent" />
          {/* Wins */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#10b981"
            strokeWidth={strokeW}
            fill="transparent"
            strokeDasharray={`${winDash} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="round"
          />
          {/* Losses */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#f43f5e"
            strokeWidth={strokeW}
            fill="transparent"
            strokeDasharray={`${lossDash} ${circumference}`}
            strokeDashoffset={-winDash}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold font-mono text-neutral-100">{winRate}%</span>
          <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Win Rate</span>
        </div>
      </div>

      <div className="space-y-2 text-xs flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
            <span className="text-neutral-400">Winning Trades</span>
          </div>
          <span className="font-mono font-semibold text-neutral-200">{wins}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
            <span className="text-neutral-400">Losing Trades</span>
          </div>
          <span className="font-mono font-semibold text-neutral-200">{losses}</span>
        </div>
        {breakevens > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-neutral-600"></span>
              <span className="text-neutral-400">Breakeven</span>
            </div>
            <span className="font-mono font-semibold text-neutral-200">{breakevens}</span>
          </div>
        )}
      </div>
    </div>
  );
}
