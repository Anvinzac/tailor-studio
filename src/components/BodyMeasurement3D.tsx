import React, { useRef, useState, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { MeasurementDef, MeasurementValue } from '@/types/customer';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Props {
  measurements: MeasurementValue[];
  definitions: MeasurementDef[];
  onMeasurementChange: (key: string, value: number) => void;
  activePoint?: string | null;
  onPointClick?: (key: string) => void;
}

// ─── 3D anchor positions for each measurement key [x, y, z] ─────────────────
// Model sits centered at origin, height ~3.4 units (head top ~1.7, feet ~-1.7)
const ANCHOR_3D: Record<string, [number, number, number]> = {
  co:       [ 0.55,  1.25,  0.1 ],  // neck — right side
  vai:      [ 0.75,  1.05,  0.1 ],  // shoulder
  nguc:     [ 0.75,  0.65,  0.2 ],  // chest
  eo:       [ 0.65,  0.15,  0.2 ],  // waist
  mong:     [ 0.75, -0.25,  0.2 ],  // hip
  bap_tay:  [-0.95,  0.55,  0.1 ],  // bicep — left side
  co_tay:   [-1.05, -0.15,  0.1 ],  // wrist
  lung:     [ 0.65,  0.40,  0.1 ],  // back length
  dai_tay:  [-0.95,  0.20,  0.1 ],  // arm length
  chan:     [ 0.65, -1.10,  0.2 ],  // leg length
  dui:      [ 0.65, -0.55,  0.2 ],  // thigh
  bap_chan:  [ 0.65, -1.00,  0.2 ],  // calf
};

// ─── Mannequin built from Three.js primitives ────────────────────────────────

function Mannequin() {
  const mat = (
    <meshStandardMaterial color="#e8d5c4" roughness={0.6} metalness={0.05} />
  );

  return (
    <group>
      {/* Head */}
      <mesh position={[0, 1.45, 0]}>
        <sphereGeometry args={[0.18, 32, 32]} />
        {mat}
      </mesh>
      {/* Neck */}
      <mesh position={[0, 1.22, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 0.2, 24]} />
        {mat}
      </mesh>
      {/* Torso */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.28, 0.22, 0.9, 32]} />
        {mat}
      </mesh>
      {/* Waist */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.19, 0.24, 0.3, 32]} />
        {mat}
      </mesh>
      {/* Hips */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.27, 0.25, 0.35, 32]} />
        {mat}
      </mesh>
      {/* Left upper arm */}
      <mesh position={[-0.45, 0.72, 0]} rotation={[0, 0, 0.35]}>
        <cylinderGeometry args={[0.075, 0.065, 0.42, 20]} />
        {mat}
      </mesh>
      {/* Left forearm */}
      <mesh position={[-0.62, 0.35, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.055, 0.045, 0.38, 20]} />
        {mat}
      </mesh>
      {/* Left hand */}
      <mesh position={[-0.74, 0.12, 0]}>
        <boxGeometry args={[0.08, 0.12, 0.04]} />
        {mat}
      </mesh>
      {/* Right upper arm */}
      <mesh position={[0.45, 0.72, 0]} rotation={[0, 0, -0.35]}>
        <cylinderGeometry args={[0.075, 0.065, 0.42, 20]} />
        {mat}
      </mesh>
      {/* Right forearm */}
      <mesh position={[0.62, 0.35, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.055, 0.045, 0.38, 20]} />
        {mat}
      </mesh>
      {/* Right hand */}
      <mesh position={[0.74, 0.12, 0]}>
        <boxGeometry args={[0.08, 0.12, 0.04]} />
        {mat}
      </mesh>
      {/* Left thigh */}
      <mesh position={[-0.14, -0.58, 0]}>
        <cylinderGeometry args={[0.115, 0.1, 0.55, 24]} />
        {mat}
      </mesh>
      {/* Left calf */}
      <mesh position={[-0.14, -1.08, 0]}>
        <cylinderGeometry args={[0.085, 0.065, 0.45, 24]} />
        {mat}
      </mesh>
      {/* Left foot */}
      <mesh position={[-0.14, -1.38, 0.05]}>
        <boxGeometry args={[0.1, 0.08, 0.22]} />
        {mat}
      </mesh>
      {/* Right thigh */}
      <mesh position={[0.14, -0.58, 0]}>
        <cylinderGeometry args={[0.115, 0.1, 0.55, 24]} />
        {mat}
      </mesh>
      {/* Right calf */}
      <mesh position={[0.14, -1.08, 0]}>
        <cylinderGeometry args={[0.085, 0.065, 0.45, 24]} />
        {mat}
      </mesh>
      {/* Right foot */}
      <mesh position={[0.14, -1.38, 0.05]}>
        <boxGeometry args={[0.1, 0.08, 0.22]} />
        {mat}
      </mesh>
    </group>
  );
}

// ─── Single measurement label in 3D space ────────────────────────────────────

interface LabelProps {
  def: MeasurementDef;
  value: number;
  isActive: boolean;
  isEditing: boolean;
  onTap: () => void;
  onValueChange: (v: number) => void;
  onEditDone: () => void;
}

