import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MeasurementDef } from '@/types/customer';

interface MeasurementSliderProps {
  definition: MeasurementDef;
  value: number;
  onChange: (value: number) => void;
  isActive?: boolean;
}

const MeasurementSlider: React.FC<MeasurementSliderProps> = ({
  definition,
  value,
  onChange,
  isActive = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const range = definition.max - definition.min;
  const percentage = ((value - definition.min) / range) * 100;
  const medianPercentage = ((definition.median - definition.min) / range) * 100;

  const getColorForValue = (val: number) => {
    const diff = Math.abs(val - definition.median);
    const maxDiff = range / 2;
    const ratio = diff / maxDiff;
    if (ratio < 0.2) return 'hsl(var(--primary))';
    if (ratio < 0.5) return 'hsl(var(--warning))';
    return 'hsl(var(--secondary))';
  };

  const THUMB_RADIUS = 12; // half of w-6 (24px)

  const updateValue = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const usable = rect.width - THUMB_RADIUS * 2;
      const pct = Math.max(0, Math.min(1, (clientX - rect.left - THUMB_RADIUS) / usable));
      const newValue = Math.round(definition.min + pct * range);
      onChange(newValue);
    },
    [definition.min, range, onChange]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateValue(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updateValue(e.clientX);
  };

  const handlePointerUp = () => setIsDragging(false);

  return (
    <motion.div
      layout
      className={`rounded-2xl border transition-all duration-300 ${
        isActive
          ? 'border-primary/50 bg-primary/5 shadow-soft'
          : 'border-border bg-card'
      }`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{definition.labelVi}</span>
            <span className="text-xs text-muted-foreground">({definition.label})</span>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={value}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                if (!isNaN(v) && v >= definition.min && v <= definition.max) {
                  onChange(v);
                }
              }}
              className="w-14 text-right text-lg font-semibold bg-transparent border-none outline-none text-foreground font-body tabular-nums"
              min={definition.min}
              max={definition.max}
            />
            <span className="text-xs text-muted-foreground">cm</span>
          </div>
        </div>

        {/* Range labels */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
          <span>{definition.min}cm</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
            Trung bình: {definition.median}cm
          </span>
          <span>{definition.max}cm</span>
        </div>

        {/* Custom slider track */}
        <div
          ref={trackRef}
          className="relative h-10 flex items-center cursor-pointer touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Track background — inset by thumb radius so thumb never overflows */}
          <div
            className="absolute h-2 rounded-full bg-muted"
            style={{ left: THUMB_RADIUS, right: THUMB_RADIUS }}
          >
            {/* Filled portion */}
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-75"
              style={{
                width: `${percentage}%`,
                background: `linear-gradient(90deg, hsl(var(--primary)), ${getColorForValue(value)})`,
              }}
            />
            {/* Median marker */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-accent rounded-full"
              style={{ left: `${medianPercentage}%` }}
            />
          </div>

          {/* Thumb — positioned over the inset track */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2"
            style={{
              left: `calc(${THUMB_RADIUS}px + (100% - ${THUMB_RADIUS * 2}px) * ${percentage / 100})`,
              translateX: '-50%',
            }}
            animate={{ scale: isDragging ? 1.3 : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <div
              className="w-6 h-6 rounded-full border-2 shadow-lg"
              style={{
                backgroundColor: getColorForValue(value),
                borderColor: 'hsl(var(--background))',
                boxShadow: isDragging ? `0 0 16px ${getColorForValue(value)}60` : undefined,
              }}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default MeasurementSlider;
