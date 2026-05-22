import { Download, TrendingDown, TrendingUp } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { exportCsv } from '@/lib/exportCsv'
import { getYearlyData } from '@/lib/reportSelectors'
import { useBillingStore } from '@/store/billingStore'

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

function axisMoney(value: number) {
  return `₹${Math.round(value / 1000)}k`
}

interface YearlyTooltipRow {
  monthName: string
  billCount: number
  revenue: number
}

function YearlyTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload?: YearlyTooltipRow }>
}) {
  const row = payload?.[0]?.payload
  if (!active || !row) return null

  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-popover-foreground shadow-md">
      <p className="text-xs font-medium">{row.monthName}</p>
      <p className="mt-1 font-mono text-sm tabular-nums">{INR.format(row.revenue)}</p>
      <p className="text-xs text-muted-foreground">{row.billCount} bill{row.billCount === 1 ? '' : 's'}</p>
    </div>
  )
}

export function YearlyReportPage() {
  const bills = useBillingStore((state) => state.bills)
  const year = new Date().getFullYear()
  const data = getYearlyData(bills, year)

  function exportYearlyCsv() {
    exportCsv(
      `yearly-report-${year}.csv`,
      ['Month', 'Bills', 'Revenue', 'Avg Bill Value'],
      data.months.map((month) => [
        month.monthName,
        month.billCount,
        month.revenue,
        Math.round(month.avgBillValue),
      ])
    )
    toast.success('Yearly report exported')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium">Yearly Report</h1>
          <p className="mt-1 text-sm text-muted-foreground">{year}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={exportYearlyCsv}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Total Revenue</p>
            <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">{INR.format(data.totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Total Bills</p>
            <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">{data.totalBills}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Avg Monthly Revenue</p>
            <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">{INR.format(data.avgMonthlyRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Best Month</p>
            <p className="mt-2 text-2xl font-semibold">{data.bestMonth.monthName}</p>
            <p className="font-mono text-xs text-muted-foreground">{INR.format(data.bestMonth.revenue)}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border border-border bg-card">
        <CardHeader className="p-5 pb-2">
          <CardTitle className="text-base">Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.months}>
                <defs>
                  <linearGradient id="yearlyAreaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4A90D9" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#4A90D9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                <YAxis tickFormatter={axisMoney} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<YearlyTooltip />} cursor={{ stroke: 'hsl(var(--border))' }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4A90D9"
                  strokeWidth={2.5}
                  fill="url(#yearlyAreaFill)"
                  dot={{ r: 4, fill: '#4A90D9', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#4A90D9', strokeWidth: 2, stroke: '#fff' }}
                  isAnimationActive
                  animationDuration={600}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Month</TableHead>
                  <TableHead className="text-right">Bills</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="pr-6 text-right">Growth</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.months.map((month) => {
                  const growth = month.growthPct ?? 0
                  const roundedGrowth = Math.round(growth)
                  const isFlat = roundedGrowth === 0
                  const isUp = growth > 0
                  return (
                    <TableRow key={month.month}>
                      <TableCell className="pl-6">{month.monthName}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{month.billCount}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{INR.format(month.revenue)}</TableCell>
                      <TableCell className="pr-6 text-right">
                        {isFlat ? (
                          <span className="font-mono tabular-nums text-muted-foreground">—</span>
                        ) : (
                          <span className={isUp ? 'inline-flex items-center justify-end gap-1 text-primary' : 'inline-flex items-center justify-end gap-1 text-destructive'}>
                            {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            <span className="font-mono tabular-nums">{Math.abs(roundedGrowth)}%</span>
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Section Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.sectionBreakdown.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No section revenue yet.</p>
            ) : (
              data.sectionBreakdown.map((row) => (
                <div key={row.section} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span>{row.sectionLabel}</span>
                    <span className="font-mono tabular-nums text-muted-foreground">{INR.format(row.revenue)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${row.barPct}%` }} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
