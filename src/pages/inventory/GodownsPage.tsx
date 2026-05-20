import * as React from 'react'
import { PackageSearch, Warehouse } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/EmptyState'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { GODOWNS_SEED, SECTIONS } from '@/lib/constants'
import { useAuthStore } from '@/store/authStore'
import { useInventoryStore } from '@/store/inventoryStore'
import { SECTION_ACCESS, type Product, type Section } from '@/types'
import { cn } from '@/lib/utils'

function sectionLabel(section: Section) {
  return SECTIONS.find((item) => item.key === section)?.label ?? section
}

function isLowStock(product: Product) {
  return product.stock <= product.lowStockThreshold
}

export function GodownsPage() {
  const currentUser = useAuthStore((state) => state.currentUser)!
  const products = useInventoryStore((state) => state.products)
  const allowedSections = SECTION_ACCESS[currentUser.role]
  const [selectedGodownId, setSelectedGodownId] = React.useState(GODOWNS_SEED[0]?.id ?? '')

  const selectedGodown = GODOWNS_SEED.find((godown) => godown.id === selectedGodownId) ?? GODOWNS_SEED[0]
  const accessibleProducts = products.filter((product) => allowedSections.includes(product.section))
  const visibleProducts = accessibleProducts
    .filter((product) => product.godownId === selectedGodownId)
    .sort((a, b) => a.section.localeCompare(b.section) || a.name.localeCompare(b.name))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium">Godowns</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Godown-wise stock across your accessible product types.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="space-y-3">
          {GODOWNS_SEED.map((godown) => {
            const godownProducts = accessibleProducts.filter((product) => product.godownId === godown.id)
            const lowCount = godownProducts.filter(isLowStock).length
            const isSelected = godown.id === selectedGodownId

            return (
              <button
                key={godown.id}
                type="button"
                onClick={() => setSelectedGodownId(godown.id)}
                className={cn(
                  'w-full rounded-md border border-border bg-card p-4 text-left transition-colors hover:bg-muted/50',
                  isSelected && 'border-primary'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{godown.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{godown.location}</p>
                  </div>
                  <Warehouse className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{godownProducts.length} products</span>
                  {lowCount > 0 && <Badge variant="destructive">{lowCount} low</Badge>}
                </div>
              </button>
            )
          })}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base">{selectedGodown?.name}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">{selectedGodown?.location}</p>
              </div>
              <Badge variant="outline">{visibleProducts.length} items</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {visibleProducts.length === 0 ? (
              <EmptyState
                icon={PackageSearch}
                title="No products in this godown"
                message="Accessible stock for this godown will appear here once products are assigned."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="font-medium">{product.name}</div>
                        {product.spec && <div className="text-xs text-muted-foreground">{product.spec}</div>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{sectionLabel(product.section)}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{product.sku}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {product.stock} {product.unit}
                      </TableCell>
                      <TableCell>
                        {isLowStock(product) ? (
                          <Badge variant="destructive">Low stock</Badge>
                        ) : (
                          <Badge variant="secondary">OK</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
