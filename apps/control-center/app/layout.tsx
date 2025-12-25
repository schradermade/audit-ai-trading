import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Header } from "@/components/layout/header";
import { TradeHistoryProviderWrapper } from "@/components/providers/trade-history-provider-wrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Audit AI Trading - Control Center",
  description: "Control center for audit-first AI trading system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TradeHistoryProviderWrapper>
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <SidebarNav />

            {/* Main content */}
            <div className="flex flex-1 flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto bg-muted/10 p-6">
                {children}
              </main>
            </div>
          </div>
        </TradeHistoryProviderWrapper>
      </body>
    </html>
  );
}
