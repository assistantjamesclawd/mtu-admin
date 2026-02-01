import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import GlobalSearch from "@/components/GlobalSearch";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MTU Admin",
  description: "Mountain Time Utah - Admin Dashboard",
  manifest: "/manifest.json",
  themeColor: "#3d3530",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MTU Admin",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Bar */}
            <header className="bg-white border-b px-4 py-3 flex items-center justify-end lg:justify-between">
              <div className="hidden lg:block" />
              <GlobalSearch />
            </header>
            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-gray-50 p-4 pt-4 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
