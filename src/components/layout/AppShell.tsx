import { Outlet, useLocation } from 'react-router-dom'

import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { NAV_ITEMS } from '@/lib/navigation'

/** Derive a human-readable page title from the current pathname */
function useTitleFromRoute(): string {
  const { pathname } = useLocation()
  const match = NAV_ITEMS.find((item) => {
    // Exact match first, then prefix match for dynamic segments (:id)
    if (item.path === pathname) return true
    const staticPrefix = item.path.replace(/\/:[^/]+/g, '')
    return staticPrefix !== item.path && pathname.startsWith(staticPrefix)
  })
  return match?.label ?? 'Dashboard'
}

export function AppShell() {
  const title = useTitleFromRoute()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Fixed desktop sidebar */}
      <Sidebar />

      {/* Right column: topbar + scrollable main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title={title} />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-6 py-6"><Outlet /></div>
        </main>
      </div>
    </div>
  )
}
