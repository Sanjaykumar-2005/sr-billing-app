import { PackageSearch } from 'lucide-react'

import { EmptyState } from '@/components/EmptyState'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { ProductRow } from '@/components/inventory/ProductRow'
import { api } from '@/lib/api'
import { SECTIONS } from '@/lib/constants'
import type { Godown, Section } from '@/types'

interface GodownDetailSheetProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  godown: Godown | null
  section: Section | null
}

export function GodownDetailSheet({
  open,
  onOpenChange,
  godown,
  section,
}: GodownDetailSheetProps) {
  const products = godown && section ? api.inventory.listByGodown(godown.id, section) : []
  const sectionLabel = section ? (SECTIONS.find((s) => s.key === section)?.label ?? section) : ''

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg w-full flex flex-col">
        <SheetTitle className="sr-only">
          {godown?.name} — {sectionLabel}
        </SheetTitle>

        {/* Visible header */}
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {godown?.name}
          </p>
          <p className="text-xl font-medium text-foreground mt-1">{sectionLabel}</p>
          <p className="text-sm text-muted-foreground mt-1">{products.length} products</p>
        </div>

        {/* Scrollable product list */}
        <div className="flex-1 overflow-y-auto -mx-6 px-6 mt-4 border-t border-border">
          {products.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No products here"
              message="This godown has no products for the selected section."
              className="mt-6"
            />
          ) : (
            products.map((product) => (
              <ProductRow key={product.id} product={product} />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-border text-[11px] text-muted-foreground">
          Stock changes via purchase and sales bills only
        </div>
      </SheetContent>
    </Sheet>
  )
}
