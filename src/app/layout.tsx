import "@/styles/globals.css";

import { type Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import BottomNav from "@/app/_components/bottom-nav";

export const metadata: Metadata = {
  title: "Ferreira Controle Financeiro",
  description: "Controle Financeiro",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
    >
      <body>
        <main className="mx-auto pb-32">{children}</main>
        <Toaster richColors position="top-center" />
        <BottomNav />
      </body>
    </html>
  );
}
