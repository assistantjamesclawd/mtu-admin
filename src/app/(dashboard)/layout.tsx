import Sidebar from "@/components/Sidebar"
import GlobalSearch from "@/components/GlobalSearch"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
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
  )
}
