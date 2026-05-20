import { Badge } from '@/components/ui/badge'
import { COMPANY } from '@/lib/brand'
import { GODOWNS_SEED, SECTIONS } from '@/lib/constants'
import type { PurchaseBill } from '@/types'

const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function PrintablePurchase({ bill }: { bill: PurchaseBill }) {
  const sectionLabel = SECTIONS.find((section) => section.key === bill.section)?.label ?? bill.section
  const godownLabel = GODOWNS_SEED.find((godown) => godown.id === bill.godownId)?.name ?? bill.godownId

  return (
    <div className="printable-bill p-8 text-sm">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-lg font-bold text-center">{COMPANY.name}</p>
          <p className="text-xs text-center text-muted-foreground">{COMPANY.place}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            123 Mount Road, Chennai - 600 002
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            PURCHASE VOUCHER
          </p>
          <p className="font-mono font-medium">{bill.voucherNumber}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(bill.date)}</p>
        </div>
      </div>

      <hr className="mb-6 border-border" />

      <div className="mb-8 flex justify-between">
        <div>
          <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
            Received from
          </p>
          <p className="font-medium">{bill.vendorName}</p>
        </div>
        <div className="text-right">
          <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
            Section / Godown
          </p>
          <p>{sectionLabel}</p>
          <p className="text-muted-foreground">{godownLabel}</p>
        </div>
      </div>

      <table className="mb-6 w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="py-2 text-left font-medium">Item</th>
            <th className="py-2 text-right font-medium">Qty</th>
            <th className="py-2 text-right font-medium">Unit price</th>
            <th className="py-2 text-right font-medium">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((item, index) => (
            <tr key={`${item.productId}-${item.productName}-${index}`} className="border-b border-border/50">
              <td className="py-2">
                <span>{item.productName}</span>
                {!item.productId && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">
                    new
                  </Badge>
                )}
              </td>
              <td className="py-2 text-right font-mono tabular-nums">
                {item.quantity} {item.unit}
              </td>
              <td className="py-2 text-right font-mono tabular-nums">
                {INR.format(item.unitPrice)}
              </td>
              <td className="py-2 text-right font-mono tabular-nums">
                {INR.format(item.subtotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mb-10 flex justify-end">
        <div className="w-48 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-mono tabular-nums">{INR.format(bill.subtotal)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-1 font-medium">
            <span>Total</span>
            <span className="font-mono tabular-nums">{INR.format(bill.total)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">Computer generated voucher</p>
        <div className="text-right">
          <div className="mb-1 w-36 border-t border-foreground" />
          <p className="text-xs text-muted-foreground">Authorized signature</p>
        </div>
      </div>
    </div>
  )
}
