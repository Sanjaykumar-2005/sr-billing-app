import * as React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { format, isSameDay } from 'date-fns'
import { toast } from 'sonner'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Package,
  PackagePlus,
  Receipt,
  TrendingUp,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { WeeklyBarChart } from '@/components/reports/WeeklyBarChart'
import { SECTIONS } from '@/lib/constants'
import {
  getBillFinalAmount,
  getBillStatus,
  selectCollectionStats,
  selectCurrentMonthBills,
  selectFulfilmentStats,
  selectWeeklyRevenue,
} from '@/lib/reportSelectors'
import { useBillingStore } from '@/store/billingStore'
import { useInventoryStore } from '@/store/inventoryStore'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import { SECTION_ACCESS, type Product } from '@/types'

// ─── Formatters / helpers ─────────────────────────────────────────────────────

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
})
const NUM = new Intl.NumberFormat('en-IN')

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// ─── Micro-components ─────────────────────────────────────────────────────────

function KpiCard({
  label, value, icon, sub,
}: {
  label: string; value: string; icon: React.ReactNode; sub?: string
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
              {label}
            </p>
            <p className="text-2xl font-semibold font-mono tabular-nums truncate">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1 truncate">{sub}</p>}
          </div>
          <div className="text-muted-foreground shrink-0 mt-0.5">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatBar({
  label, pct, caption,
}: {
  label: string; pct: number; caption?: string
}) {
  const clamped = Math.min(100, Math.max(0, pct))
  const color =
    clamped >= 75 ? 'bg-emerald-500'
    : clamped >= 50 ? 'bg-amber-500'
    : 'bg-destructive'
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-medium tabular-nums">{Math.round(clamped)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {caption && <p className="text-[10px] text-muted-foreground">{caption}</p>}
    </div>
  )
}

function StatusBadge({ status }: { status: 'paid' | 'partial' | 'pending' }) {
  if (status === 'paid')
    return (
      <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 text-[10px]">
        Paid
      </Badge>
    )
  if (status === 'partial')
    return (
      <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/30 text-[10px]">
        Partial
      </Badge>
    )
  return (
    <Badge variant="outline" className="text-muted-foreground text-[10px]">Pending</Badge>
  )
}

function LowStockPanel({
  products, showSection = false, limit = 8,
}: {
  products: Product[]; showSection?: boolean; limit?: number
}) {
  const sorted = [...products]
    .sort((a, b) => a.stock / a.lowStockThreshold - b.stock / b.lowStockThreshold)
    .slice(0, limit)

  if (sorted.length === 0)
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border px-6 py-8 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <p className="mt-3 text-sm font-medium text-foreground">All stock healthy</p>
        <p className="mt-1 text-sm text-muted-foreground">Nothing needs restocking right now.</p>
      </div>
    )

  return (
    <div className="space-y-3">
      {sorted.map((p) => {
        const sectionLabel = SECTIONS.find((s) => s.key === p.section)?.label ?? p.section
        const pct = p.lowStockThreshold > 0 ? (p.stock / p.lowStockThreshold) * 100 : 100
        return (
          <div key={p.id} className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm truncate">{p.name}</span>
                {showSection && (
                  <Badge variant="secondary" className="text-[10px] shrink-0">{sectionLabel}</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full', pct <= 50 ? 'bg-destructive' : 'bg-amber-500')}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
                <span className="font-mono text-[10px] text-muted-foreground whitespace-nowrap tabular-nums">
                  {p.stock} / {p.lowStockThreshold} {p.unit}
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="shrink-0 h-7 px-2 text-xs" asChild>
              <Link to="/purchases/new">
                <PackagePlus className="h-3 w-3 mr-1" />
                Restock
              </Link>
            </Button>
          </div>
        )
      })}
    </div>
  )
}

// ─── Weekly bar chart (admin) ─────────────────────────────────────────────────

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

function AdminDashboard({ name }: { name: string }) {
  const bills    = useBillingStore((s) => s.bills)
  const products = useInventoryStore((s) => s.products)
  const today    = new Date()

  // ── KPIs ──
  const todayBills   = bills.filter((b) => isSameDay(new Date(b.date), today))
  const todayRevenue = todayBills.reduce((sum, b) => sum + getBillFinalAmount(b), 0)
  const totalStock   = products.reduce((sum, p) => sum + p.stock, 0)
  const collectionStats = selectCollectionStats(bills)
  const outstanding  = bills.filter((b) => getBillStatus(b) !== 'paid')
  const pendingTotal = collectionStats.pending

  // ── Weekly chart ──
  const weekDays = selectWeeklyRevenue(bills, today)
  const weeklyTotal = weekDays.reduce((sum, d) => sum + d.revenue, 0)
  const avgPerDay   = weeklyTotal / 7

  // ── Monthly revenue ──
  const monthlyRevenue = selectCurrentMonthBills(bills, today)
    .reduce((sum, b) => sum + getBillFinalAmount(b), 0)

  // ── Quick stats ──
  const fulfilmentStats = selectFulfilmentStats(bills)
  const healthy    = products.filter((p) => p.stock > p.lowStockThreshold).length
  const stockRate  = products.length > 0 ? (healthy / products.length) * 100 : 0

  // ── Tables ──
  const recentBills    = [...bills].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10)
  const lowStockProds  = products.filter((p) => p.stock <= p.lowStockThreshold)

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-medium">{greeting()}, {name.split(' ')[0]}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {format(today, 'EEEE, d MMMM yyyy')} · Admin overview
        </p>
      </div>

      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="Today's Revenue"
          value={INR.format(todayRevenue)}
          icon={<TrendingUp size={18} />}
          sub={`${todayBills.length} bill${todayBills.length !== 1 ? 's' : ''} today`}
        />
        <KpiCard
          label="Bills Today"
          value={String(todayBills.length)}
          icon={<Receipt size={18} />}
          sub="all sections"
        />
        <KpiCard
          label="Items in Stock"
          value={NUM.format(totalStock)}
          icon={<Package size={18} />}
          sub={`${products.length} products`}
        />
        <KpiCard
          label="Pending Payments"
          value={INR.format(pendingTotal)}
          icon={<AlertTriangle size={18} />}
          sub={`${outstanding.length} bill${outstanding.length !== 1 ? 's' : ''} outstanding`}
        />
      </div>

      {/* ── Chart + stats row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Weekly Revenue — spans 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Weekly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyBarChart days={weekDays} />
            <Separator className="my-4" />
            <div className="flex gap-8 text-xs">
              <div>
                <p className="text-muted-foreground">Weekly total</p>
                <p className="font-mono font-semibold tabular-nums mt-0.5 text-base">
                  {INR.format(weeklyTotal)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg / day</p>
                <p className="font-mono font-semibold tabular-nums mt-0.5 text-base">
                  {INR.format(Math.round(avgPerDay))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right column: Quick Stats + Monthly Revenue */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <StatBar
                label="Collection Rate"
                pct={collectionStats.collectionRate}
                caption={`${INR.format(collectionStats.paid)} collected of ${INR.format(collectionStats.total)}`}
              />
              <StatBar
                label="Bill Fulfillment"
                pct={fulfilmentStats.fulfilmentRate}
                caption={`${fulfilmentStats.fulfilledBills} of ${fulfilmentStats.totalBills} bills fully paid`}
              />
              <StatBar
                label="Stock Health"
                pct={stockRate}
                caption={`${healthy} of ${products.length} products above threshold`}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-mono font-semibold tabular-nums">
                {INR.format(monthlyRevenue)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {format(today, 'MMMM yyyy')} · month to date
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Recent Bills + Low Stock ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Recent Bills</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs h-7" asChild>
              <Link to="/billing">
                All bills <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Bill #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead className="text-right pr-6">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBills.map((bill) => {
                  const sLabel   = SECTIONS.find((s) => s.key === bill.section)?.label ?? bill.section
                  const finalAmt = getBillFinalAmount(bill)
                  return (
                    <TableRow key={bill.id}>
                      <TableCell className="pl-6">
                        <Link to={`/billing/${bill.id}`} className="font-mono text-xs hover:underline">
                          {bill.billNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm max-w-[130px] truncate">
                        {bill.customerName ?? (
                          <span className="text-muted-foreground italic">Walk-in</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{sLabel}</Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6 font-mono tabular-nums text-xs">
                        {INR.format(finalAmt)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              Low Stock
              {lowStockProds.length > 0 && (
                <Badge variant="destructive" className="text-[10px]">{lowStockProds.length}</Badge>
              )}
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs h-7" asChild>
              <Link to="/inventory">
                Inventory <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <LowStockPanel products={lowStockProds} showSection limit={8} />
          </CardContent>
        </Card>

      </div>
    </div>
  )
}

// ─── Billing Dashboard (A & B) ────────────────────────────────────────────────

function BillingDashboard({
  name, userId, role,
}: {
  name: string
  userId: string
  role: 'billing_a' | 'billing_b'
}) {
  const bills    = useBillingStore((s) => s.bills)
  const products = useInventoryStore((s) => s.products)
  const today    = new Date()

  const allowedSections = SECTION_ACCESS[role]
  const sectionNames    = allowedSections
    .map((s) => SECTIONS.find((x) => x.key === s)?.label ?? s)
    .join(' & ')

  // Products scoped to my sections
  const myProducts     = products.filter((p) => allowedSections.includes(p.section))
  const myTotalStock   = myProducts.reduce((sum, p) => sum + p.stock, 0)
  const myLowStock     = myProducts.filter((p) => p.stock <= p.lowStockThreshold)

  // Bills
  const myTodayBills = bills.filter(
    (b) => b.createdBy === userId && isSameDay(new Date(b.date), today),
  )
  const myAllBills   = bills.filter((b) => b.createdBy === userId)
  const myFulfilment = selectFulfilmentStats(myAllBills)

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-medium">{greeting()}, {name.split(' ')[0]}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {format(today, 'EEEE, d MMMM yyyy')} · {sectionNames}
        </p>
      </div>

      {/* ── KPI row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="My Bills Today"
          value={String(myTodayBills.length)}
          icon={<Receipt size={18} />}
          sub={myTodayBills.length === 0 ? 'none yet today' : `created by you`}
        />
        <KpiCard
          label="Items in Stock"
          value={NUM.format(myTotalStock)}
          icon={<Package size={18} />}
          sub={`${myProducts.length} products · ${sectionNames}`}
        />
        <KpiCard
          label="Low-Stock Alerts"
          value={String(myLowStock.length)}
          icon={<AlertTriangle size={18} />}
          sub={myLowStock.length === 0 ? 'all clear' : 'items need restock'}
        />
      </div>

      {/* ── Today's Bills + Right column ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Today's Bills */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Today's Bills</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs h-7" asChild>
              <Link to="/billing">
                All bills <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className={myTodayBills.length === 0 ? undefined : 'px-0 pb-0'}>
            {myTodayBills.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No bills created today.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Bill #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead className="pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myTodayBills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="pl-6">
                        <Link to={`/billing/${bill.id}`} className="font-mono text-xs hover:underline">
                          {bill.billNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm max-w-[120px] truncate">
                        {bill.customerName ?? (
                          <span className="text-muted-foreground italic">Walk-in</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs tabular-nums">
                        {bill.items.length}
                      </TableCell>
                      <TableCell className="pr-6">
                        <StatusBadge status={getBillStatus(bill)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Right column: Bill Fulfillment + Low Stock */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Bill Fulfillment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {myAllBills.length === 0 ? (
                <p className="text-sm text-muted-foreground">No bills created yet.</p>
              ) : (
                <>
                  <StatBar
                    label="Fulfilled"
                    pct={myFulfilment.fulfilmentRate}
                    caption={`${myFulfilment.fulfilledBills} of ${myFulfilment.totalBills} bills fully paid (${Math.round(myFulfilment.fulfilmentRate)}%)`}
                  />
                  <div className="flex gap-5 text-xs pt-1">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                      <span className="text-muted-foreground">
                        {myFulfilment.fulfilledBills} fulfilled
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle size={12} className="text-amber-500 shrink-0" />
                      <span className="text-muted-foreground">
                        {myFulfilment.pendingBills} pending / unpaid
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {myLowStock.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  Low Stock
                  <Badge variant="destructive" className="text-[10px]">{myLowStock.length}</Badge>
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs h-7" asChild>
                  <Link to="/inventory">
                    View <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <LowStockPanel products={myLowStock} showSection={false} limit={6} />
              </CardContent>
            </Card>
          )}
        </div>

      </div>
    </div>
  )
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export function DashboardPage() {
  const currentUser = useAuthStore((s) => s.currentUser)!
  const location    = useLocation()
  const navigate    = useNavigate()

  React.useEffect(() => {
    if (location.state?.denied) {
      toast.error("You don't have access to that page")
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, location.state, navigate])

  if (currentUser.role === 'admin') {
    return <AdminDashboard name={currentUser.name} />
  }
  return (
    <BillingDashboard
      name={currentUser.name}
      userId={currentUser.id}
      role={currentUser.role}
    />
  )
}
