import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Scissors } from 'lucide-react';
import CustomerCard from '@/components/CustomerCard';
import { Customer, MEASUREMENT_DEFINITIONS } from '@/types/customer';

const DEMO_CUSTOMERS: Customer[] = [
  {
    id: '1',
    name: 'Nguyễn Văn An',
    phone: '0901234567',
    avatar: null,
    measurements: [
      { key: 'co', value: 38 },
      { key: 'vai', value: 45 },
      { key: 'nguc', value: 96 },
      { key: 'eo', value: 78 },
      { key: 'lung', value: 43 },
    ],
    fabricSamples: [],
    notes: 'Thích vải lụa, màu xanh đậm',
    projectedDate: '2026-04-20',
    createdAt: '2026-04-01',
    updatedAt: '2026-04-05',
  },
  {
    id: '2',
    name: 'Trần Thị Bình',
    phone: '0912345678',
    avatar: null,
    measurements: [
      { key: 'co', value: 33 },
      { key: 'vai', value: 40 },
      { key: 'nguc', value: 88 },
    ],
    fabricSamples: [],
    notes: '',
    projectedDate: '2026-05-01',
    createdAt: '2026-04-02',
    updatedAt: '2026-04-06',
  },
  {
    id: '3',
    name: 'Lê Minh Châu',
    phone: '0923456789',
    avatar: null,
    measurements: [
      { key: 'co', value: 40 },
      { key: 'vai', value: 48 },
      { key: 'nguc', value: 102 },
      { key: 'eo', value: 90 },
      { key: 'mong', value: 100 },
      { key: 'bap_tay', value: 34 },
      { key: 'co_tay', value: 18 },
      { key: 'lung', value: 45 },
      { key: 'dai_tay', value: 60 },
      { key: 'chan', value: 105 },
      { key: 'dui', value: 58 },
      { key: 'bap_chan', value: 38 },
    ],
    fabricSamples: [],
    notes: 'Đặt bộ vest cưới',
    projectedDate: '2026-04-15',
    createdAt: '2026-03-28',
    updatedAt: '2026-04-08',
  },
];

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [customers] = useState<Customer[]>(DEMO_CUSTOMERS);
  const [search, setSearch] = useState('');

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-sunset px-5 pt-12 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Scissors className="w-6 h-6 text-primary-foreground" />
            <h1 className="text-2xl font-heading text-primary-foreground">TailorPro</h1>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/customer/new')}
            className="w-10 h-10 rounded-xl bg-background/20 backdrop-blur-sm flex items-center justify-center"
          >
            <Plus className="w-5 h-5 text-primary-foreground" />
          </motion.button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/60" />
          <input
            type="text"
            placeholder="Tìm khách hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-background/20 backdrop-blur-sm text-primary-foreground placeholder:text-primary-foreground/50 text-sm font-body outline-none border-none"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 -mt-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Khách hàng', value: customers.length, color: 'bg-primary' },
            { label: 'Đang may', value: 2, color: 'bg-secondary' },
            { label: 'Sắp giao', value: 1, color: 'bg-accent' },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl border border-border p-3 text-center">
              <p className="text-xl font-semibold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Customer List */}
      <div className="px-5 pt-6 pb-24">
        <h2 className="text-lg font-heading text-foreground mb-3">Khách hàng</h2>
        <div className="space-y-2">
          {filtered.map((customer, i) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              index={i}
              onClick={() => navigate(`/customer/${customer.id}`)}
            />
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              Không tìm thấy khách hàng
            </p>
          )}
        </div>
      </div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/customer/new')}
        className="fixed bottom-6 right-5 w-14 h-14 rounded-2xl gradient-vibrant shadow-glow flex items-center justify-center"
      >
        <Plus className="w-6 h-6 text-primary-foreground" />
      </motion.button>
    </div>
  );
};

export default Index;
