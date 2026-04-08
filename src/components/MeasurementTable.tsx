import React from 'react';
import { MeasurementDef, MeasurementValue } from '@/types/customer';

interface MeasurementTableProps {
  measurements: MeasurementValue[];
  definitions: MeasurementDef[];
  onRowClick?: (key: string) => void;
  activeKey?: string | null;
}

const MeasurementTable: React.FC<MeasurementTableProps> = ({
  measurements,
  definitions,
  onRowClick,
  activeKey,
}) => {
  const getValue = (key: string) => measurements.find((m) => m.key === key)?.value;

  return (
    <div className="rounded-2xl border border-border overflow-hidden bg-card">
      <div className="px-4 py-3 border-b border-border gradient-sunset">
        <h3 className="text-sm font-semibold text-primary-foreground font-body">Bảng số đo</h3>
      </div>
      <div className="divide-y divide-border">
        {definitions.map((def) => {
          const val = getValue(def.key);
          const isActive = activeKey === def.key;
          const deviation = val !== undefined ? Math.abs(val - def.median) : 0;
          const deviationLabel = val !== undefined
            ? val > def.median
              ? `+${val - def.median}`
              : val < def.median
              ? `${val - def.median}`
              : '±0'
            : '';

          return (
            <button
              key={def.key}
              onClick={() => onRowClick?.(def.key)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                isActive ? 'bg-primary/5' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    val !== undefined ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                />
                <div>
                  <span className="text-sm font-medium text-foreground">{def.labelVi}</span>
                  <span className="text-xs text-muted-foreground ml-1.5">({def.label})</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {val !== undefined ? (
                  <>
                    <span className="text-sm font-semibold text-foreground tabular-nums">{val}cm</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        deviation === 0
                          ? 'bg-primary/10 text-primary'
                          : deviation < 5
                          ? 'bg-warning/10 text-warning'
                          : 'bg-secondary/10 text-secondary'
                      }`}
                    >
                      {deviationLabel}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground">Chưa đo</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MeasurementTable;
