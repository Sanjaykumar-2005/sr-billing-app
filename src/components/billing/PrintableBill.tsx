import { COMPANY } from '@/lib/brand'
import { amountInWords } from '@/lib/amountInWords'
import { MOCK_USERS, SECTIONS } from '@/lib/constants'
import type { SalesBill } from '@/types'

const NUM = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 })

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export function PrintableBill({ bill }: { bill: SalesBill }) {
  const finalAmount   = bill.total - bill.discount
  const balanceAmount = finalAmount - bill.paidAmount

  const staffName = MOCK_USERS.find((u) => u.id === bill.createdBy)?.name ?? bill.createdBy

  const sectionLabel = SECTIONS.find((s) => s.key === bill.section)?.label ?? bill.section

  const dateTime = new Date(bill.date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="printable-bill p-8 font-mono text-sm">

      {/* ── Header ── */}
      <div className="text-center mb-4">
        <p className="text-xl font-bold font-sans tracking-wide">{COMPANY.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{COMPANY.place}</p>
        <p className="text-xs text-muted-foreground mt-1">{dateTime}</p>
      </div>

      {/* ── Title ── */}
      <p className="text-center font-semibold underline uppercase tracking-widest text-xs mb-6">
        Glass / Plywood Estimate
      </p>

      {/* ── Meta block ── */}
      <div className="flex justify-between mb-4 text-xs gap-8">
        <div className="space-y-1 min-w-0">
          <div className="flex gap-1">
            <span className="text-muted-foreground shrink-0">Bill No :</span>
            <span className="font-medium">{bill.billNumber}</span>
          </div>
          <div className="flex gap-1">
            <span className="text-muted-foreground shrink-0">Name    :</span>
            <span>{bill.customerName ?? '—'}</span>
          </div>
          <div className="flex gap-1">
            <span className="text-muted-foreground shrink-0">Address :</span>
            <span>{bill.customerAddress ?? '—'}</span>
          </div>
          <div className="flex gap-1">
            <span className="text-muted-foreground shrink-0">Section :</span>
            <span>{sectionLabel}</span>
          </div>
        </div>
        <div className="space-y-1 text-right shrink-0">
          <div>
            <span className="text-muted-foreground">Booking Date  : </span>
            {bill.bookingDate ? fmtDate(bill.bookingDate) : '—'}
          </div>
          <div>
            <span className="text-muted-foreground">Delivery Date : </span>
            {bill.deliveryDate ? fmtDate(bill.deliveryDate) : '—'}
          </div>
          <div>
            <span className="text-muted-foreground">Transport     : </span>
            {bill.transport ?? '—'}
            {bill.transportTime ? ` / ${bill.transportTime}` : ''}
          </div>
        </div>
      </div>

      <hr className="border-border mb-4" />

      {/* ── Items table ── */}
      <table className="w-full text-xs mb-6">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-1.5 font-medium pr-2 w-6">#</th>
            <th className="text-left py-1.5 font-medium pr-2">Glass / Plywood Name</th>
            <th className="text-left py-1.5 font-medium pr-2 w-24">Glass Size</th>
            <th className="text-right py-1.5 font-medium pr-2 w-10">Qty</th>
            <th className="text-left py-1.5 font-medium pr-2 w-20">Model</th>
            <th className="text-right py-1.5 font-medium pr-2 w-16">Sq/-</th>
            <th className="text-right py-1.5 font-medium w-20">Amount Rs/-</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((item, i) => (
            <tr key={i} className="border-b border-border/40">
              <td className="py-1.5 pr-2 tabular-nums text-muted-foreground">{i + 1}</td>
              <td className="py-1.5 pr-2">{item.productName}</td>
              <td className="py-1.5 pr-2 text-muted-foreground">{item.glassSize ?? ''}</td>
              <td className="py-1.5 pr-2 text-right tabular-nums">{item.quantity}</td>
              <td className="py-1.5 pr-2 text-muted-foreground">{item.model ?? ''}</td>
              <td className="py-1.5 pr-2 text-right tabular-nums">{NUM.format(item.unitPrice)}</td>
              <td className="py-1.5 text-right tabular-nums">{NUM.format(item.subtotal)}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={6} className="py-1.5 pr-2 text-right font-semibold uppercase tracking-wider text-[10px] pt-2 border-t border-border">
              Total
            </td>
            <td className="py-1.5 text-right tabular-nums font-semibold border-t border-border">
              {NUM.format(bill.total)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── Totals stack ── */}
      <div className="flex justify-end mb-4">
        <div className="w-64 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="tabular-nums">{NUM.format(bill.total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Discount</span>
            <span className="tabular-nums">{NUM.format(bill.discount)}</span>
          </div>
          <div className="flex justify-between font-semibold border-t border-border pt-1">
            <span>Final Amount</span>
            <span className="tabular-nums">{NUM.format(finalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Paid Amount</span>
            <span className="tabular-nums">{NUM.format(bill.paidAmount)}</span>
          </div>
          <div className="flex justify-between font-semibold border-t border-border pt-1">
            <span>Balance Amount</span>
            <span className="tabular-nums">{NUM.format(balanceAmount)}</span>
          </div>
        </div>
      </div>

      {/* ── Amount in words ── */}
      <p className="text-xs italic text-muted-foreground mb-6">
        {amountInWords(Math.max(0, balanceAmount))}
      </p>

      {/* ── Footer ── */}
      <div className="flex justify-between items-end border-t border-border pt-4 text-xs">
        <p className="text-muted-foreground">Staff Name : {staffName}</p>
        <div className="text-right">
          <div className="border-t border-foreground w-36 mb-1" />
          <p className="text-muted-foreground">Authorized signature</p>
        </div>
      </div>
    </div>
  )
}
