import React, { useState, useRef, useCallback } from 'react';
import { MeasurementDef, MeasurementValue } from '@/types/customer';
import { ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react';
import bodySvg from '@/assets/body-silhouette-themed.svg';

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

  // SVG viewBox is 425x333 — measurement points use position[0]*2, position[1]*4
  // We scale those to fit the 425x333 space: x * (425/200), y * (333/430)
  const scaleX = 425 / 200;
  const scaleY = 333 / 430;

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
          viewBox="0 0 425 333"
          className="w-full h-full"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.3s ease',
          }}
        >
          {/* Professional body silhouette — from export45.svg */}
          <image
            href={bodySvg}
            x="0"
            y="0"
            width="425"
            height="333"
            style={{ opacity: 0.75 }}
            className="[filter:invert(1)_sepia(1)_saturate(0)_hue-rotate(0deg)] dark:[filter:none]"
          />

          {/* Measurement guide lines */}
          <g stroke="hsl(var(--primary))" strokeWidth="0.6" strokeDasharray="4 3" opacity="0.35">
            <line x1="95" y1="62" x2="330" y2="62" />
            <line x1="85" y1="100" x2="340" y2="100" />
            <line x1="95" y1="130" x2="330" y2="130" />
            <line x1="88" y1="158" x2="337" y2="158" />
          </g>

          {/* Measurement points */}
          {definitions.map((def) => {
            const value = getMeasurementValue(def.key);
            const isActive = activePoint === def.key;
            const hasValue = value !== undefined;
            const cx = def.position[0] * 2 * scaleX;
            const cy = def.position[1] * 4 * scaleY;

            return (
              <g
                key={def.key}
                onClick={(e) => {
                  e.stopPropagation();
                  onPointClick?.(def.key);
                }}
                className="cursor-pointer"
              >
                {isActive && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="14"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="1"
                    opacity="0.4"
                  >
                    <animate attributeName="r" values="10;16;10" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isActive ? 7 : 5}
                  fill={hasValue ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                  stroke={isActive ? 'hsl(var(--secondary))' : 'hsl(var(--background))'}
                  strokeWidth="2"
                  opacity={isActive ? 1 : 0.8}
                />
                {hasValue && (
                  <>
                    <rect
                      x={cx + 10}
                      y={cy - 9}
                      width={value.toString().length * 7 + 20}
                      height="18"
                      rx="5"
                      fill={isActive ? 'hsl(var(--primary))' : 'hsl(var(--foreground))'}
                      opacity={isActive ? 1 : 0.85}
                    />
                    <text
                      x={cx + 14}
                      y={cy + 2}
                      fontSize="10"
                      fill="hsl(var(--background))"
                      fontFamily="Be Vietnam Pro"
                      fontWeight="500"
                    >
                      {value}cm
                    </text>
                  </>
                )}
                {isActive && (
                  <text
                    x={cx}
                    y={cy - 14}
                    fontSize="9"
                    fill="hsl(var(--secondary))"
                    fontFamily="Be Vietnam Pro"
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
