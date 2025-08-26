import { useEffect, useState } from "react";
import { type DiscountType } from "@/app/_components/inputs/discount-select";

export interface IncomeFormData {
  description: string;
  dateStr: string;
  timeStr: string;
  extraValue: number;
  profitMargin: number;
  discountType: DiscountType;
  discountValue: number | undefined;
  customerId: string;
  selectedProducts: Record<number, { quantity: number; unitPrice: number }>;
}

export interface IncomeFormPersistence {
  description: string;
  dateStr: string;
  timeStr: string;
  extraValue: number;
  profitMargin: number;
  discountType: DiscountType;
  discountValue: number | undefined;
  customerId: string;
  selectedProducts: Record<number, { quantity: number; unitPrice: number }>;
  customersLoaded: boolean;
  customerHydrated: boolean;
  initialDataLoaded: boolean;
  setDescription: (value: string) => void;
  setDateStr: (value: string) => void;
  setTimeStr: (value: string) => void;
  setExtraValue: (value: number) => void;
  setProfitMargin: (value: number) => void;
  setDiscountType: (value: DiscountType) => void;
  setDiscountValue: (value: number | undefined) => void;
  setCustomerId: (value: string) => void;
  setSelectedProducts: (value: Record<number, { quantity: number; unitPrice: number }>) => void;
  setCustomersLoaded: (value: boolean) => void;
  setCustomerHydrated: (value: boolean) => void;
  hydrateCustomerId: (customers: Array<{ id: number; name: string }>) => void;
  clearPersistedData: () => void;
}

