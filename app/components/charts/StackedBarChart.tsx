import React from 'react';
import styles from './charts.module.css';
import { cls } from '~/utils';

export interface StackedBarCategory {
  category: string;
  values: Record<string, number>; // key = series name, value = numeric value
}

export interface StackedBarChartProps {
  value: StackedBarCategory[]; // data array
  horizontal?: boolean;        // horizontal orientation (default false = vertical)
  legend?: boolean;            // show legend
  gridlines?: boolean;         // show gridlines
  axesLabels?: boolean;        // show min/max axis labels
  valueLabels?: boolean;       // show value labels atop stacks
  max?: number;                // optional external max override
  /** Provide color mapping for series; otherwise colors are auto-generated */
  colors?: Record<string, string>;
  /** Tick specification: number => count (inclusive of endpoints), array => explicit tick values */
  ticks?: number | number[];
  /** Relative stacking: each column/row normalizes to 100% instead of using global max */
  relative?: boolean;
  /** Enable width/height transition animation */
  animate?: boolean;
  /** Enable floating tooltip on hover */
  tooltip?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const defaultPalette = [
  'var(--riv-indigo)',
  'var(--riv-green)',
  'var(--riv-orange)',
  'var(--riv-pink)',
  'var(--riv-blue)',
  'var(--riv-cyan)',
  'var(--riv-purple)',
];

export default function StackedBarChart({
  value,
  horizontal = false,
  legend = true,
  gridlines = true,
  axesLabels = true,
  valueLabels = false,
  max,
  colors = {},
  ticks,
  relative = false,
  animate = true,
  tooltip = true,
  className,
  style,
}: StackedBarChartProps) {
  // Collect the ordered list of series names
  const seriesSet = React.useMemo(() => {
    const s = new Set<string>();
    value.forEach(cat => Object.keys(cat.values).forEach(k => s.add(k)));
    return Array.from(s);
  }, [value]);

  // Auto-assign colors if missing
  const seriesColors: Record<string, string> = {};
  seriesSet.forEach((name, i) => {
    seriesColors[name] = colors[name] || defaultPalette[i % defaultPalette.length];
  });

  // Compute stack totals and max
  const totals = React.useMemo(() => value.map(v => Object.values(v.values).reduce((a, b) => a + b, 0)), [value]);
  const computedMax = React.useMemo(() => {
    if (relative) return 1; // normalized scale
    return max ?? Math.max(1, ...totals);
  }, [relative, max, totals]);

  // Derive ticks
  const tickValues = React.useMemo(() => {
    if (!axesLabels && !gridlines) return [] as number[];
    if (Array.isArray(ticks)) {
      return [...ticks].sort((a, b) => a - b);
    }
    const count = typeof ticks === 'number' ? Math.max(2, ticks) : 5; // default 5
    const span = computedMax;
    const arr: number[] = [];
    for (let i = 0; i < count; i++) {
      arr.push((span / (count - 1)) * i);
    }
    return arr;
  }, [ticks, computedMax, axesLabels, gridlines]);

  // Tooltip state
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [tip, setTip] = React.useState<{ x: number; y: number; category: string; series: string; value: number; percent: number } | null>(null);

  const hideTip = () => setTip(null);
  const showTip = (e: React.MouseEvent, category: string, series: string, valueNum: number, total: number) => {
    if (!tooltip) return;
    const root = rootRef.current;
    const rect = root?.getBoundingClientRect();
    const percent = total === 0 ? 0 : (valueNum / (relative ? total : computedMax)) * 100;
    if (rect) {
      const localX = e.clientX - rect.left + 4;
      const localY = e.clientY - rect.top + 4;
      // Clamp so tooltip stays within bounds (assume max size 160x80)
      const maxX = rect.width - 170;
      const maxY = rect.height - 90;
      setTip({
        x: Math.max(0, Math.min(localX, maxX)),
        y: Math.max(0, Math.min(localY, maxY)),
        category,
        series,
        value: valueNum,
        percent,
      });
    }
  };

  // Gridline positions (exclude 0) based on ticks
  const gridPercents = tickValues
    .filter(v => v > 0 && v < computedMax)
    .map(v => v / computedMax);

  return (
    <div ref={rootRef} className={cls(styles.chartRoot, className || '')} style={style}>
      {/* Chart body differs by orientation / axis label placement */}
      {horizontal ? (
        <>
          <div className={cls(styles.chartArea, { [styles.horizontal]: horizontal })}>
            {gridlines && (
              <div className={cls(styles.gridlines, { [styles.horizontal]: horizontal })}>
                {gridPercents.map(p => (
                  <div
                    key={p}
                    className={styles.gridline}
                    style={{ left: `${p * 100}%` }}
                  />
                ))}
              </div>
            )}
            <div className={styles.rowsWrapper}>
                  {value.map((cat, idx) => {
                    const total = totals[idx];
                return (
                  <div key={cat.category} className={styles.row}> 
                    <div className={styles.rowLabel}>{cat.category}</div>
                    <div className={styles.rowBar}>
                      {seriesSet.map(series => {
                        const val = cat.values[series] || 0;
                        const denom = relative ? (total || 1) : computedMax;
                        const sizeStyle = { width: `${(val / (denom || 1)) * 100}%` };
                        const percent = total === 0 ? 0 : (val / (relative ? total : computedMax)) * 100;
                        return (
                          <div
                            key={series}
                            className={cls(styles.stackSegment, { [styles.horizontal]: horizontal, [styles.animate]: animate })}
                            style={{ ...sizeStyle, background: seriesColors[series] }}
                            onMouseEnter={(e) => showTip(e, cat.category, series, val, total)}
                            onMouseMove={(e) => showTip(e, cat.category, series, val, total)}
                            onMouseLeave={hideTip}
                            aria-label={`${cat.category} ${series} ${val}`}
                          >
                            {valueLabels && val > 0 && (
                              <span className={cls(styles.valueLabel, { [styles.horizontal]: horizontal })}>
                                {relative ? `${Math.round(percent)}%` : val}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {axesLabels && (
            <div className={cls(styles.axisLabels, { [styles.horizontal]: horizontal })}>
              <span>0</span>
              <span>{relative ? '100%' : computedMax}</span>
            </div>
          )}
        </>
      ) : (
        <div className={styles.chartInner}>
          {axesLabels && (
            <div className={styles.yAxis}>
              {tickValues.slice().reverse().map(tv => (
                <span key={tv}>{relative ? `${Math.round((tv / (computedMax || 1)) * 100)}%` : tv}</span>
              ))}
            </div>
          )}
          <div className={cls(styles.chartArea)}>
            {gridlines && (
              <div className={cls(styles.gridlines)}>
                {gridPercents.map(p => (
                  <div key={p} className={styles.gridline} style={{ bottom: `${p * 100}%` }} />
                ))}
              </div>
            )}
            {value.map((cat, idx) => {
              const total = totals[idx];
              return (
                <div key={cat.category} className={cls(styles.barsColumn)}>
                  {seriesSet.map(series => {
                    const val = cat.values[series] || 0;
                    const denom = relative ? (total || 1) : computedMax;
                    const sizeStyle = { height: `${(val / (denom || 1)) * 100}%` };
                    const percent = total === 0 ? 0 : (val / (relative ? total : computedMax)) * 100;
                    return (
                      <div
                        key={series}
                        className={cls(styles.stackSegment, { [styles.animate]: animate })}
                        style={{ ...sizeStyle, background: seriesColors[series] }}
                        onMouseEnter={(e) => showTip(e, cat.category, series, val, total)}
                        onMouseMove={(e) => showTip(e, cat.category, series, val, total)}
                        onMouseLeave={hideTip}
                        aria-label={`${cat.category} ${series} ${val}`}
                      >
                        {valueLabels && val > 0 && (
                          <span className={cls(styles.valueLabel)}>{relative ? `${Math.round(percent)}%` : val}</span>
                        )}
                      </div>
                    );
                  })}
                  <div className={cls(styles.categoryLabel)}>{cat.category}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {legend && (
        <div className={styles.legend}>
          {seriesSet.map(name => (
            <div key={name} className={styles.legendItem}>
              <span className={styles.legendSwatch} style={{ background: seriesColors[name] }} />
              <span>{name}</span>
            </div>
          ))}
        </div>
      )}
      {tooltip && tip && (
        <div className={styles.tooltip} style={{ left: tip.x, top: tip.y }} role="tooltip">
          <div className={styles.tooltipTitle}>{tip.category}</div>
          <div className={styles.tooltipLine}><strong>{tip.series}</strong>: {tip.value} {relative ? `(${Math.round(tip.percent)}%)` : ''}</div>
        </div>
      )}
    </div>
  );
}
