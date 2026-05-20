import { Link, useNavigate } from 'react-router-dom'
import * as React from 'react'
import { ClipboardList, Plus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/EmptyState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { GODOWNS_SEED, SECTIONS } from '@/lib/constants'
import { useAuthStore } from '@/store/authStore'
import { usePurchaseStore } from '@/store/purchaseStore'
import { SECTION_ACCESS } from '@/types'

const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function PurchaseListPage() {
  const navigate = useNavigate()
  const currentUser = useAuthStore((state) => state.currentUser)!
  const purchases = usePurchaseStore((state) => state.purchases)
  const accessibleSections = SECTION_ACCESS[currentUser.role]

  const sortedPurchases = React.useMemo(
    () =>
      purchases
        .filter((purchase) => accessibleSections.includes(purchase.section))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [accessibleSections, purchases]
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Purchases</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Purchase stock is applied only after printing.
          </p>
        </div>
        <Button asChild>
          <Link to="/purchases/new">
            <Plus className="mr-2 h-4 w-4" />
            New purchase
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Purchase vouchers</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedPurchases.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No purchases yet"
              message="Saved purchase vouchers will appear here before stock is applied."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Godown</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPurchases.map((purchase) => {
                const sectionLabel = SECTIONS.find((section) => section.key === purchase.section)?.label ?? purchase.section
                const godownLabel = GODOWNS_SEED.find((godown) => godown.id === purchase.godownId)?.name ?? purchase.godownId

                return (
                  <TableRow
                    key={purchase.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/purchases/${purchase.id}`)}
                  >
                    <TableCell className="font-medium">{purchase.vendorName}</TableCell>
                    <TableCell>{formatDate(purchase.date)}</TableCell>
                    <TableCell>{sectionLabel}</TableCell>
                    <TableCell>{godownLabel}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {purchase.items.length}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {INR.format(purchase.total)}
                    </TableCell>
                    <TableCell>
                      {purchase.printedAt ? (
                        <Badge
                          variant="secondary"
                          className="bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200"
                        >
                          Applied {formatDate(purchase.printedAt)}
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                        >
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
