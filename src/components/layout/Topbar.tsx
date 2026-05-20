import { LogOut, Menu, Search, User } from 'lucide-react'
import * as React from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { SidebarInner } from '@/components/layout/Sidebar'
import { MOCK_USERS } from '@/lib/constants'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

interface TopbarProps {
  title?: string
  className?: string
}

export function Topbar({ title, className }: TopbarProps) {
  const { currentUser, logout, login } = useAuthStore()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header
      className={cn(
        'flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4',
        className
      )}
    >
      {/* Hamburger — mobile only */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </Button>

        <SheetContent side="left" className="w-60 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarInner onNavigate={() => setDrawerOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Page title */}
      <span className="flex-1 truncate text-sm font-medium text-foreground">
        {title ?? 'Dashboard'}
      </span>

      {/* Search */}
      <div className="relative hidden sm:block">
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          placeholder="Search bills, products, customers…"
          className="h-8 w-56 pl-8 text-xs lg:w-72"
        />
      </div>

      {/* Theme toggle */}
      <ThemeToggle />

      {/* User avatar dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            aria-label="User menu"
          >
            <User size={14} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          {currentUser && (
            <>
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium">{currentUser.name}</p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  {currentUser.email}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuItem
            onClick={handleLogout}
            className="text-destructive focus:text-destructive"
          >
            <LogOut size={14} className="mr-2" />
            Log out
          </DropdownMenuItem>

          {import.meta.env.DEV && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Dev · switch user
              </DropdownMenuLabel>
              {MOCK_USERS.map((u) => (
                <DropdownMenuItem
                  key={u.id}
                  onClick={() => { login(u.id); window.location.reload() }}
                >
                  {u.name}
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
