import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Calendar as CalendarIcon, Eye, List, StickyNote } from 'lucide-react';
import BodySilhouette from '@/components/BodySilhouette';
import MeasurementSlider from '@/components/MeasurementSlider';
import MeasurementTable from '@/components/MeasurementTable';
import FabricPhotos from '@/components/FabricPhotos';
import { Customer, MeasurementValue, FabricSample, MEASUREMENT_DEFINITIONS } from '@/types/customer';
import { toast } from 'sonner';

// Demo data lookup
const DEMO: Record<string, Customer> = {
  '1': {
    id: '1', name: 'Nguyễn Văn An', phone: '0901234567', avatar: null,
    measurements: [
      { key: 'co', value: 38 }, { key: 'vai', value: 45 }, { key: 'nguc', value: 96 },
      { key: 'eo', value: 78 }, { key: 'lung', value: 43 },
    ],
    fabricSamples: [{ id: 'f1', imageUrl: null, note: 'Lụa xanh' }],
    notes: 'Thích vải lụa, màu xanh đậm', projectedDate: '2026-04-20',
    createdAt: '2026-04-01', updatedAt: '2026-04-05',
  },
  '2': {
    id: '2', name: 'Trần Thị Bình', phone: '0912345678', avatar: null,
    measurements: [{ key: 'co', value: 33 }, { key: 'vai', value: 40 }, { key: 'nguc', value: 88 }],
    fabricSamples: [], notes: '', projectedDate: '2026-05-01',
    createdAt: '2026-04-02', updatedAt: '2026-04-06',
  },
  '3': {
    id: '3', name: 'Lê Minh Châu', phone: '0923456789', avatar: null,
    measurements: [
      { key: 'co', value: 40 }, { key: 'vai', value: 48 }, { key: 'nguc', value: 102 },
      { key: 'eo', value: 90 }, { key: 'mong', value: 100 }, { key: 'bap_tay', value: 34 },
      { key: 'co_tay', value: 18 }, { key: 'lung', value: 45 }, { key: 'dai_tay', value: 60 },
      { key: 'chan', value: 105 }, { key: 'dui', value: 58 }, { key: 'bap_chan', value: 38 },
    ],
    fabricSamples: [], notes: 'Đặt bộ vest cưới', projectedDate: '2026-04-15',
    createdAt: '2026-03-28', updatedAt: '2026-04-08',
  },
};

type Tab = 'body' | 'table' | 'extras';

const CustomerDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const initial = isNew
    ? {
        id: 'new', name: '', phone: '', avatar: null,
        measurements: [] as MeasurementValue[],
        fabricSamples: [] as FabricSample[],
        notes: '', projectedDate: null,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      }
    : DEMO[id || ''] || DEMO['1'];

  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [measurements, setMeasurements] = useState<MeasurementValue[]>(initial.measurements);
  const [activePoint, setActivePoint] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('body');
  const [notes, setNotes] = useState(initial.notes);
  const [projectedDate, setProjectedDate] = useState(initial.projectedDate || '');
  const [fabricSamples, setFabricSamples] = useState<FabricSample[]>(initial.fabricSamples);

  const getMeasurementValue = (key: string) =>
    measurements.find((m) => m.key === key)?.value ??
    MEASUREMENT_DEFINITIONS.find((d) => d.key === key)!.median;

  const updateMeasurement = useCallback((key: string, value: number) => {
    setMeasurements((prev) => {
      const existing = prev.findIndex((m) => m.key === key);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = { key, value };
        return next;
      }
      return [...prev, { key, value }];
    });
  }, []);

  const handlePointClick = (key: string) => {
    setActivePoint(key === activePoint ? null : key);
    setTab('body');
  };

  const handleSave = () => {
    toast.success('Đã lưu thông tin khách hàng!');
  };

  const addFabricSample = () => {
    setFabricSamples((prev) => [...prev, { id: Date.now().toString(), imageUrl: null, note: '' }]);
  };

  const removeFabricSample = (sampleId: string) => {
    setFabricSamples((prev) => prev.filter((s) => s.id !== sampleId));
  };

  const updateFabricNote = (sampleId: string, note: string) => {
    setFabricSamples((prev) => prev.map((s) => (s.id === sampleId ? { ...s, note } : s)));
  };

  const handleImageUpload = (sampleId: string, file: File) => {
    const url = URL.createObjectURL(file);
    setFabricSamples((prev) => prev.map((s) => (s.id === sampleId ? { ...s, imageUrl: url } : s)));
  };

  const tabs: { key: Tab; icon: React.ReactNode; label: string }[] = [
    { key: 'body', icon: <Eye className="w-4 h-4" />, label: 'Hình thể' },
    { key: 'table', icon: <List className="w-4 h-4" />, label: 'Bảng đo' },
    { key: 'extras', icon: <StickyNote className="w-4 h-4" />, label: 'Chi tiết' },
  ];

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="gradient-sunset px-5 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('/')} className="w-10 h-10 rounded-xl bg-background/20 backdrop-blur-sm flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background/20 backdrop-blur-sm text-primary-foreground text-sm font-medium"
          >
            <Save className="w-4 h-4" />
            Lưu
          </motion.button>
        </div>

        {/* Customer info */}
        <div className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên khách hàng"
            className="text-2xl font-heading bg-transparent border-none outline-none text-primary-foreground placeholder:text-primary-foreground/40 w-full"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Số điện thoại"
            className="text-sm font-body bg-transparent border-none outline-none text-primary-foreground/80 placeholder:text-primary-foreground/40 w-full"
          />
        </div>
      </div>

      {/* Tab bar */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-5 py-2">
        <div className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                tab === t.key
                  ? 'gradient-sunset text-primary-foreground shadow-soft'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-4">
        <AnimatePresence mode="wait">
          {tab === 'body' && (
            <motion.div
              key="body"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <BodySilhouette
                measurements={measurements}
                definitions={MEASUREMENT_DEFINITIONS}
                onPointClick={handlePointClick}
                activePoint={activePoint}
              />

              {/* Active measurement slider */}
              {activePoint && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <MeasurementSlider
                    definition={MEASUREMENT_DEFINITIONS.find((d) => d.key === activePoint)!}
                    value={getMeasurementValue(activePoint)}
                    onChange={(v) => updateMeasurement(activePoint, v)}
                    isActive
                  />
                </motion.div>
              )}

              {/* All measurement sliders */}
              <div className="space-y-2">
                <h3 className="text-lg font-heading text-foreground">Tất cả số đo</h3>
                {MEASUREMENT_DEFINITIONS.map((def) => (
                  <div key={def.key} onClick={() => setActivePoint(def.key)}>
                    <MeasurementSlider
                      definition={def}
                      value={getMeasurementValue(def.key)}
                      onChange={(v) => updateMeasurement(def.key, v)}
                      isActive={activePoint === def.key}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === 'table' && (
            <motion.div
              key="table"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <MeasurementTable
                measurements={measurements}
                definitions={MEASUREMENT_DEFINITIONS}
                onRowClick={handlePointClick}
                activeKey={activePoint}
              />
            </motion.div>
          )}

          {tab === 'extras' && (
            <motion.div
              key="extras"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Fabric Photos */}
              <FabricPhotos
                samples={fabricSamples}
                onAdd={addFabricSample}
                onRemove={removeFabricSample}
                onNoteChange={updateFabricNote}
                onImageUpload={handleImageUpload}
              />

              {/* Notes */}
              <div className="space-y-2">
                <h3 className="text-lg font-heading text-foreground">Yêu cầu thêm</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ghi chú về kiểu dáng, màu sắc, chất liệu mong muốn..."
                  rows={4}
                  className="w-full rounded-2xl border border-border bg-card p-4 text-sm font-body text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/30 focus:shadow-soft transition-all resize-none"
                />
              </div>

              {/* Projected Date */}
              <div className="space-y-2">
                <h3 className="text-lg font-heading text-foreground">Ngày dự kiến giao</h3>
                <div className="relative">
                  <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={projectedDate}
                    onChange={(e) => setProjectedDate(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-border bg-card text-sm font-body text-foreground outline-none focus:border-primary/30 focus:shadow-soft transition-all"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CustomerDetail;
