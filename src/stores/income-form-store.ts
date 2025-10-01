import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type DiscountType } from "@/app/_components/inputs/discount-select";

export interface IncomeFormData {
  description: string;
  dateStr: string;
  timeStr: string;
  discountType: DiscountType;
  discountValue: number | undefined;
  customerId: string;
  selectedProducts: Record<number, { quantity: number; unitPrice: number }>;
}

interface IncomeFormStore extends IncomeFormData {
  // Hydration flag for persisted store
  hasHydrated: boolean;
  // Setters
  setDescription: (value: string) => void;
  setDateStr: (value: string) => void;
  setTimeStr: (value: string) => void;
  setDiscountType: (value: DiscountType) => void;
  setDiscountValue: (value: number | undefined) => void;
  setCustomerId: (value: string) => void;
  setSelectedProducts: (value: Record<number, { quantity: number; unitPrice: number }>) => void;

  // Utility methods
  clearFormData: () => void;
  resetToDefaults: () => void;
}

const getDefaultValues = () => {
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });

  const currentTime = new Date().toLocaleTimeString("pt-BR", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });

  return {
    description: "",
    dateStr: today,
    timeStr: currentTime,
    discountType: "percentage" as DiscountType,
    discountValue: undefined,
    customerId: "",
    selectedProducts: {} as Record<number, { quantity: number; unitPrice: number }>,
  };
};

export const useIncomeFormStore = create<IncomeFormStore>()(
  persist(
    (set, _get) => ({
      ...getDefaultValues(),
      hasHydrated: false,

      setDescription: (value) => set({ description: value }),
      setDateStr: (value) => set({ dateStr: value }),
      setTimeStr: (value) => set({ timeStr: value }),
      
      setDiscountType: (value) => set({ discountType: value }),
      setDiscountValue: (value) => set({ discountValue: value }),
      setCustomerId: (value) => set({ customerId: value }),
      setSelectedProducts: (value) => set({ selectedProducts: value }),

      clearFormData: () => {
        set(getDefaultValues());
      },

      resetToDefaults: () => {
        set(getDefaultValues());
      },
    }),
    {
      name: "income-form-storage",
      partialize: (state) => ({
        description: state.description,
        dateStr: state.dateStr,
        timeStr: state.timeStr,
        discountType: state.discountType,
        discountValue: state.discountValue,
        customerId: state.customerId,
        selectedProducts: state.selectedProducts,
      }),
      onRehydrateStorage: () => (state, _error) => {
        // Mark store as hydrated so UI can safely read persisted values
        if (state) {
          state.hasHydrated = true;
        }
      },
    }
  )
);
