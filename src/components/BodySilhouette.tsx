import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MeasurementDef, MeasurementValue } from '@/types/customer';
import { GripHorizontal, Pencil, Check } from 'lucide-react';
import frontSvg from '@/assets/lookfront.svg';
import leftSvg from '@/assets/lookleft.svg';

interface BodySilhouetteProps {
  measurements: MeasurementValue[];
  definitions: MeasurementDef[];
  onPointClick?: (key: string) => void;
  activePoint?: string | null;
}

type Side = 'front' | 'left';

// Default positions as [x%, y%] within each panel's rendered area
const DEFAULT_FRONT: Record<string, [number, number]> = {
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

const DEFAULT_LEFT: Record<string, [number, number]> = {
  nguc: [60, 25],
  eo:   [45, 37],
  mong: [62, 46],
  lung: [70, 31],
};

// ── Single draggable chip ────────────────────────────────────────────────────

interface ChipProps {
  label: string;
  value?: number;
  isActive: boolean;
  editMode: boolean;
  pos: [number, number]; // [x%, y%]
  onDragEnd: (x: number, y: number) => void;
  onClick: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

const Chip: React.FC<ChipProps> = ({
  label, value, isActive, editMode, pos, onDragEnd, onClick, containerRef,
}) => {
  const hasValue = value !== undefined;
  const chipRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startPointer = useRef({ x: 0, y: 0 });
  const startPos = useRef<[number, number]>([0, 0]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (!editMode) return;
    e.stopPropagation();
    dragging.current = true;
    startPointer.current = { x: e.clientX, y: e.clientY };
    startPos.current = [...pos] as [number, number];
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [editMode, pos]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - startPointer.current.x) / rect.width) * 100;
    const dy = ((e.clientY - startPointer.current.y) / rect.height) * 100;
    const nx = Math.max(2, Math.min(98, startPos.current[0] + dx));
    const ny = Math.max(2, Math.min(98, startPos.current[1] + dy));
    // live update via CSS
    if (chipRef.current) {
      chipRef.current.style.left = `${nx}%`;
      chipRef.current.style.top = `${ny}%`;
    }
  }, [containerRef]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || !containerRef.current) return;
    dragging.current = false;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - startPointer.current.x) / rect.width) * 100;
    const dy = ((e.clientY - startPointer.current.y) / rect.height) * 100;
    const nx = Math.max(2, Math.min(98, startPos.current[0] + dx));
    const ny = Math.max(2, Math.min(98, startPos.current[1] + dy));
    onDragEnd(nx, ny);
  }, [containerRef, onDragEnd]);

  return (
    <div
      ref={chipRef}
      className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
      style={{ left: `${pos[0]}%`, top: `${pos[1]}%` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={!editMode ? onClick : undefined}
    >
      {/* Dot anchor */}
      <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background transition-all
        ${isActive ? 'w-3 h-3 bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.6)]' : 'w-2 h-2 bg-primary/70'}
        ${editMode ? 'ring-2 ring-orange-400 ring-offset-1' : ''}
      `} />

      {/* Pulse when active */}
      {isActive && !editMode && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border border-primary/40 animate-ping" />
      )}

      {/* Label pill */}
      {(hasValue || isActive) && (
        <div className={`
          absolute top-1/2 -translate-y-1/2 whitespace-nowrap
          flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold
          shadow-md select-none transition-all
          ${pos[0] > 50 ? 'right-[calc(50%+8px)]' : 'left-[calc(50%+8px)]'}
          ${isActive
            ? 'bg-primary text-primary-foreground'
            : 'bg-foreground/85 text-background'}
          ${editMode ? 'cursor-grab active:cursor-grabbing ring-1 ring-orange-400' : 'cursor-pointer'}
        `}>
          {editMode && <GripHorizontal className="w-2.5 h-2.5 opacity-60 flex-shrink-0" />}
          {label}{hasValue ? ` ${value}cm` : ''}
        </div>
      )}

      {/* Unmeasured dot-only label in edit mode */}
      {!hasValue && !isActive && editMode && (
        <div className={`
          absolute top-1/2 -translate-y-1/2 whitespace-nowrap
          flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium
          bg-muted text-muted-foreground border border-border shadow-sm cursor-grab
          ${pos[0] > 50 ? 'right-[calc(50%+8px)]' : 'left-[calc(50%+8px)]'}
        `}>
          <GripHorizontal className="w-2.5 h-2.5 opacity-50 flex-shrink-0" />
          {label}
        </div>
      )}
    </div>
  );
};

// ── SVG Panel with overlay chips ─────────────────────────────────────────────

interface PanelProps {
  svg: string;
  viewW: number;
  viewH: number;
  side: Side;
  label: string;
  labelStyle: string;
  pointKeys: string[];
  positions: Record<string, [number, number]>;
  onPositionChange: (key: string, x: number, y: number) => void;
  definitions: MeasurementDef[];
  getValue: (key: string) => number | undefined;
  activePoint: string | null | undefined;
  onPointClick: (key: string) => void;
  editMode: boolean;
}

const SvgPanel: React.FC<PanelProps> = ({
  svg, viewW, viewH, side, label, labelStyle,
  pointKeys, positions, onPositionChange,
  definitions, getValue, activePoint, onPointClick, editMode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative flex flex-col items-center bg-gradient-to-b from-muted/20 to-card overflow-hidden">
      {/* View label */}
      <div className={`absolute top-3 left-1/2 -translate-x-1/2 z-20 px-2.5 py-0.5 rounded-full text-[10px] font-semibold pointer-events-none ${labelStyle}`}>
        {label}
      </div>

      {/* SVG */}
      <svg
        viewBox={`0 0 ${viewW} ${viewH}`}
        className="w-full"
        style={{ maxHeight: 460, display: 'block' }}
        preserveAspectRatio="xMidYMid meet"
      >
        <image href={svg} x="0" y="0" width={viewW} height={viewH} opacity="0.8" />
      </svg>

      {/* Chip overlay — absolutely positioned over the SVG */}
      <div
        ref={containerRef}
        className="absolute inset-0 pointer-events-none"
        style={{ pointerEvents: editMode ? 'none' : 'none' }}
      >
        <div className="relative w-full h-full" style={{ pointerEvents: 'all' }}>
          {pointKeys.map(key => {
            const def = definitions.find(d => d.key === key);
            if (!def) return null;
            const pos = positions[key] ?? [50, 50];
            return (
              <Chip
                key={`${side}-${key}`}
                label={def.labelVi}
                value={getValue(key)}
                isActive={activePoint === key}
                editMode={editMode}
                pos={pos}
                containerRef={containerRef as React.RefObject<HTMLDivElement>}
                onDragEnd={(x, y) => onPositionChange(key, x, y)}
                onClick={() => onPointClick(key)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const BodySilhouette: React.FC<BodySilhouetteProps> = ({
  measurements,
  definitions,
  onPointClick,
  activePoint,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [frontPos, setFrontPos] = useState<Record<string, [number, number]>>(DEFAULT_FRONT);
  const [leftPos, setLeftPos] = useState<Record<string, [number, number]>>(DEFAULT_LEFT);

  const getValue = (key: string) =>
    measurements.find(m => m.key === key)?.value;

  const filledCount = definitions.filter(d => getValue(d.key) !== undefined).length;

  const updateFront = useCallback((key: string, x: number, y: number) => {
    setFrontPos(p => ({ ...p, [key]: [x, y] }));
  }, []);

  const updateLeft = useCallback((key: string, x: number, y: number) => {
    setLeftPos(p => ({ ...p, [key]: [x, y] }));
  }, []);

  const handlePointClick = (key: string) => {
    if (!editMode) onPointClick?.(key);
  };

  return (
    <div className="w-full space-y-3">

      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-base font-semibold text-foreground">Hình thể</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {filledCount}/{definitions.length} số đo đã nhập
            {!editMode && ' · Chạm điểm để chỉnh'}
          </p>
        </div>

        {/* Edit mode toggle */}
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => setEditMode(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
            editMode
              ? 'bg-primary text-primary-foreground border-primary shadow-soft'
              : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/40'
          }`}
        >
          {editMode
            ? <><Check className="w-3.5 h-3.5" /> Xong</>
            : <><Pencil className="w-3.5 h-3.5" /> Sắp xếp</>
          }
        </motion.button>
      </div>

      {/* Edit mode banner */}
      <AnimatePresence>
        {editMode && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-50 border border-orange-200 dark:bg-orange-950/30 dark:border-orange-800"
          >
            <GripHorizontal className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <p className="text-xs text-orange-700 dark:text-orange-300">
              Kéo nhãn đến đúng vị trí trên cơ thể. Nhấn <strong>Xong</strong> để lưu.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dual panel */}
      <div className={`relative w-full rounded-2xl overflow-hidden border bg-card shadow-soft transition-all duration-200 ${
        editMode ? 'border-orange-300 dark:border-orange-700' : 'border-border'
      }`}>

        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none z-10" />

        <div className="grid grid-cols-2 divide-x divide-border">

          <SvgPanel
            svg={frontSvg}
            viewW={103} viewH={326}
            side="front"
            label="Mặt trước"
            labelStyle="gradient-sunset text-primary-foreground shadow-sm"
            pointKeys={Object.keys(DEFAULT_FRONT)}
            positions={frontPos}
            onPositionChange={updateFront}
            definitions={definitions}
            getValue={getValue}
            activePoint={activePoint}
            onPointClick={handlePointClick}
            editMode={editMode}
          />

          <SvgPanel
            svg={leftSvg}
            viewW={95} viewH={335}
            side="left"
            label="Mặt bên"
            labelStyle="bg-muted text-muted-foreground border border-border"
            pointKeys={Object.keys(DEFAULT_LEFT)}
            positions={leftPos}
            onPositionChange={updateLeft}
            definitions={definitions}
            getValue={getValue}
            activePoint={activePoint}
            onPointClick={handlePointClick}
            editMode={editMode}
          />

        </div>

        {/* Bottom bar */}
        <div className="px-4 py-2 border-t border-border bg-card/60 backdrop-blur-sm flex items-center justify-center">
          <p className="text-[10px] text-muted-foreground">
            {filledCount} / {definitions.length} số đo &nbsp;·&nbsp;
            <span className="text-primary font-medium">
              {Math.round((filledCount / definitions.length) * 100)}% hoàn thành
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BodySilhouette;
