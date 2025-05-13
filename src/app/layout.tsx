import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import BottomNav from "@/app/_components/bottom-nav";

export const metadata: Metadata = {
  title: "Prime Controle Financeiro",
  description: "Controle Financeiro",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${geist.variable}`}>
      <body>
        <main className="mx-auto pb-32">{children}</main>
        <Toaster richColors />
        <BottomNav />
      </body>
    </html>
  );
}