function MeasurementLabel({
  def, value, isActive, isEditing, onTap, onValueChange, onEditDone,
}: LabelProps) {
  const anchor = ANCHOR_3D[def.key] ?? [0.8, 0, 0];
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus when entering edit mode
  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  return (
    <Html
      position={anchor}
      center
      distanceFactor={4}
      zIndexRange={[10, 0]}
      occlude={false}
    >
      <div
        className="select-none"
        style={{ transform: 'translateZ(0)' }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {isEditing ? (
          /* ── Edit mode ── */
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-semibold text-white bg-black/70 rounded px-1.5 py-0.5 whitespace-nowrap">
              {def.labelVi}
            </span>
            <div className="flex items-center gap-1 bg-white rounded-lg shadow-lg px-2 py-1 border border-orange-400">
              <input
                ref={inputRef}
                type="number"
                value={value}
                min={def.min}
                max={def.max}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  if (!isNaN(v)) onValueChange(Math.min(def.max, Math.max(def.min, v)));
                }}
                onBlur={onEditDone}
                onKeyDown={(e) => { if (e.key === 'Enter') onEditDone(); }}
                className="w-14 text-center text-sm font-bold text-gray-800 outline-none border-none bg-transparent"
              />
              <span className="text-xs text-gray-500">cm</span>
            </div>
          </div>
        ) : (
          /* ── Display mode ── */
          <button
            onClick={onTap}
            className={`
              flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold
              shadow-md border transition-all duration-150 whitespace-nowrap
              ${isActive
                ? 'bg-orange-500 text-white border-orange-600 scale-110 shadow-orange-300'
                : 'bg-white/90 text-gray-700 border-gray-200 hover:bg-orange-50 hover:border-orange-300'
              }
            `}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-orange-400'}`} />
            {def.labelVi}
            <span className={`font-bold ${isActive ? 'text-white' : 'text-orange-500'}`}>
              {value}
            </span>
          </button>
        )}
      </div>
    </Html>
  );
}

// ─── Auto-rotate when idle ────────────────────────────────────────────────────

function AutoRotate({ enabled }: { enabled: boolean }) {
  const { scene } = useThree();
  useFrame((state) => {
    if (enabled) {
      state.camera.position.x = Math.sin(state.clock.elapsedTime * 0.3) * 3.5;
      state.camera.position.z = Math.cos(state.clock.elapsedTime * 0.3) * 3.5;
      state.camera.lookAt(0, 0, 0);
    }
  });
  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────

const BodyMeasurement3D: React.FC<Props> = ({
  measurements,
  definitions,
  onMeasurementChange,
  activePoint,
  onPointClick,
}) => {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(false);

  const getValue = useCallback((key: string) => {
    return measurements.find((m) => m.key === key)?.value
      ?? definitions.find((d) => d.key === key)?.median
      ?? 0;
  }, [measurements, definitions]);

  const handleTap = (key: string) => {
    setAutoRotate(false);
    if (editingKey === key) {
      setEditingKey(null);
    } else {
      onPointClick?.(key);
      setEditingKey(key);
    }
  };

  const handleEditDone = () => setEditingKey(null);

  return (
    <div className="relative w-full rounded-2xl bg-card border border-border overflow-hidden" style={{ height: 480 }}>
      {/* Hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-border text-xs text-muted-foreground whitespace-nowrap">
        Kéo để xoay · Chạm nhãn để chỉnh số đo
      </div>

      {/* Auto-rotate toggle */}
      <button
        onClick={() => setAutoRotate((v) => !v)}
        className={`absolute top-3 right-3 z-10 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
          autoRotate
            ? 'bg-orange-500 text-white border-orange-600'
            : 'bg-card border-border text-muted-foreground hover:text-foreground'
        }`}
      >
        {autoRotate ? '⏸ Dừng' : '▶ Xoay'}
      </button>

      <Canvas
        camera={{ position: [0, 0.2, 3.5], fov: 45 }}
        gl={{ antialias: true }}
        onPointerDown={() => setAutoRotate(false)}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 5, 3]} intensity={1.2} castShadow />
          <directionalLight position={[-3, 2, -2]} intensity={0.4} />
          <pointLight position={[0, -1, 2]} intensity={0.3} color="#ffd0a0" />

          {/* Model */}
          <Mannequin />

          {/* Measurement labels */}
          {definitions.map((def) => (
            <MeasurementLabel
              key={def.key}
              def={def}
              value={getValue(def.key)}
              isActive={activePoint === def.key}
              isEditing={editingKey === def.key}
              onTap={() => handleTap(def.key)}
              onValueChange={(v) => onMeasurementChange(def.key, v)}
              onEditDone={handleEditDone}
            />
          ))}

          <AutoRotate enabled={autoRotate} />
          <OrbitControls
            enablePan={false}
            minDistance={2}
            maxDistance={6}
            minPolarAngle={Math.PI * 0.15}
            maxPolarAngle={Math.PI * 0.85}
            enabled={!editingKey}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default BodyMeasurement3D;
