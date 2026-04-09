import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Pencil } from 'lucide-react';
import { MeasurementDef, MeasurementValue } from '@/types/customer';
import MeasurementSlider from './MeasurementSlider';

interface MeasurementTableProps {
  measurements: MeasurementValue[];
  definitions: MeasurementDef[];
  onRowClick?: (key: string) => void;
  activeKey?: string | null;
  onMeasurementChange?: (key: string, value: number) => void;
}

const MeasurementTable: React.FC<MeasurementTableProps> = ({
  measurements,
  definitions,
  onRowClick,
  activeKey,
  onMeasurementChange,
}) => {
  const [expandedKey, setExpandedKey] = useState<string | null>(activeKey ?? null);

  const getValue = (key: string) =>
    measurements.find((m) => m.key === key)?.value;

  const getMedian = (def: MeasurementDef) => def.median;

  const handleRowClick = (key: string) => {
    const next = expandedKey === key ? null : key;
    setExpandedKey(next);
    onRowClick?.(key);
  };

  const filled = definitions.filter((d) => getValue(d.key) !== undefined).length;
  const total = definitions.length;

  return (
    <div className="space-y-3">
      {/* Summary bar */}
      <div className="rounded-2xl border border-border bg-card px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Số đo đã nhập</p>
          <p className="text-xs text-muted-foreground mt-0.5">{filled}/{total} chỉ số</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-28 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full gradient-sunset transition-all duration-500"
              style={{ width: `${(filled / total) * 100}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-primary tabular-nums">
            {Math.round((filled / total) * 100)}%
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border overflow-hidden bg-card">
        <div className="px-4 py-3 border-b border-border gradient-sunset flex items-center justify-between">
          <h3 className="text-sm font-semibold text-primary-foreground">Bảng số đo</h3>
          <span className="text-xs text-primary-foreground/70">Chạm hàng để chỉnh sửa</span>
        </div>

        <div className="divide-y divide-border">
          {definitions.map((def) => {
            const val = getValue(def.key);
            const isExpanded = expandedKey === def.key;
            const hasValue = val !== undefined;
            const displayVal = val ?? def.median;
            const range = def.max - def.min;
            const pct = ((displayVal - def.min) / range) * 100;
            const medianPct = ((def.median - def.min) / range) * 100;
            const diff = hasValue ? displayVal - def.median : null;
            const diffLabel = diff === null ? null : diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : '±0';
            const diffColor =
              diff === null ? '' :
              Math.abs(diff) === 0 ? 'text-primary bg-primary/10' :
              Math.abs(diff) < 5 ? 'text-warning bg-warning/10' :
              'text-secondary bg-secondary/10';

            return (
              <div key={def.key}>
                {/* Row header */}
                <button
                  onClick={() => handleRowClick(def.key)}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors hover:bg-muted/40 ${
                    isExpanded ? 'bg-primary/5' : ''
                  }`}
                >
                  {/* Status dot */}
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${hasValue ? 'bg-primary' : 'bg-muted-foreground/25'}`} />

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-foreground">{def.labelVi}</span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">({def.label})</span>
                    </div>
                    {/* Mini progress bar */}
                    {hasValue && (
                      <div className="mt-1.5 relative h-1 w-full max-w-[120px] rounded-full bg-muted">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full gradient-warm"
                          style={{ width: `${pct}%` }}
                        />
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-px h-2.5 bg-accent"
                          style={{ left: `${medianPct}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Value + deviation */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {hasValue ? (
                      <>
                        <span className="text-sm font-bold text-foreground tabular-nums">{val}cm</span>
                        {diffLabel && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${diffColor}`}>
                            {diffLabel}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Chưa đo</span>
                    )}
                    <Pencil className={`w-3 h-3 transition-colors ${isExpanded ? 'text-primary' : 'text-muted-foreground/40'}`} />
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>

                {/* Expanded slider */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3">
                        <MeasurementSlider
                          definition={def}
                          value={displayVal}
                          onChange={(v) => onMeasurementChange?.(def.key, v)}
                          isActive
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MeasurementTable;
