import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MeasurementDef, MeasurementValue } from '@/types/customer';
import { ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react';

interface BodySilhouetteProps {
  measurements: MeasurementValue[];
  definitions: MeasurementDef[];
  onPointClick?: (key: string) => void;
  activePoint?: string | null;
}

const BodySilhouette: React.FC<BodySilhouetteProps> = ({
  measurements,
  definitions,
  onPointClick,
  activePoint,
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.3, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.3, 0.5));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [position]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [isDragging, dragStart]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const getMeasurementValue = (key: string) => {
    return measurements.find((m) => m.key === key)?.value;
  };

  return (
    <div className="relative w-full rounded-2xl bg-card overflow-hidden border border-border" style={{ minHeight: 420 }}>
      {/* Controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <button onClick={handleZoomIn} className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center shadow-soft hover:bg-muted transition-colors">
          <ZoomIn className="w-4 h-4 text-foreground" />
        </button>
        <button onClick={handleZoomOut} className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center shadow-soft hover:bg-muted transition-colors">
          <ZoomOut className="w-4 h-4 text-foreground" />
        </button>
        <button onClick={handleReset} className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center shadow-soft hover:bg-muted transition-colors">
          <RotateCcw className="w-4 h-4 text-foreground" />
        </button>
      </div>

      {/* Scale indicator */}
      <div className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-lg bg-card/80 backdrop-blur-sm border border-border text-xs text-muted-foreground font-body">
        {Math.round(scale * 100)}%
      </div>

      {/* Drag hint */}
      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/80 backdrop-blur-sm border border-border text-xs text-muted-foreground">
        <Move className="w-3 h-3" /> Kéo để di chuyển
      </div>

      {/* SVG Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
        style={{ minHeight: 420 }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <svg
          viewBox="0 0 200 400"
          className="w-full h-full"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.3s ease',
          }}
        >
          {/* Body silhouette */}
          <g fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1.2" opacity="0.5">
            {/* Head */}
            <ellipse cx="100" cy="30" rx="16" ry="20" />
            {/* Neck */}
            <path d="M92 50 L92 58 L108 58 L108 50" />
            {/* Torso */}
            <path d="M72 58 Q68 62 65 80 Q62 100 64 120 Q66 140 72 155 L128 155 Q134 140 136 120 Q138 100 135 80 Q132 62 128 58 Z" />
            {/* Left arm */}
            <path d="M72 58 Q58 65 48 90 Q42 110 36 135 Q34 145 38 148 Q42 150 44 145 Q48 130 52 115 Q56 100 60 90" />
            {/* Right arm */}
            <path d="M128 58 Q142 65 152 90 Q158 110 164 135 Q166 145 162 148 Q158 150 156 145 Q152 130 148 115 Q144 100 140 90" />
            {/* Left leg */}
            <path d="M72 155 Q70 160 72 200 Q74 240 76 280 Q78 320 76 350 Q75 360 80 362 Q85 360 84 350 Q82 320 84 280 Q86 240 88 200 Q90 175 95 155" />
            {/* Right leg */}
            <path d="M128 155 Q130 160 128 200 Q126 240 124 280 Q122 320 124 350 Q125 360 120 362 Q115 360 116 350 Q118 320 116 280 Q114 240 112 200 Q110 175 105 155" />
          </g>

          {/* Measurement guide lines */}
          <g stroke="hsl(var(--primary))" strokeWidth="0.4" strokeDasharray="3 3" opacity="0.3">
            {/* Shoulder line */}
            <line x1="65" y1="62" x2="135" y2="62" />
            {/* Chest line */}
            <line x1="62" y1="90" x2="138" y2="90" />
            {/* Waist line */}
            <line x1="64" y1="125" x2="136" y2="125" />
            {/* Hip line */}
            <line x1="70" y1="155" x2="130" y2="155" />
          </g>

          {/* Measurement points */}
          {definitions.map((def) => {
            const value = getMeasurementValue(def.key);
            const isActive = activePoint === def.key;
            const hasValue = value !== undefined;

            return (
              <g
                key={def.key}
                onClick={(e) => {
                  e.stopPropagation();
                  onPointClick?.(def.key);
                }}
                className="cursor-pointer"
              >
                {/* Glow ring */}
                {isActive && (
                  <circle
                    cx={def.position[0] * 2}
                    cy={def.position[1] * 4}
                    r="10"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="0.8"
                    opacity="0.4"
                  >
                    <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Point */}
                <circle
                  cx={def.position[0] * 2}
                  cy={def.position[1] * 4}
                  r={isActive ? 5 : 3.5}
                  fill={hasValue ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                  stroke={isActive ? 'hsl(var(--secondary))' : 'hsl(var(--background))'}
                  strokeWidth="1.5"
                  opacity={isActive ? 1 : 0.8}
                />

                {/* Value label */}
                {hasValue && (
                  <>
                    <rect
                      x={def.position[0] * 2 + 7}
                      y={def.position[1] * 4 - 7}
                      width={value.toString().length * 6 + 16}
                      height="14"
                      rx="4"
                      fill={isActive ? 'hsl(var(--primary))' : 'hsl(var(--foreground))'}
                      opacity={isActive ? 1 : 0.85}
                    />
                    <text
                      x={def.position[0] * 2 + 10}
                      y={def.position[1] * 4 + 1}
                      fontSize="8"
                      fill="hsl(var(--background))"
                      fontFamily="Work Sans"
                      fontWeight="500"
                    >
                      {value}cm
                    </text>
                  </>
                )}

                {/* Label on hover/active */}
                {isActive && (
                  <text
                    x={def.position[0] * 2}
                    y={def.position[1] * 4 - 10}
                    fontSize="7"
                    fill="hsl(var(--secondary))"
                    fontFamily="Work Sans"
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    {def.labelVi}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default BodySilhouette;
