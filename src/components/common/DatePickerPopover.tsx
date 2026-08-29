import { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';
import type { EventItem } from '../../services/events';

export interface DateFilterValue {
  type: 'any' | 'preset' | 'specific';
  label: string;
  presetKey?: 'today' | 'tomorrow' | 'weekend' | 'week';
  dateKey?: string; // YYYY-MM-DD
}

interface DatePickerPopoverProps {
  value: DateFilterValue;
  onChange: (filter: DateFilterValue) => void;
  events: EventItem[];
}

export function DatePickerPopover({ value, onChange, events }: DatePickerPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Month navigation in calendar
  const [viewDate, setViewDate] = useState(() => {
    if (value.type === 'specific' && value.dateKey) {
      const d = new Date(value.dateKey);
      if (!isNaN(d.getTime())) return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    const sampleEventDate = events[0]?.dateKey;
    if (sampleEventDate) {
      const d = new Date(sampleEventDate);
      if (!isNaN(d.getTime())) return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    return new Date(2026, 7, 1); // Aug 2026
  });

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Set of dates that have workshops
  const eventDateCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const ev of events) {
      if (ev.dateKey) {
        counts.set(ev.dateKey, (counts.get(ev.dateKey) || 0) + 1);
      }
    }
    return counts;
  }, [events]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthName = new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
  }).format(viewDate);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const formatted = new Intl.DateTimeFormat('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(new Date(`${dateStr}T00:00:00`));

    onChange({
      type: 'specific',
      label: formatted,
      dateKey: dateStr,
    });
    setIsOpen(false);
  };

  const handleSelectPreset = (presetKey: 'today' | 'tomorrow' | 'weekend' | 'week', label: string) => {
    onChange({
      type: 'preset',
      label,
      presetKey,
    });
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange({
      type: 'any',
      label: 'Any date',
    });
    setIsOpen(false);
  };

  return (
    <div className="date-picker-wrapper" ref={containerRef}>
      <button
        type="button"
        className={`date-picker-trigger ${value.type !== 'any' ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Filter by date"
        aria-expanded={isOpen}
      >
        <CalendarIcon size={14} />
        <span className="date-picker-label">{value.label}</span>
        {value.type !== 'any' && (
          <span
            className="date-picker-clear-inline"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            title="Clear date filter"
          >
            <X size={12} />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="date-picker-popover">
          <div className="date-picker-popover-header">
            <span className="date-popover-title">Filter by Date</span>
            <button
              type="button"
              className="date-popover-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close date picker"
            >
              <X size={14} />
            </button>
          </div>

          {/* Quick Presets */}
          <div className="date-presets-row">
            <button
              type="button"
              className={`date-preset-chip ${value.type === 'any' ? 'active' : ''}`}
              onClick={handleClear}
            >
              Any date
            </button>
            <button
              type="button"
              className={`date-preset-chip ${value.type === 'preset' && value.presetKey === 'today' ? 'active' : ''}`}
              onClick={() => handleSelectPreset('today', 'Today')}
            >
              Today
            </button>
            <button
              type="button"
              className={`date-preset-chip ${value.type === 'preset' && value.presetKey === 'tomorrow' ? 'active' : ''}`}
              onClick={() => handleSelectPreset('tomorrow', 'Tomorrow')}
            >
              Tomorrow
            </button>
            <button
              type="button"
              className={`date-preset-chip ${value.type === 'preset' && value.presetKey === 'weekend' ? 'active' : ''}`}
              onClick={() => handleSelectPreset('weekend', 'This Weekend')}
            >
              Weekend
            </button>
            <button
              type="button"
              className={`date-preset-chip ${value.type === 'preset' && value.presetKey === 'week' ? 'active' : ''}`}
              onClick={() => handleSelectPreset('week', 'Next 7 Days')}
            >
              Next 7 Days
            </button>
          </div>

          {/* Mini Interactive Month Calendar */}
          <div className="date-calendar-section">
            <div className="date-month-nav">
              <button
                type="button"
                className="month-nav-btn"
                onClick={handlePrevMonth}
                aria-label="Previous month"
              >
                <ChevronLeft size={16} />
              </button>
              <strong>{monthName}</strong>
              <button
                type="button"
                className="month-nav-btn"
                onClick={handleNextMonth}
                aria-label="Next month"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="date-calendar-weekdays">
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
              <span>S</span>
            </div>

            <div className="date-calendar-grid">
              {Array.from({ length: firstDayIndex }, (_, i) => (
                <div key={`empty-${i}`} className="date-day empty" />
              ))}

              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dayDateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const eventCount = eventDateCounts.get(dayDateKey) || 0;
                const isSelected = value.type === 'specific' && value.dateKey === dayDateKey;

                return (
                  <button
                    key={`day-${day}`}
                    type="button"
                    className={`date-day-btn ${isSelected ? 'selected' : ''} ${eventCount > 0 ? 'has-events' : ''}`}
                    onClick={() => handleSelectDay(day)}
                    title={eventCount > 0 ? `${eventCount} class(es) on this date` : 'No classes'}
                  >
                    <span>{day}</span>
                    {eventCount > 0 && <span className="day-dot" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="date-picker-footer">
            <span className="date-picker-hint">
              <Sparkles size={12} /> Red dots indicate workshop dates
            </span>
            {value.type !== 'any' && (
              <button
                type="button"
                className="date-picker-reset-btn"
                onClick={handleClear}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
