import React from 'react';
import { cls } from '../../utils';
import Dropdown from '../popups/Dropdown';
import Slot from '../slots/Slot';
import styles from './pickers.module.css';
import type { PopupCloseSlotProps, PopupTriggerSlotProps } from '~/types';
import Button from '../buttons/Button';

type ViewMode = 'days' | 'months' | 'years';

export interface DateRange {
  start?: Date;
  end?: Date;
}

interface DatePickerProps {
  value?: Date | null;
  range?: boolean;
  rangeValue?: DateRange;
  onChange?: (date: Date) => void;
  onRangeChange?: (range: DateRange) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isSameDay(a?: Date | null, b?: Date | null) {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function inRange(d: Date, start?: Date, end?: Date) {
  if (!start || !end) return false;
  const t = +startOfDay(d);
  return t >= +startOfDay(start) && t <= +startOfDay(end);
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function DatePicker({
  value = null,
  range,
  rangeValue,
  onChange,
  onRangeChange,
  minDate,
  maxDate,
  placeholder = 'Select date',
  disabled,
  className,
}: DatePickerProps) {

  // view anchor month
  const init = value ?? rangeValue?.start ?? new Date();
  const [viewYear, setViewYear] = React.useState(init.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(init.getMonth());
  const [mode, setMode] = React.useState<ViewMode>('days');
  const [pendingRange, setPendingRange] = React.useState<DateRange | undefined>(undefined);

  // navigate months
  const prevMonth = () => {
    const d = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };
  const nextMonth = () => {
    const d = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const selectMonth = (m: number) => {
    setViewMonth(m);
    setMode('days');
  };
  const selectYear = (y: number) => {
    setViewYear(y);
    setMode('months');
  };

  const header = (
    <div className={styles.dpHeader}>
      <button type="button" className={styles.dpNav} onClick={prevMonth} aria-label="Previous month">‹</button>
      <div className={styles.dpTitle}>
        <button type="button" className={styles.dpLink} onClick={() => setMode('months')}>{MONTH_NAMES[viewMonth]}</button>
        <button type="button" className={styles.dpLink} onClick={() => setMode('years')}>{viewYear}</button>
      </div>
      <button type="button" className={styles.dpNav} onClick={nextMonth} aria-label="Next month">›</button>
    </div>
  );

  function renderDays(onClose: () => void) {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: Array<{ date?: Date; label?: number; outside?: boolean }> = [];
    // leading blanks
    for (let i = 0; i < startWeekday; i++) cells.push({});
    // month days
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: new Date(viewYear, viewMonth, d), label: d });
    }

    const selDate = value ? startOfDay(value) : null;
    const rs = range ? (pendingRange ?? rangeValue ?? {}) : undefined;

    const handleClickDay = (d: Date) => {
      if (range) {
        if (!rs?.start || (rs.start && rs.end)) {
          // start new range
          const start = startOfDay(d);
          setPendingRange({ start });
        } else if (rs.start && !rs.end) {
          // set end and normalize order
          let start = rs.start;
          let end = startOfDay(d);
          if (+end < +start) [start, end] = [end, start];
          onRangeChange?.({ start, end });
          setPendingRange(undefined);
          onClose();
        }
      } else {
        onChange?.(startOfDay(d));
        onClose();
      }
    };

    return (
      <div className={styles.dpBody}>
        <div className={styles.dpWeekdays}>
          {WEEKDAY_NAMES.map((w) => (
            <div key={w} className={styles.dpWeekday}>{w}</div>
          ))}
        </div>
        <div className={styles.dpGrid}>
          {cells.map((c, i) => {
            const isSelected = selDate && c.date && isSameDay(c.date, selDate);
            const rstart = rs?.start ? startOfDay(rs.start) : undefined;
            const rend = rs?.end ? startOfDay(rs.end) : undefined;
            const isStart = rstart && c.date && isSameDay(c.date, rstart);
            const isEnd = rend && c.date && isSameDay(c.date, rend);
            const isBetween = c.date && rstart && rend ? inRange(c.date, rstart, rend) && !isStart && !isEnd : false;
            const disabledDay = (minDate && c.date && +startOfDay(c.date) < +startOfDay(minDate)) || (maxDate && c.date && +startOfDay(c.date) > +startOfDay(maxDate));
            return (
              <button
                key={i}
                type="button"
                className={cls(styles.dpCell, {
                  selected: !!isSelected,
                  rangeStart: !!isStart,
                  rangeEnd: !!isEnd,
                  inRange: !!isBetween,
                  outside: !!c.outside,
                })}
                disabled={!c.date || disabledDay}
                onClick={() => c.date && handleClickDay(c.date)}>
                {c.label ?? ''}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function renderMonths() {
    return (
      <div className={styles.dpBody}>
        <div className={styles.dpGridMonths}>
          {MONTH_NAMES.map((m, i) => (
            <button key={m} type="button" className={styles.dpCell} onClick={() => selectMonth(i)}>{m}</button>
          ))}
        </div>
      </div>
    );
  }

  function renderYears() {
    const start = Math.floor(viewYear / 12) * 12 - 1; // show previous/next outside years too
    const years = Array.from({ length: 14 }, (_, i) => start + i);
    return (
      <div className={styles.dpBody}>
        <div className={styles.dpGridMonths}>
          {years.map((y) => (
            <button key={y} type="button" className={styles.dpCell} onClick={() => selectYear(y)}>{y}</button>
          ))}
        </div>
      </div>
    );
  }

  const formatValue = () => {
    if (range) {
      const r = rangeValue;
      if (r?.start && r?.end) return `${r.start.toLocaleDateString()} – ${r.end.toLocaleDateString()}`;
      if (pendingRange?.start) return `${pendingRange.start.toLocaleDateString()} – …`;
      return '';
    }
    return value ? value.toLocaleDateString() : '';
  };

  return (
    <Dropdown>
      <Slot name="trigger">
        {({ onClick }: PopupTriggerSlotProps) => (
          <Button type="button" disabled={disabled} onClick={onClick}>
            {formatValue() || placeholder}
          </Button>
        )}
      </Slot>
      <Slot name="default">
        {({ onClose }: PopupCloseSlotProps) => (
          <div className={styles.dpContainer}>
            {header}
            {mode === 'days' && renderDays(onClose)}
            {mode === 'months' && renderMonths()}
            {mode === 'years' && renderYears()}
          </div>
        )}
      </Slot>
    </Dropdown>
  );
}