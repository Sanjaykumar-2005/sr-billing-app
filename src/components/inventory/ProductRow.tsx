import { formatDistanceToNow } from 'date-fns'

import { cn } from '@/lib/utils'
import type { Product } from '@/types'

interface ProductRowProps {
  product: Product
}

export function ProductRow({ product }: ProductRowProps) {
  const isLowStock = product.stock <= product.lowStockThreshold
  const updatedAgo = formatDistanceToNow(new Date(product.updatedAt), { addSuffix: true })

  return (
    <div
      className={cn(
        'flex items-center py-3 border-b border-border last:border-0',
        isLowStock && 'border-l-2 border-l-[#EF5350]/50 pl-3 -ml-3'
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate text-foreground">{product.name}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">Updated {updatedAgo}</p>
      </div>
      <div className="text-right shrink-0 ml-4">
        <p
          className={cn(
            'font-mono tabular-nums text-base font-medium',
            isLowStock ? 'text-[#EF5350]' : 'text-foreground'
          )}
        >
          {product.stock}
        </p>
        <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">
          {product.unit}
        </p>
      </div>
    </div>
  )
}
