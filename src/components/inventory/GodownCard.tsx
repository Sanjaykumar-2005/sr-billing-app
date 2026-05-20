import { api } from '@/lib/api'
import type { Godown, Section } from '@/types'

interface GodownCardProps {
  godown: Godown
  section: Section
  onClick: (godown: Godown) => void
}

export function GodownCard({ godown, section, onClick }: GodownCardProps) {
  const products = api.inventory.listByGodown(godown.id, section)
  const productCount = products.length
  const lowStockCount = products.filter((p) => p.stock <= p.lowStockThreshold).length

  return (
    <div
      className="rounded-md border border-border bg-card p-5 hover:bg-muted/40 transition-colors cursor-pointer"
      onClick={() => onClick(godown)}
    >
      <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        {godown.name}
      </p>
      <p className="font-mono text-3xl tabular-nums font-medium mt-2">
        {productCount}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">products</p>
      {lowStockCount > 0 && (
        <div className="flex items-center gap-1.5 mt-3">
          <span className="bg-amber-500/70 w-1.5 h-1.5 rounded-full" />
          <span className="text-xs text-amber-700 dark:text-amber-500">
            {lowStockCount} low stock
          </span>
        </div>
      )}
    </div>
  )
}
