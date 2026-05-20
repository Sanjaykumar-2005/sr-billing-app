import { ArrowRight, Hammer, Power, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { MOCK_USERS } from '@/lib/constants'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@/types'

interface WorkspaceCard {
  initials: string
  role: string
  description: string
  badge: string
  gradient: string
}

const CARD_DETAILS: Record<string, WorkspaceCard> = {
  'u-1': {
    initials: 'KS',
    role: 'Billing A',
    description: 'Front counter billing & invoicing',
    badge: 'COUNTER 1',
    gradient: 'linear-gradient(135deg, #8B5E3C, #C4895A)',
  },
  'u-2': {
    initials: 'MR',
    role: 'Billing B',
    description: 'Second counter & customer accounts',
    badge: 'COUNTER 2',
    gradient: 'linear-gradient(135deg, #2A7B6E, #3DA899)',
  },
  'u-3': {
    initials: 'SV',
    role: 'Administrator',
    description: 'Full access · inventory · reports',
    badge: 'OWNER',
    gradient: 'linear-gradient(135deg, #3D2B1F, #6B4226)',
  },
}

const palette = {
  cream: '#F5F0E8',
  bronze: '#8B5E3C',
  bronzeLight: '#C4895A',
  teal: '#2A7B6E',
  tealLight: '#3DA899',
  brownDark: '#3D2B1F',
  muted: '#8A7A6E',
  border: 'rgba(139,94,60,0.18)',
}

function getCard(user: User): WorkspaceCard {
  return CARD_DETAILS[user.id] ?? {
    initials: user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
    role: user.role,
    description: 'Workspace access',
    badge: 'USER',
    gradient: 'linear-gradient(135deg, #8B5E3C, #C4895A)',
  }
}

function DecorativeLayer() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg className="fixed inset-0 h-full w-full opacity-[0.09]" preserveAspectRatio="none">
        <filter id="plywood-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.08" numOctaves="4" seed="12" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.22" />
          </feComponentTransfer>
        </filter>
        <rect width="100%" height="100%" filter="url(#plywood-noise)" />
      </svg>

      <svg className="absolute -right-12 top-20 h-80 w-80 opacity-[0.1]" viewBox="0 0 320 320">
        <rect x="60" y="36" width="190" height="250" rx="8" fill="none" stroke={palette.bronze} strokeWidth="4" />
        <rect x="82" y="58" width="190" height="250" rx="8" fill="none" stroke={palette.bronzeLight} strokeWidth="3" />
        {Array.from({ length: 9 }).map((_, index) => (
          <path
            key={index}
            d={`M${78 + index * 18} 52 C ${112 + index * 8} 96, ${80 + index * 20} 148, ${128 + index * 10} 296`}
            fill="none"
            stroke={palette.brownDark}
            strokeWidth="2"
          />
        ))}
      </svg>

      <svg className="absolute -left-12 bottom-24 h-56 w-56 opacity-[0.08]" viewBox="0 0 220 220">
        <rect x="36" y="40" width="132" height="150" rx="10" fill="none" stroke={palette.teal} strokeWidth="4" />
        <path d="M62 72 L140 48" stroke={palette.tealLight} strokeWidth="3" />
        <path d="M78 178 L162 88" stroke={palette.tealLight} strokeWidth="3" />
      </svg>

      <svg className="absolute left-10 top-[44%] h-40 w-48 opacity-[0.09]" viewBox="0 0 190 150">
        <path d="M62 28 C90 2, 130 18, 126 54 C168 58, 176 112, 132 120 C104 148, 54 134, 58 94 C18 82, 20 42, 62 28Z" fill={palette.bronzeLight} />
        <circle cx="78" cy="76" r="44" fill={palette.tealLight} />
        <circle cx="118" cy="74" r="34" fill={palette.bronze} />
      </svg>

      <svg className="absolute -right-8 bottom-12 h-36 w-80 opacity-[0.09]" viewBox="0 0 320 140">
        <rect x="20" y="44" width="250" height="46" rx="23" fill="none" stroke={palette.teal} strokeWidth="8" />
        <path d="M48 67 H244" stroke={palette.tealLight} strokeWidth="2" strokeDasharray="10 10" />
      </svg>

      <svg className="absolute -left-8 top-16 h-52 w-52 opacity-[0.09]" viewBox="0 0 210 210">
        <path d="M36 160 C52 76, 104 34, 184 28" fill="none" stroke={palette.bronze} strokeWidth="8" strokeLinecap="round" />
        {Array.from({ length: 12 }).map((_, index) => (
          <path
            key={index}
            d={`M${54 + index * 11} ${140 - index * 9} l${index % 2 === 0 ? 14 : 8} -4`}
            stroke={palette.brownDark}
            strokeWidth="2"
            strokeLinecap="round"
          />
        ))}
      </svg>

      {[
        'right-[18%] top-[18%]',
        'left-[22%] bottom-[16%]',
        'right-[9%] bottom-[34%]',
      ].map((position, index) => (
        <svg key={position} className={`absolute ${position} h-12 w-12 opacity-[0.1]`} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="15" fill="none" stroke={index === 1 ? palette.teal : palette.bronze} strokeWidth="3" />
          {Array.from({ length: 8 }).map((_, tick) => (
            <circle
              key={tick}
              cx={24 + Math.cos((Math.PI * 2 * tick) / 8) * 19}
              cy={24 + Math.sin((Math.PI * 2 * tick) / 8) * 19}
              r="2"
              fill={index === 1 ? palette.teal : palette.bronze}
            />
          ))}
        </svg>
      ))}

      <svg className="absolute right-0 top-1/2 h-[520px] w-[280px] -translate-y-1/2 opacity-[0.08]" viewBox="0 0 280 520">
        {Array.from({ length: 8 }).map((_, index) => (
          <path
            key={index}
            d={`M${48 + index * 24} 10 C ${118 + index * 8} 112, ${20 + index * 26} 214, ${112 + index * 12} 510`}
            fill="none"
            stroke={index % 2 === 0 ? palette.bronze : palette.brownDark}
            strokeWidth="2"
          />
        ))}
      </svg>
    </div>
  )
}

