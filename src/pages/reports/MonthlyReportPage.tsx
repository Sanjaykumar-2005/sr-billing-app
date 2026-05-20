import { Download } from 'lucide-react'
import { format } from 'date-fns'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { exportCsv } from '@/lib/exportCsv'
import {
  selectBillsForMonth,
  selectCollectionStats,
  selectFulfilmentStats,
  selectSectionBreakdown,
  selectStatusBreakdown,
} from '@/lib/reportSelectors'
import { useBillingStore } from '@/store/billingStore'

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

function monthFromValue(value: string) {
  return new Date(`${value}-01T00:00:00`)
}

export function MonthlyReportPage() {
  const bills = useBillingStore((state) => state.bills)
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))
  const monthDate = monthFromValue(selectedMonth)
  const monthBills = selectBillsForMonth(bills, monthDate)
  const collection = selectCollectionStats(monthBills)
  const fulfilment = selectFulfilmentStats(monthBills)
  const sectionBreakdown = selectSectionBreakdown(monthBills)
  const statusBreakdown = selectStatusBreakdown(monthBills)

  function exportMonthlyCsv() {
    exportCsv(
      `monthly-report-${selectedMonth}.csv`,
      ['Section', 'Bills', 'Revenue', 'Collection Rate'],
      [
        ...sectionBreakdown.map((row) => [
          row.sectionLabel,
          row.billCount,
          row.revenue,
          `${Math.round(row.collectionRate)}%`,
        ]),
        ['TOTAL', monthBills.length, collection.total, `${Math.round(collection.collectionRate)}%`],
      ],
    )
    toast.success('Monthly report exported')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium">Monthly Report</h1>
          <p className="mt-1 text-sm text-muted-foreground">{format(monthDate, 'MMMM yyyy')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value || format(new Date(), 'yyyy-MM'))}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            aria-label="Report month"
          />
          <Button type="button" variant="outline" size="sm" onClick={exportMonthlyCsv}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardContent className="pt-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Revenue</p>
            <p className="mt-2 font-mono text-xl font-semibold tabular-nums">{INR.format(collection.total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Bill count</p>
            <p className="mt-2 font-mono text-xl font-semibold tabular-nums">{monthBills.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Collection</p>
            <p className="mt-2 font-mono text-xl font-semibold tabular-nums">{Math.round(collection.collectionRate)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Fulfilment</p>
            <p className="mt-2 font-mono text-xl font-semibold tabular-nums">{Math.round(fulfilment.fulfilmentRate)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Pending</p>
            <p className="mt-2 font-mono text-xl font-semibold tabular-nums">{INR.format(collection.pending)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-3">
          <h2 className="text-base font-medium">Section Breakdown</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Section</TableHead>
                <TableHead className="text-right">Bills</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">% of total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sectionBreakdown.map((row) => (
                <TableRow key={row.section}>
                  <TableCell>{row.sectionLabel}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{row.billCount}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{INR.format(row.revenue)}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{Math.round(row.percentOfTotal)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-medium">Status Breakdown</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Bills</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statusBreakdown.map((row) => (
                <TableRow key={row.status}>
                  <TableCell className="capitalize">{row.status}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{row.billCount}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{INR.format(row.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </div>
    </div>
  )
}
