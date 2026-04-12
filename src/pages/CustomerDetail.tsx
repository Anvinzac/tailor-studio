import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Calendar as CalendarIcon, Eye, List, StickyNote, Loader2 } from 'lucide-react';
import BodySilhouette from '@/components/BodySilhouette';
import MeasurementSlider from '@/components/MeasurementSlider';
import MeasurementTable from '@/components/MeasurementTable';
import FabricPhotos from '@/components/FabricPhotos';
import { MeasurementValue, FabricSample, MEASUREMENT_DEFINITIONS } from '@/types/customer';
import { useCustomer, useSaveCustomer } from '@/hooks/useCustomers';
import { toast } from 'sonner';

type Tab = 'body' | 'table' | 'extras';

const CustomerDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const { data: customer, isLoading } = useCustomer(id);
  const saveCustomer = useSaveCustomer();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [measurements, setMeasurements] = useState<MeasurementValue[]>([]);
  const [activePoint, setActivePoint] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('body');
  const [notes, setNotes] = useState('');
  const [projectedDate, setProjectedDate] = useState('');
  const [fabricSamples, setFabricSamples] = useState<FabricSample[]>([]);
  const [initialized, setInitialized] = useState(isNew);

  // Populate form when customer data loads
  useEffect(() => {
    if (customer && !initialized) {
      setName(customer.name);
      setPhone(customer.phone);
      setMeasurements(customer.measurements);
      setNotes(customer.notes);
      setProjectedDate(customer.projectedDate || '');
      setFabricSamples(customer.fabricSamples);
      setInitialized(true);
    }
  }, [customer, initialized]);

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

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên khách hàng');
      return;
    }
    try {
      const customerId = await saveCustomer.mutateAsync({
        id: isNew ? undefined : id,
        isNew,
        name,
        phone,
        notes,
        projectedDate,
        measurements,
        fabricSamples,
      });
      toast.success('Đã lưu thông tin khách hàng!');
      if (isNew) {
        navigate(`/customer/${customerId}`, { replace: true });
      }
    } catch (e) {
      toast.error('Lỗi khi lưu. Vui lòng thử lại.');
    }
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

  if (!isNew && isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
            disabled={saveCustomer.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background/20 backdrop-blur-sm text-primary-foreground text-sm font-medium disabled:opacity-50"
          >
            {saveCustomer.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Lưu
          </motion.button>
        </div>

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

              {activePoint && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <MeasurementSlider
                    definition={MEASUREMENT_DEFINITIONS.find((d) => d.key === activePoint)!}
                    value={getMeasurementValue(activePoint)}
                    onChange={(v) => updateMeasurement(activePoint, v)}
                    isActive
                  />
                </motion.div>
              )}

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
                onMeasurementChange={updateMeasurement}
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
              <FabricPhotos
                samples={fabricSamples}
                onAdd={addFabricSample}
                onRemove={removeFabricSample}
                onNoteChange={updateFabricNote}
                onImageUpload={handleImageUpload}
              />

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
