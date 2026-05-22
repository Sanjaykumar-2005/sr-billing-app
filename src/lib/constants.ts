import type { Godown, Section, User } from '@/types'

// ─── Section metadata ────────────────────────────────────────────────────────

export interface SectionMeta {
  key: Section
  label: string
  colorVar: string // CSS custom property name (without --)
}

export const SECTIONS: SectionMeta[] = [
  { key: 'glass',      label: 'Glass',      colorVar: '--section-glass' },
  { key: 'plywood',    label: 'Plywood',    colorVar: '--section-plywood' },
  { key: 'plumbing',   label: 'Plumbing',   colorVar: '--section-plumbing' },
  { key: 'painting',   label: 'Painting',   colorVar: '--section-painting' },
  { key: 'electrical', label: 'Electrical', colorVar: '--section-electrical' },
]

export const SECTION_COLORS: Record<string, string> = {
  Glass: '#4FC3F7',
  Plywood: '#FFB74D',
  Plumbing: '#81C784',
  Painting: '#F06292',
  Electrical: '#FFD54F',
}

// ─── Seed data ───────────────────────────────────────────────────────────────

export const GODOWNS_SEED: Godown[] = [
  { id: 'gd-1', name: 'Main Godown',   location: 'Ground floor, Block A' },
  { id: 'gd-2', name: 'Annexe A',      location: 'First floor, Block A' },
  { id: 'gd-3', name: 'Annexe B',      location: 'First floor, Block B' },
  { id: 'gd-4', name: 'Top Floor',     location: 'Second floor, Block A' },
  { id: 'gd-5', name: 'Outdoor Yard',  location: 'Rear compound' },
]

export const MOCK_USERS: User[] = [
  {
    id: 'u-3',
    name: 'Subramaniam V.',
    email: 'subbu@hardwareco.in',
    role: 'admin',
    createdAt: '2023-06-01T09:00:00.000Z',
  },
]
