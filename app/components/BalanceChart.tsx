"use client"

import { useMemo, useState } from 'react';
import { DailyBalance } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

type PeriodType = '1month' | '3months' | '6months' | '1year' | '2years' | '5years';

interface BalanceChartProps {
  dailyBalances: DailyBalance[];
  initialBalance: number;
}

const PERIOD_OPTIONS: { value: PeriodType; label: string; months: number }[] = [
  { value: '1month', label: '1ヶ月', months: 1 },
  { value: '3months', label: '3ヶ月', months: 3 },
  { value: '6months', label: '6ヶ月', months: 6 },
  { value: '1year', label: '1年', months: 12 },
  { value: '2years', label: '2年', months: 24 },
  { value: '5years', label: '5年', months: 60 },
];

export default function BalanceChart({ dailyBalances, initialBalance }: BalanceChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('1year');
  const [includesPast, setIncludesPast] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; date: string; balance: number } | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);

  const chartData = useMemo(() => {
    const today = new Date();
    const selectedOption = PERIOD_OPTIONS.find(p => p.value === selectedPeriod)!;
    const totalMonths = selectedOption.months;

    const startDate = new Date(today);
    if (includesPast) {
      startDate.setMonth(today.getMonth() - Math.floor(totalMonths / 2));
    }
    const endDate = new Date(today);
    endDate.setMonth(
      today.getMonth() + (includesPast ? Math.ceil(totalMonths / 2) : totalMonths)
    );

    const balanceMap = new Map<string, number>();
    dailyBalances.forEach(day => {
      balanceMap.set(day.date, day.balance);
    });

    // startDate より前の最も近い日付の残高を初期値とする
    const startString = startDate.toISOString().split('T')[0];
    let currentBalance = initialBalance;
    for (const day of dailyBalances) {
      if (day.date < startString) {
        currentBalance = day.balance;
      } else {
        break;
      }
    }

    const dataPoints: { date: Date; dateString: string; balance: number }[] = [];
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateString = date.toISOString().split('T')[0];

      if (balanceMap.has(dateString)) {
        currentBalance = balanceMap.get(dateString)!;
      }

      dataPoints.push({
        date: new Date(date),
        dateString,
        balance: currentBalance,
      });
    }

    return dataPoints;
  }, [dailyBalances, initialBalance, selectedPeriod]);

  // Chart dimensions
  const width = 1000;
  const height = 400;
  const padding = { top: 20, right: 20, bottom: 60, left: 80 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate scales
  const minBalance = Math.min(...chartData.map(d => d.balance), 0);
  const maxBalance = Math.max(...chartData.map(d => d.balance), initialBalance);
  const balanceRange = maxBalance - minBalance;
  const balancePadding = balanceRange * 0.1;

  const yMin = minBalance - balancePadding;
  const yMax = maxBalance + balancePadding;

  // Handle mouse movement over chart
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert SVG coordinates to actual coordinates
    const svgX = (mouseX / rect.width) * width;
    const svgY = (mouseY / rect.height) * height;

    // Check if mouse is within chart area
    if (svgX < padding.left || svgX > padding.left + chartWidth ||
        svgY < padding.top || svgY > padding.top + chartHeight) {
      setHoveredPoint(null);
      setMousePosition(null);
      return;
    }

    // Find the closest data point
    const relativeX = svgX - padding.left;
    const dataIndex = Math.round((relativeX / chartWidth) * (chartData.length - 1));

    if (dataIndex >= 0 && dataIndex < chartData.length) {
      const point = chartData[dataIndex];
      const pointX = padding.left + (dataIndex / (chartData.length - 1)) * chartWidth;
      const pointY = padding.top + chartHeight - ((point.balance - yMin) / (yMax - yMin)) * chartHeight;

      setHoveredPoint({
        x: pointX,
        y: pointY,
        date: point.dateString,
        balance: point.balance,
      });
      setMousePosition({ x: mouseX, y: mouseY });
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
    setMousePosition(null);
  };

  // Generate path for the curve
  const path = useMemo(() => {
    if (chartData.length === 0) return '';

    const points = chartData.map((point, index) => {
      const x = padding.left + (index / (chartData.length - 1)) * chartWidth;
      const y = padding.top + chartHeight - ((point.balance - yMin) / (yMax - yMin)) * chartHeight;
      return { x, y };
    });

    // Create smooth curve using quadratic bezier curves
    let pathData = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const midX = (current.x + next.x) / 2;

      pathData += ` Q ${current.x} ${current.y}, ${midX} ${(current.y + next.y) / 2}`;
      pathData += ` Q ${next.x} ${next.y}, ${next.x} ${next.y}`;
    }

    return pathData;
  }, [chartData, chartWidth, chartHeight, yMin, yMax, padding]);

  // Generate area fill path
  const areaPath = useMemo(() => {
    if (chartData.length === 0) return '';

    const zeroY = padding.top + chartHeight - ((0 - yMin) / (yMax - yMin)) * chartHeight;
    const bottomY = padding.top + chartHeight;

    return `${path} L ${padding.left + chartWidth} ${bottomY} L ${padding.left} ${bottomY} Z`;
  }, [path, chartWidth, chartHeight, yMin, yMax, padding]);

  // Generate Y-axis labels
  const yAxisLabels = useMemo(() => {
    const labelCount = 5;
    const labels = [];
    for (let i = 0; i <= labelCount; i++) {
      const value = yMin + (yMax - yMin) * (i / labelCount);
      const y = padding.top + chartHeight - (i / labelCount) * chartHeight;
      labels.push({ value, y });
    }
    return labels;
  }, [yMin, yMax, chartHeight, padding]);

  // Generate X-axis labels (adjusted by period)
  const xAxisLabels = useMemo(() => {
    const labels = [];
    const selectedOption = PERIOD_OPTIONS.find(p => p.value === selectedPeriod)!;

    // Determine label count based on period
    const labelCount = selectedOption.months <= 1 ? 10 :
                      selectedOption.months <= 6 ? 12 :
                      selectedOption.months <= 12 ? 12 :
                      selectedOption.months <= 24 ? 12 : 16;

    const interval = Math.ceil(chartData.length / labelCount);

    for (let i = 0; i < chartData.length; i += interval) {
      const point = chartData[i];
      const x = padding.left + (i / (chartData.length - 1)) * chartWidth;

      // Format based on period length
      const format = selectedOption.months <= 3
        ? { month: 'short', day: 'numeric' }
        : selectedOption.months <= 12
        ? { month: 'short', day: 'numeric' }
        : { year: 'numeric', month: 'short' };

      labels.push({
        x,
        date: point.date,
        text: point.date.toLocaleDateString('ja-JP', format as Intl.DateTimeFormatOptions),
      });
    }

    return labels;
  }, [chartData, chartWidth, padding, selectedPeriod]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          残高推移グラフ
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIncludesPast(v => !v)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              includesPast
                ? 'bg-zinc-700 text-white dark:bg-zinc-200 dark:text-zinc-900'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }`}
            title="過去のデータも含めて表示"
          >
            {includesPast ? '過去も表示中' : '過去も表示'}
          </button>
          {PERIOD_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => setSelectedPeriod(option.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                selectedPeriod === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          style={{ maxHeight: '400px' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Grid lines */}
          {yAxisLabels.map((label, i) => (
            <line
              key={i}
              x1={padding.left}
              y1={label.y}
              x2={padding.left + chartWidth}
              y2={label.y}
              stroke="currentColor"
              strokeWidth="1"
              className="text-zinc-200 dark:text-zinc-700"
              strokeDasharray="4 4"
            />
          ))}

          {/* Zero line (if visible) */}
          {yMin < 0 && yMax > 0 && (
            <line
              x1={padding.left}
              y1={padding.top + chartHeight - ((0 - yMin) / (yMax - yMin)) * chartHeight}
              x2={padding.left + chartWidth}
              y2={padding.top + chartHeight - ((0 - yMin) / (yMax - yMin)) * chartHeight}
              stroke="currentColor"
              strokeWidth="2"
              className="text-zinc-400 dark:text-zinc-600"
            />
          )}

          {/* Area fill */}
          <path
            d={areaPath}
            fill="url(#gradient)"
            opacity="0.3"
          />

          {/* Line */}
          <path
            d={path}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Y-axis */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + chartHeight}
            stroke="currentColor"
            strokeWidth="2"
            className="text-zinc-300 dark:text-zinc-700"
          />

          {/* X-axis */}
          <line
            x1={padding.left}
            y1={padding.top + chartHeight}
            x2={padding.left + chartWidth}
            y2={padding.top + chartHeight}
            stroke="currentColor"
            strokeWidth="2"
            className="text-zinc-300 dark:text-zinc-700"
          />

          {/* Y-axis labels */}
          {yAxisLabels.map((label, i) => (
            <text
              key={i}
              x={padding.left - 10}
              y={label.y}
              textAnchor="end"
              dominantBaseline="middle"
              className="text-xs fill-zinc-600 dark:fill-zinc-400"
              style={{ fontFamily: 'system-ui, sans-serif' }}
            >
              {formatCurrency(label.value)}
            </text>
          ))}

          {/* Today line */}
          {(() => {
            const todayString = new Date().toISOString().split('T')[0];
            const todayIndex = chartData.findIndex(d => d.dateString === todayString);
            if (todayIndex < 0) return null;
            const todayX = padding.left + (todayIndex / Math.max(chartData.length - 1, 1)) * chartWidth;
            return (
              <>
                <line
                  x1={todayX}
                  y1={padding.top}
                  x2={todayX}
                  y2={padding.top + chartHeight}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  className="text-zinc-500 dark:text-zinc-400"
                />
                <text
                  x={todayX}
                  y={padding.top - 6}
                  textAnchor="middle"
                  className="text-[10px] fill-zinc-500 dark:fill-zinc-400 font-medium"
                  style={{ fontFamily: 'system-ui, sans-serif' }}
                >
                  今日
                </text>
              </>
            );
          })()}

          {/* X-axis labels */}
          {xAxisLabels.map((label, i) => (
            <text
              key={i}
              x={label.x}
              y={padding.top + chartHeight + 30}
              textAnchor="middle"
              className="text-xs fill-zinc-600 dark:fill-zinc-400"
              style={{ fontFamily: 'system-ui, sans-serif' }}
            >
              {label.text}
            </text>
          ))}

          {/* Hovered point indicator */}
          {hoveredPoint && (
            <>
              {/* Vertical line */}
              <line
                x1={hoveredPoint.x}
                y1={padding.top}
                x2={hoveredPoint.x}
                y2={padding.top + chartHeight}
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="4 4"
                className="text-blue-500"
              />
              {/* Horizontal line */}
              <line
                x1={padding.left}
                y1={hoveredPoint.y}
                x2={padding.left + chartWidth}
                y2={hoveredPoint.y}
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="4 4"
                className="text-blue-500"
              />
              {/* Point circle */}
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r="6"
                fill="white"
                stroke="#3b82f6"
                strokeWidth="3"
              />
              {/* Tooltip */}
              <g>
                <rect
                  x={hoveredPoint.x + 10}
                  y={hoveredPoint.y - 50}
                  width="180"
                  height="45"
                  rx="6"
                  fill="rgba(0, 0, 0, 0.9)"
                  stroke="#3b82f6"
                  strokeWidth="2"
                />
                <text
                  x={hoveredPoint.x + 20}
                  y={hoveredPoint.y - 30}
                  className="text-xs fill-white"
                  style={{ fontFamily: 'system-ui, sans-serif' }}
                >
                  {new Date(hoveredPoint.date).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </text>
                <text
                  x={hoveredPoint.x + 20}
                  y={hoveredPoint.y - 12}
                  className="text-sm font-semibold fill-white"
                  style={{ fontFamily: 'system-ui, sans-serif' }}
                >
                  {formatCurrency(hoveredPoint.balance)}
                </text>
              </g>
            </>
          )}

          {/* Gradients */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

    </div>
  );
}
