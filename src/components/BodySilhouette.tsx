import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MeasurementDef, MeasurementValue } from '@/types/customer';
import frontSvg from '@/assets/lookfront.svg';
import leftSvg from '@/assets/lookleft.svg';

interface BodySilhouetteProps {
  measurements: MeasurementValue[];
  definitions: MeasurementDef[];
  onPointClick?: (key: string) => void;
  activePoint?: string | null;
}

// Positions as [x%, y%] within each SVG's natural viewBox
// lookfront: 103×326  |  lookleft: 95×335
const FRONT_POINTS: Record<string, [number, number]> = {
  co:       [50, 10],
  vai:      [50, 15],
  nguc:     [50, 25],
  eo:       [50, 37],
  mong:     [50, 46],
  bap_tay:  [18, 27],
  co_tay:   [12, 42],
  dai_tay:  [15, 35],
  lung:     [72, 31],
  chan:     [42, 74],
  dui:      [38, 55],
  bap_chan:  [38, 72],
};

const LEFT_POINTS: Record<string, [number, number]> = {
  nguc: [60, 25],
  eo:   [45, 37],
  mong: [62, 46],
  lung: [70, 31],
};

const BodySilhouette: React.FC<BodySilhouetteProps> = ({
  measurements,
  definitions,
  onPointClick,
  activePoint,
}) => {
  const getValue = (key: string) =>
    measurements.find((m) => m.key === key)?.value;

  const filledCount = definitions.filter(d => getValue(d.key) !== undefined).length;

  const renderDots = (
    pointMap: Record<string, [number, number]>,
    vbW: number,
    vbH: number,
    side: 'front' | 'left'
  ) =>
    Object.entries(pointMap).map(([key, [px, py]]) => {
      const def = definitions.find(d => d.key === key);
      if (!def) return null;
      const value = getValue(key);
      const isActive = activePoint === key;
      const hasValue = value !== undefined;
      const cx = (px / 100) * vbW;
      const cy = (py / 100) * vbH;
      // flip label to left side for right-side points
      const labelRight = px < 50;
      const labelText = hasValue ? `${def.labelVi} ${value}cm` : def.labelVi;
      const charW = 6.5;
      const labelW = labelText.length * charW + 16;

      return (
        <g
          key={`${side}-${key}`}
          onClick={e => { e.stopPropagation(); onPointClick?.(key); }}
          style={{ cursor: 'pointer' }}
        >
          {/* Pulse ring */}
          {isActive && (
            <circle cx={cx} cy={cy} r="10" fill="none"
              stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.5">
              <animate attributeName="r" values="8;14;8" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0.1;0.5" dur="1.8s" repeatCount="indefinite" />
            </circle>
          )}

          {/* Dot */}
          <circle
            cx={cx} cy={cy}
            r={isActive ? 5 : 3.5}
            fill={hasValue ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
            stroke="hsl(var(--background))"
            strokeWidth="1.5"
            opacity={isActive ? 1 : 0.8}
          />

          {/* Label pill */}
          {(isActive || hasValue) && (
            <>
              {/* Dashed connector */}
              <line
                x1={cx + (labelRight ? 4 : -4)} y1={cy}
                x2={cx + (labelRight ? labelW / 2 + 6 : -(labelW / 2 + 6))} y2={cy}
                stroke="hsl(var(--primary))" strokeWidth="0.7"
                strokeDasharray="2 2" opacity="0.45"
              />
              {/* Pill background */}
              <rect
                x={labelRight ? cx + 6 : cx - labelW - 6}
                y={cy - 8}
                width={labelW} height={16}
                rx={8}
                fill={isActive ? 'hsl(var(--primary))' : 'hsl(var(--foreground))'}
                opacity={isActive ? 1 : 0.85}
              />
              {/* Label text */}
              <text
                x={labelRight ? cx + 6 + labelW / 2 : cx - 6 - labelW / 2}
                y={cy + 4}
                fontSize="7.5"
                fill="hsl(var(--background))"
                fontFamily="Be Vietnam Pro"
                fontWeight="600"
                textAnchor="middle"
              >
                {labelText}
              </text>
            </>
          )}
        </g>
      );
    });

  return (
    <div className="w-full space-y-3">

      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-base font-semibold text-foreground">Hình thể</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {filledCount}/{definitions.length} số đo đã nhập · Chạm điểm để chỉnh
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-primary inline-block" />Đã đo
          </span>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-muted-foreground/30 inline-block" />Chưa đo
          </span>
        </div>
      </div>

      {/* Dual panel */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-border bg-card shadow-soft">

        {/* Subtle top gradient wash */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none z-10" />

        <div className="grid grid-cols-2 divide-x divide-border">

          {/* ── FRONT VIEW ── */}
          <div className="relative flex flex-col items-center bg-gradient-to-b from-muted/20 to-card">
            {/* Label chip */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-2.5 py-0.5 rounded-full text-[10px] font-semibold gradient-sunset text-primary-foreground shadow-sm">
              Mặt trước
            </div>

            <svg
              viewBox="0 0 103 326"
              className="w-full"
              style={{ maxHeight: 460 }}
              preserveAspectRatio="xMidYMid meet"
            >
              <image href={frontSvg} x="0" y="0" width="103" height="326" opacity="0.8" />
              {renderDots(FRONT_POINTS, 103, 326, 'front')}
            </svg>
          </div>

          {/* ── LEFT VIEW ── */}
          <div className="relative flex flex-col items-center bg-gradient-to-b from-muted/10 to-card">
            {/* Label chip */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground border border-border">
              Mặt bên
            </div>

            <svg
              viewBox="0 0 95 335"
              className="w-full"
              style={{ maxHeight: 460 }}
              preserveAspectRatio="xMidYMid meet"
            >
              <image href={leftSvg} x="0" y="0" width="95" height="335" opacity="0.8" />
              {renderDots(LEFT_POINTS, 95, 335, 'left')}
            </svg>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="px-4 py-2 border-t border-border bg-card/60 backdrop-blur-sm flex items-center justify-center">
          <p className="text-[10px] text-muted-foreground">
            {filledCount} / {definitions.length} số đo &nbsp;·&nbsp;
            <span className="text-primary font-medium">{Math.round((filledCount / definitions.length) * 100)}% hoàn thành</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BodySilhouette;
