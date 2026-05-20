import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { COMPANY } from '@/lib/brand'
import { MOCK_USERS } from '@/lib/constants'
import { useAuthStore } from '@/store/authStore'
import type { Role } from '@/types'

const ROLE_LABELS: Record<Role, string> = {
  admin:     'Administrator',
  billing_a: 'Billing — A',
  billing_b: 'Billing — B',
}

export function LoginPage() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  function handleSelect(userId: string) {
    login(userId)
    navigate('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {COMPANY.shortName}
        </p>
        <p className="mt-1 text-2xl font-medium text-foreground">
          {COMPANY.name}
        </p>
        <p className="mt-0.5 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {COMPANY.place}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Select your account to continue
        </p>

        <div className="mt-8 space-y-2">
          {MOCK_USERS.map((user) => (
            <Button
              key={user.id}
              variant="outline"
              onClick={() => handleSelect(user.id)}
              className="h-auto w-full rounded-md px-4 py-4 hover:bg-muted/50 hover:border-border"
            >
              <div className="flex w-full items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-foreground">
                  {user.name.charAt(0)}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-foreground">
                    {user.name}
                  </span>
                  <span className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {ROLE_LABELS[user.role]}
                  </span>
                </div>
              </div>
            </Button>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground/70">
          Demo mode · backend coming
        </p>
      </div>
    </div>
  )
}