export function useIncomeFormPersistence(): IncomeFormPersistence {
  const [description, setDescription] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");
  const [timeStr, setTimeStr] = useState<string>("");
  const [extraValue, setExtraValue] = useState<number>(0);
  const [profitMargin, setProfitMargin] = useState<number>(28);
  const [discountType, setDiscountType] = useState<DiscountType>("percentage");
  const [discountValue, setDiscountValue] = useState<number | undefined>(undefined);
  const [customerId, setCustomerId] = useState<string>("");
  const [selectedProducts, setSelectedProducts] = useState<Record<number, { quantity: number; unitPrice: number }>>({});
  const [customersLoaded, setCustomersLoaded] = useState(false);
  const [customerHydrated, setCustomerHydrated] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // Get today's date and current time in local timezone
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });

  const currentTime = new Date().toLocaleTimeString("pt-BR", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });

  // Load persisted form state from localStorage (and set sensible defaults)
  useEffect(() => {
    try {
      const savedDescription = localStorage.getItem("income-form-description");
      const savedDate = localStorage.getItem("income-form-date");
      const savedTime = localStorage.getItem("income-form-time");
      const savedExtra = localStorage.getItem("income-form-extraValue");
      const savedProfit = localStorage.getItem("income-form-profitMargin");
      const savedDiscountType = localStorage.getItem("income-form-discountType");
      const savedDiscountValue = localStorage.getItem("income-form-discountValue");

      if (savedDescription !== null) setDescription(savedDescription);
      // Defaults to today/current time if nothing saved
      setDateStr(savedDate ?? today);
      setTimeStr(savedTime ?? currentTime);
      if (savedExtra !== null) setExtraValue(Number(savedExtra) || 0);
      if (savedProfit !== null) setProfitMargin(Number(savedProfit) || 0);

      // Load discount type and map legacy value "percent" to "percentage"
      if (savedDiscountType === "fixed") {
        setDiscountType("fixed");
      } else if (savedDiscountType === "percent" || savedDiscountType === "percentage") {
        setDiscountType("percentage");
      }
      // If savedDiscountType is null/undefined or invalid, keep the default "percentage"

      // Load discount value with validation
      if (savedDiscountValue !== null && savedDiscountValue !== "") {
        const numericValue = Number(savedDiscountValue);
        if (!isNaN(numericValue) && numericValue >= 0) {
          setDiscountValue(numericValue);
        }
      }

      // Load previously selected products for summary and submission
      const savedSelection = localStorage.getItem("income-selected-products");
      if (savedSelection) {
        try {
          const parsed = JSON.parse(savedSelection) as unknown;
          if (parsed && typeof parsed === "object") {
            const validSelection: Record<number, { quantity: number; unitPrice: number }> = {};
            for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
              const productId = Number(key);
              if (Number.isFinite(productId) && value && typeof value === "object") {
                const obj = value as Record<string, unknown>;
                const quantity = typeof obj.quantity === "number" ? obj.quantity : 0;
                const unitPrice = typeof obj.unitPrice === "number" ? obj.unitPrice : 0;
                if (quantity > 0) validSelection[productId] = { quantity, unitPrice };
              }
            }
            setSelectedProducts(validSelection);
          }
        } catch {}
      }
    } catch {}
    // Mark initial data as loaded after attempting to load all data
    setInitialDataLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist form state to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem("income-form-description", description);
    } catch {}
  }, [description]);

  useEffect(() => {
    try {
      localStorage.setItem("income-form-date", dateStr);
    } catch {}
  }, [dateStr]);

  useEffect(() => {
    try {
      localStorage.setItem("income-form-time", timeStr);
    } catch {}
  }, [timeStr]);

  useEffect(() => {
    try {
      localStorage.setItem("income-form-extraValue", String(extraValue));
    } catch {}
  }, [extraValue]);

  useEffect(() => {
    try {
      localStorage.setItem("income-form-profitMargin", String(profitMargin));
    } catch {}
  }, [profitMargin]);

  useEffect(() => {
    // Only persist discount type after initial hydration
    if (!initialDataLoaded) return;
    try {
      localStorage.setItem("income-form-discountType", discountType);
    } catch {}
  }, [discountType, initialDataLoaded]);

  useEffect(() => {
    // Only persist discount value after initial hydration
    if (!initialDataLoaded) return;
    try {
      if (discountValue === undefined)
        localStorage.removeItem("income-form-discountValue");
      else
        localStorage.setItem("income-form-discountValue", String(discountValue));
    } catch {}
  }, [discountValue, initialDataLoaded]);

  useEffect(() => {
    // Only persist after hydration to avoid clearing saved value on load
    if (!customersLoaded || !customerHydrated) return;
    try {
      if (customerId) {
        localStorage.setItem("income-form-customerId", customerId);
      }
      // If customerId is empty, do not remove LS; preserve any saved value
    } catch {}
  }, [customerId, customersLoaded, customerHydrated]);

  // Hydrate customer ID from localStorage once, after customers are loaded
  const hydrateCustomerId = (customers: Array<{ id: number; name: string }>) => {
    if (!customersLoaded || customerHydrated) return;
    try {
      const savedCustomerId = localStorage.getItem("income-form-customerId");
      if (savedCustomerId !== null && savedCustomerId !== "") {
        const customerExists = customers.some((c) => String(c.id) === savedCustomerId);
        if (customerExists) {
          setCustomerId(savedCustomerId);
        }
      }
    } catch {}
    setCustomerHydrated(true);
  };

  const clearPersistedData = () => {
    try {
      localStorage.removeItem("income-form-description");
      localStorage.removeItem("income-form-date");
      localStorage.removeItem("income-form-time");
      localStorage.removeItem("income-form-extraValue");
      localStorage.removeItem("income-form-profitMargin");
      localStorage.removeItem("income-form-discountType");
      localStorage.removeItem("income-form-discountValue");
      localStorage.removeItem("income-form-customerId");
      localStorage.removeItem("income-selected-products");
    } catch {}
  };

  return {
    description,
    dateStr,
    timeStr,
    extraValue,
    profitMargin,
    discountType,
    discountValue,
    customerId,
    selectedProducts,
    customersLoaded,
    customerHydrated,
    initialDataLoaded,
    setDescription,
    setDateStr,
    setTimeStr,
    setExtraValue,
    setProfitMargin,
    setDiscountType,
    setDiscountValue,
    setCustomerId,
    setSelectedProducts,
    setCustomersLoaded,
    setCustomerHydrated,
    hydrateCustomerId,
    clearPersistedData,
  };
}