export function LoginPage() {
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  function handleSelect(userId: string) {
    login(userId)
    navigate('/dashboard')
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        backgroundColor: palette.cream,
        backgroundImage: 'radial-gradient(rgba(139,94,60,0.18) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
        color: palette.brownDark,
        fontFamily: 'Outfit, sans-serif',
      }}
    >
      <style>
        {`
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes navDrop {
            from { opacity: 0; transform: translateY(-12px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .login-nav-entrance {
            animation: navDrop 0.55s ease-out both;
          }

          .workspace-card {
            animation: fadeSlideUp 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) both;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          .workspace-card:hover {
            transform: translateY(-6px);
            border-color: #8B5E3C;
            box-shadow: 0 16px 44px rgba(139, 94, 60, 0.16);
          }

          .workspace-card:hover .workspace-arrow {
            transform: scale(1.1);
            background: #2A7B6E;
          }
        `}
      </style>

      <DecorativeLayer />

      <nav
        className="login-nav-entrance sticky top-0 z-20 border-b px-5 py-4 backdrop-blur-md"
        style={{
          backgroundColor: 'rgba(245,240,232,0.85)',
          borderColor: 'rgba(139,94,60,0.12)',
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgba(139,94,60,0.12)', color: palette.bronze }}
            >
              <Hammer className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold sm:text-base" style={{ color: palette.brownDark }}>
                SR Plywood &amp; Glasses
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em]" style={{ color: palette.muted }}>
                MELPURAM
              </p>
            </div>
          </div>

          <div
            className="flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium"
            style={{
              borderColor: 'rgba(42,123,110,0.35)',
              backgroundColor: 'rgba(255,255,255,0.42)',
              color: palette.teal,
            }}
          >
            <ShieldCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Secured workspace</span>
            <span className="sm:hidden">Secured</span>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-5 pb-12 pt-16 sm:pt-20">
        <div className="text-center">
          <div
            className="mx-auto inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium"
            style={{
              borderColor: palette.border,
              backgroundColor: 'rgba(255,255,255,0.42)',
              color: palette.bronze,
            }}
          >
            ✦ Welcome back
          </div>

          <h1
            className="mt-6 max-w-3xl text-[36px] leading-[1.04] sm:text-[56px]"
            style={{ fontFamily: '"DM Serif Display", serif', color: palette.brownDark }}
          >
            Choose your{' '}
            <span className="italic" style={{ color: palette.bronze }}>
              workspace
            </span>
            <br />
            to start billing.
          </h1>

          <p
            className="mx-auto mt-5 max-w-[480px] text-base leading-7"
            style={{ color: palette.muted }}
          >
            Manage inventory, invoices, godowns, and daily sales across plywood, glass,
            paint, plumbing, and hardware — all in one premium dashboard.
          </p>
        </div>

        <div className="mt-12 grid w-full max-w-[960px] grid-cols-1 gap-6 md:grid-cols-3">
          {MOCK_USERS.map((user, index) => {
            const card = getCard(user)

            return (
              <button
                key={user.id}
                type="button"
                onClick={() => handleSelect(user.id)}
                className="workspace-card group cursor-pointer rounded-[20px] border p-7 text-left backdrop-blur-xl"
                style={{
                  animationDelay: `${index * 100}ms`,
                  backgroundColor: 'rgba(255,255,255,0.6)',
                  borderColor: palette.border,
                  boxShadow: '0 4px 24px rgba(139,94,60,0.08)',
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className="flex h-[52px] w-[52px] items-center justify-center rounded-full text-base font-semibold text-white shadow-sm"
                    style={{ background: card.gradient }}
                  >
                    {card.initials}
                  </div>
                  <span
                    className="rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
                    style={{
                      borderColor: palette.border,
                      backgroundColor: 'rgba(245,240,232,0.82)',
                      color: palette.bronze,
                    }}
                  >
                    {card.badge}
                  </span>
                </div>

                <div className="mt-7">
                  <p
                    className="text-[22px] leading-none"
                    style={{ fontFamily: '"DM Serif Display", serif', color: palette.brownDark }}
                  >
                    {user.name}
                  </p>
                  <p
                    className="mt-2 text-[13px] font-semibold uppercase tracking-[0.2em]"
                    style={{ color: palette.teal }}
                  >
                    {card.role}
                  </p>
                  <p className="mt-2 text-sm leading-6" style={{ color: palette.muted }}>
                    {card.description}
                  </p>
                </div>

                <div className="my-4 border-t border-dashed" style={{ borderColor: 'rgba(139,94,60,0.2)' }} />

                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: palette.muted }}>
                    Tap to sign in
                  </span>
                  <span
                    className="workspace-arrow flex h-10 w-10 items-center justify-center rounded-full text-white transition-transform"
                    style={{ backgroundColor: palette.bronze }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </main>

      <footer className="relative z-10 pb-8 text-center text-xs" style={{ color: palette.muted }}>
        <span className="inline-flex items-center gap-2">
          <Power className="h-3.5 w-3.5" />
          © 2026 SR Plywood &amp; Glasses · Crafted for daily business use
        </span>
      </footer>
    </div>
  )
}
