import { Link } from 'react-router-dom'
import { Download, FilePlus, ReceiptText } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/EmptyState'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from '@/lib/api'
import { MOCK_USERS, SECTIONS } from '@/lib/constants'
import { exportCsv } from '@/lib/exportCsv'
import { useAuthStore } from '@/store/authStore'
import { SECTION_ACCESS } from '@/types'

const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function csvDate(iso?: string) {
  return iso ? new Date(iso).toISOString().slice(0, 10) : ''
}

export function BillHistoryPage() {
  const currentUser = useAuthStore((s) => s.currentUser)!
  const allowedSections = SECTION_ACCESS[currentUser.role]
  const bills = api.bills.list({ sections: allowedSections })
  const sorted = [...bills].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const canCreate = ['admin', 'billing_a', 'billing_b'].includes(currentUser.role)

  function exportBills() {
    exportCsv(
      'bills.csv',
      ['Bill#', 'Customer', 'Address', 'Items', 'Sq/-', 'Amount', 'Date', 'Delivery', 'Staff', 'Status'],
      sorted.map((bill) => {
        const staff = MOCK_USERS.find((user) => user.id === bill.createdBy)
        const sqFt = bill.items.reduce((sum, item) => sum + (Number(item.sqFt) || 0), 0)
        const amount = bill.total - bill.discount

        return [
          bill.billNumber,
          bill.customerName || bill.customerPhone,
          bill.customerAddress ?? '',
          bill.items.length,
          sqFt,
          amount,
          csvDate(bill.date),
          csvDate(bill.deliveryDate),
          staff?.name ?? bill.createdBy,
          bill.status,
        ]
      })
    )
    toast.success('Bills exported')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-medium">Bills</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {sorted.length} bill{sorted.length !== 1 ? 's' : ''} in your sections
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={exportBills}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {canCreate && (
            <Button asChild size="sm">
              <Link to="/billing/new">
                <FilePlus className="h-4 w-4 mr-2" />
                New bill
              </Link>
            </Button>
          )}
        </div>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="No bills found"
          message="Bills in your accessible sections will appear here after they are saved."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Section</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((bill) => {
              const sectionLabel = SECTIONS.find((s) => s.key === bill.section)?.label ?? bill.section
              return (
                <TableRow key={bill.id}>
                  <TableCell>
                    <Link
                      to={`/billing/${bill.id}`}
                      className="font-mono text-sm hover:underline"
                    >
                      {bill.billNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(bill.date)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {bill.customerName
                      ? <span>{bill.customerName} <span className="text-muted-foreground">{bill.customerPhone}</span></span>
                      : <span className="text-muted-foreground">{bill.customerPhone}</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{sectionLabel}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-sm">
                    {INR.format(bill.total)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
