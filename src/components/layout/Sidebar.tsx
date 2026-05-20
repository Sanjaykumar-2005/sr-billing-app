import {
  BarChart3,
  Boxes,
  FilePlus,
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  PackagePlus,
  Receipt,
  ShoppingCart,
  Tag,
  TrendingUp,
  Warehouse,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { COMPANY } from '@/lib/brand'
import { SECTIONS } from '@/lib/constants'
import { getNavFor } from '@/lib/navigation'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import type { Role } from '@/types'
import { SECTION_ACCESS } from '@/types'

// ─── Icon registry ────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Receipt,
  FilePlus,
  FileText,
  ShoppingCart,
  PackagePlus,
  Package,
  Boxes,
  Tag,
  Warehouse,
  BarChart3,
  TrendingUp,
}

// ─── Role display ─────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<Role, string> = {
  admin:     'Administrator',
  billing_a: 'Billing — A',
  billing_b: 'Billing — B',
}

// ─── Component ────────────────────────────────────────────────────────────────

interface SidebarInnerProps {
  onNavigate?: () => void
}

export function SidebarInner({ onNavigate }: SidebarInnerProps) {
  const { currentUser, logout } = useAuthStore()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const navItems = currentUser ? getNavFor(currentUser.role) : []

  const accessibleSections = currentUser
    ? SECTIONS.filter((s) => SECTION_ACCESS[currentUser.role].includes(s.key))
    : []

  return (
    <div className="flex h-full flex-col">
      {/* ── Wordmark + shop name ── */}
      <div className="px-4 pt-5 pb-4">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          SR P&amp;
          <span className="text-primary">G</span>
        </p>
        <p className="mt-0.5 font-sans text-base font-medium text-foreground">
          {COMPANY.tagline}
        </p>
      </div>

      <Separator />

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {navItems.map((item, index) => {
            const Icon = ICON_MAP[item.iconName]
            const startsAnalytics = item.path.startsWith('/reports')
              && !navItems[index - 1]?.path.startsWith('/reports')
            return (
              <li key={item.path}>
                {startsAnalytics && (
                  <p className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Analytics
                  </p>
                )}
                <NavLink
                  to={item.path}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'flex h-9 items-center gap-2.5 rounded-md px-3 text-sm',
                      'text-muted-foreground transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      isActive &&
                        'border-l-2 border-primary pl-[10px] text-foreground font-medium bg-transparent hover:bg-accent'
                    )
                  }
                >
                  {Icon && <Icon size={16} strokeWidth={1.75} />}
                  <span>{item.label}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <Separator />

      {/* ── Section access badges ── */}
      {accessibleSections.length > 0 && (
        <div className="px-4 py-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Sections
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-1.5">
            {accessibleSections.map((s) => (
              <div key={s.key} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: `hsl(var(${s.colorVar}))` }}
                />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* ── Current user + logout ── */}
      {currentUser && (
        <div className="flex items-center justify-between px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {currentUser.name}
            </p>
            <p className="font-mono text-[10px] text-muted-foreground">
              {ROLE_LABELS[currentUser.role]}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            aria-label="Log out"
            className="ml-2 shrink-0 text-muted-foreground hover:text-destructive"
          >
            <LogOut size={15} />
          </Button>
        </div>
      )}
    </div>
  )
}

/** Desktop sidebar — fixed 240 px column */
export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-card md:flex md:flex-col">
      <SidebarInner />
    </aside>
  )
}
