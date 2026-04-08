export interface MeasurementDef {
  key: string;
  label: string;
  labelVi: string;
  min: number;
  max: number;
  median: number;
  /** Position on silhouette as percentage [x, y] */
  position: [number, number];
}

export interface MeasurementValue {
  key: string;
  value: number;
}

export interface FabricSample {
  id: string;
  imageUrl: string | null;
  note: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  avatar: string | null;
  measurements: MeasurementValue[];
  fabricSamples: FabricSample[];
  notes: string;
  projectedDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export const MEASUREMENT_DEFINITIONS: MeasurementDef[] = [
  { key: 'co', label: 'Neck', labelVi: 'Cổ', min: 30, max: 50, median: 38, position: [50, 12] },
  { key: 'vai', label: 'Shoulder', labelVi: 'Vai', min: 36, max: 54, median: 44, position: [50, 16] },
  { key: 'nguc', label: 'Chest', labelVi: 'Ngực', min: 76, max: 120, median: 95, position: [50, 25] },
  { key: 'eo', label: 'Waist', labelVi: 'Eo', min: 60, max: 110, median: 80, position: [50, 35] },
  { key: 'mong', label: 'Hip', labelVi: 'Mông', min: 80, max: 120, median: 96, position: [50, 42] },
  { key: 'bap_tay', label: 'Bicep', labelVi: 'Bắp tay', min: 22, max: 42, median: 30, position: [25, 28] },
  { key: 'co_tay', label: 'Wrist', labelVi: 'Cổ tay', min: 14, max: 20, median: 17, position: [18, 42] },
  { key: 'lung', label: 'Back Length', labelVi: 'Lưng', min: 36, max: 50, median: 42, position: [50, 30] },
  { key: 'dai_tay', label: 'Arm Length', labelVi: 'Dài tay', min: 50, max: 68, median: 58, position: [22, 35] },
  { key: 'chan', label: 'Leg Length', labelVi: 'Chân', min: 90, max: 115, median: 100, position: [40, 70] },
  { key: 'dui', label: 'Thigh', labelVi: 'Đùi', min: 44, max: 70, median: 55, position: [40, 55] },
  { key: 'bap_chan', label: 'Calf', labelVi: 'Bắp chân', min: 30, max: 45, median: 36, position: [40, 75] },
];
