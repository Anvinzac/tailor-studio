import React from 'react';
import { Customer } from '@/types/customer';
import { ChevronRight, Calendar, Ruler } from 'lucide-react';
import { motion } from 'framer-motion';

interface CustomerCardProps {
  customer: Customer;
  onClick: () => void;
  index: number;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onClick, index }) => {
  const measuredCount = customer.measurements.length;
  const totalCount = 12;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:shadow-soft hover:border-primary/20 transition-all text-left group"
    >
      {/* Avatar */}
      <div className="w-12 h-12 rounded-xl gradient-sunset flex items-center justify-center shrink-0">
        <span className="text-lg font-heading text-primary-foreground">
          {customer.name.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-foreground truncate">{customer.name}</h3>
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Ruler className="w-3 h-3" />
            {measuredCount}/{totalCount} số đo
          </span>
          {customer.projectedDate && (
            <span className="flex items-center gap-1 text-xs text-secondary">
              <Calendar className="w-3 h-3" />
              {new Date(customer.projectedDate).toLocaleDateString('vi-VN')}
            </span>
          )}
        </div>
      </div>

      {/* Progress ring */}
      <div className="relative w-10 h-10 shrink-0">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeDasharray={`${(measuredCount / totalCount) * 94.2} 94.2`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-foreground">
          {Math.round((measuredCount / totalCount) * 100)}%
        </span>
      </div>

      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
    </motion.button>
  );
};

export default CustomerCard;
