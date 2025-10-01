import { useEffect, useState } from "react";

export interface Product {
  id: number;
  name: string;
  price: string;
  quantity: number;
}

export interface Customer {
  id: number;
  name: string;
}

export interface IncomeDataHook {
  products: Product[];
  customers: Customer[];
  productsLoading: boolean;
  customersLoading: boolean;
  createCustomer: (name: string) => Promise<Customer | null>;
}

export function useIncomeData(): IncomeDataHook {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [customersLoading, setCustomersLoading] = useState(true);

  // Load products from API
  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/produtos", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as unknown;
        if (Array.isArray(data)) {
          const safe = (data as unknown[])
            .map((it) => {
              const obj = it as Record<string, unknown>;
              const id = typeof obj.id === "number" ? obj.id : Number(obj.id);
              let name = "";
              if (typeof obj.name === "string") name = obj.name;
              let price = "0";
              if (typeof obj.price === "string") price = obj.price;
              else if (typeof obj.price === "number")
                price = obj.price.toFixed(2);
              const quantity =
                typeof obj.quantity === "number"
                  ? obj.quantity
                  : Number(obj.quantity ?? 0);
              return { id, name, price, quantity };
            })
            .filter(
              (p) =>
                Number.isFinite(p.id) &&
                p.name.length > 0 &&
                Number.isFinite(p.quantity),
            );
          setProducts(safe);
        } else {
          setProducts([]);
        }
      } catch {
        // ignore
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    })();
  }, []);

  // Load customers from API
  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/clientes", { cache: "no-store" });
        if (!res.ok) return;
        const list = (await res.json()) as Array<{ id: number; name: string }>;
        if (Array.isArray(list)) {
          setCustomers(list);
        } else {
          setCustomers([]);
        }
      } catch {
        setCustomers([]);
      } finally {
        setCustomersLoading(false);
      }
    })();
  }, []);

  const createCustomer = async (name: string): Promise<Customer | null> => {
    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) return null;
      const created = (await res.json()) as Customer;
      setCustomers((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
      );
      return created;
    } catch {
      return null;
    }
  };

  return {
    products,
    customers,
    productsLoading,
    customersLoading,
    createCustomer,
  };
}
