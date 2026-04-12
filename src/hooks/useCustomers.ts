import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Customer, MeasurementValue, FabricSample } from '@/types/customer';

function mapRow(row: any, measurements: any[], fabricSamples: any[]): Customer {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    avatar: row.avatar_url,
    measurements: measurements.map((m: any) => ({ key: m.key, value: Number(m.value) })),
    fabricSamples: fabricSamples.map((f: any) => ({ id: f.id, imageUrl: f.image_url, note: f.note })),
    notes: row.notes,
    projectedDate: row.projected_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data: customers, error } = await supabase
        .from('customers')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      
      // Fetch all measurements in one query
      const ids = customers.map((c) => c.id);
      const { data: allMeasurements } = await supabase
        .from('measurements')
        .select('*')
        .in('customer_id', ids);

      return customers.map((c) => 
        mapRow(c, (allMeasurements || []).filter((m) => m.customer_id === c.id), [])
      );
    },
  });
}

export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: ['customer', id],
    enabled: !!id && id !== 'new',
    queryFn: async () => {
      const { data: customer, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;

      const [{ data: measurements }, { data: fabricSamples }] = await Promise.all([
        supabase.from('measurements').select('*').eq('customer_id', id!),
        supabase.from('fabric_samples').select('*').eq('customer_id', id!),
      ]);

      return mapRow(customer, measurements || [], fabricSamples || []);
    },
  });
}

export function useSaveCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id?: string;
      isNew: boolean;
      name: string;
      phone: string;
      notes: string;
      projectedDate: string;
      measurements: MeasurementValue[];
      fabricSamples: FabricSample[];
    }) => {
      const { isNew, measurements, fabricSamples, ...customerData } = params;
      
      let customerId: string;

      if (isNew) {
        const { data, error } = await supabase
          .from('customers')
          .insert({
            name: customerData.name,
            phone: customerData.phone,
            notes: customerData.notes,
            projected_date: customerData.projectedDate || null,
          })
          .select('id')
          .single();
        if (error) throw error;
        customerId = data.id;
      } else {
        customerId = params.id!;
        const { error } = await supabase
          .from('customers')
          .update({
            name: customerData.name,
            phone: customerData.phone,
            notes: customerData.notes,
            projected_date: customerData.projectedDate || null,
          })
          .eq('id', customerId);
        if (error) throw error;
      }

      // Upsert measurements
      if (measurements.length > 0) {
        const { error } = await supabase
          .from('measurements')
          .upsert(
            measurements.map((m) => ({
              customer_id: customerId,
              key: m.key,
              value: m.value,
            })),
            { onConflict: 'customer_id,key' }
          );
        if (error) throw error;
      }

      // Sync fabric samples - delete old ones and insert new
      await supabase.from('fabric_samples').delete().eq('customer_id', customerId);
      if (fabricSamples.length > 0) {
        const { error } = await supabase
          .from('fabric_samples')
          .insert(
            fabricSamples.map((f) => ({
              customer_id: customerId,
              image_url: f.imageUrl,
              note: f.note,
            }))
          );
        if (error) throw error;
      }

      return customerId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer'] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}
