import { PackageSearch } from 'lucide-react'

import { EmptyState } from '@/components/EmptyState'
import { api } from '@/lib/api'
import { GodownCard } from '@/components/inventory/GodownCard'
import { SECTIONS } from '@/lib/constants'
import type { Godown, Section } from '@/types'

interface GodownGridProps {
  section: Section
  onGodownClick: (godown: Godown) => void
}

export function GodownGrid({ section, onGodownClick }: GodownGridProps) {
  const godowns = api.inventory.godownsForSection(section)
  const sectionLabel = SECTIONS.find((item) => item.key === section)?.label ?? section

  if (godowns.length === 0) {
    return (
      <div className="mt-6">
        <EmptyState
          icon={PackageSearch}
          title={`No ${sectionLabel} products`}
          message="Products in this section will be grouped by godown once stock exists."
        />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {godowns.map((godown) => (
        <GodownCard
          key={godown.id}
          godown={godown}
          section={section}
          onClick={onGodownClick}
        />
      ))}
    </div>
  )
}
