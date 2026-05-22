import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { BillingRole, SectionType } from '@/types'

export interface Counter {
  id: string
  name: string
  initials: string
  label: string
  role: BillingRole
  process: SectionType[]
  avatarColor: string
  active: boolean
}

type CounterInput = {
  name: string
  label: string
  process: SectionType[]
  active: boolean
}

const AVATAR_COLORS = ['deep', 'mint', 'leaf', 'forest', 'highlight', 'charcoal']

const SEED_COUNTERS: Counter[] = [
  {
    id: 'billing_a',
    name: 'Karthikeyan S.',
    initials: 'KS',
    label: 'COUNTER 1',
    role: 'billing_a',
    process: ['Glass', 'Plywood'],
    avatarColor: 'deep',
    active: true,
  },
  {
    id: 'billing_b',
    name: 'Meenakshi R.',
    initials: 'MR',
    label: 'COUNTER 2',
    role: 'billing_b',
    process: ['Plumbing', 'Painting', 'Electrical'],
    avatarColor: 'mint',
    active: true,
  },
  {
    id: 'billing_c',
    name: 'Rajan M.',
    initials: 'RM',
    label: 'COUNTER 3',
    role: 'billing_c',
    process: ['Glass', 'Plywood'],
    avatarColor: 'leaf',
    active: true,
  },
  {
    id: 'billing_d',
    name: 'Priya K.',
    initials: 'PK',
    label: 'COUNTER 4',
    role: 'billing_d',
    process: ['Plumbing', 'Painting', 'Electrical'],
    avatarColor: 'forest',
    active: true,
  },
  {
    id: 'billing_e',
    name: 'Selvam T.',
    initials: 'ST',
    label: 'COUNTER 5',
    role: 'billing_e',
    process: ['Glass', 'Plywood'],
    avatarColor: 'highlight',
    active: true,
  },
]

function initialsFromName(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function createCounterId() {
  return `billing_${crypto.randomUUID().replaceAll('-', '').slice(0, 4)}` as BillingRole
}

interface CounterState {
  counters: Counter[]
  addCounter: (data: CounterInput) => Counter
  updateCounter: (id: string, data: CounterInput) => void
  deleteCounter: (id: string) => void
  reorderCounters: (ids: string[]) => void
}

export const useCounterStore = create<CounterState>()(
  persist(
    (set, get) => ({
      counters: SEED_COUNTERS,

      addCounter: (data) => {
        const id = createCounterId()
        const counter: Counter = {
          id,
          name: data.name,
          initials: initialsFromName(data.name),
          label: data.label,
          role: id,
          process: data.process,
          avatarColor: AVATAR_COLORS[get().counters.length % AVATAR_COLORS.length],
          active: data.active,
        }

        set((state) => ({ counters: [...state.counters, counter] }))
        return counter
      },

      updateCounter: (id, data) =>
        set((state) => ({
          counters: state.counters.map((counter) =>
            counter.id === id
              ? {
                  ...counter,
                  name: data.name,
                  initials: initialsFromName(data.name),
                  label: data.label,
                  process: data.process,
                  active: data.active,
                }
              : counter
          ),
        })),

      deleteCounter: (id) =>
        set((state) => ({
          counters: state.counters.map((counter) =>
            counter.id === id ? { ...counter, active: false } : counter
          ),
        })),

      reorderCounters: (ids) =>
        set((state) => {
          const byId = new Map(state.counters.map((counter) => [counter.id, counter]))
          return {
            counters: [
              ...ids.map((id) => byId.get(id)).filter((counter): counter is Counter => Boolean(counter)),
              ...state.counters.filter((counter) => !ids.includes(counter.id)),
            ],
          }
        }),
    }),
    {
      name: 'billing-app-counters',
      version: 1,
      migrate: () => ({ counters: SEED_COUNTERS }),
    }
  )
)
