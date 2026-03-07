import { SidebarProvider } from '@/components/ui/sidebar'
import DashboardSidebar from '../DashboardSidebar'

export default function DashboardSidebarExample() {
  const style = {
    "--sidebar-width": "20rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <DashboardSidebar />
      </div>
    </SidebarProvider>
  )
}
