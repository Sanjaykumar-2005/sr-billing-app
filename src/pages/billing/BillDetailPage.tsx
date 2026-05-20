import { Link, useParams, Navigate } from 'react-router-dom'
import { ArrowLeft, FilePlus, Printer } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PrintableBill } from '@/components/billing/PrintableBill'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { SECTION_ACCESS } from '@/types'

export function BillDetailPage() {
  const { id } = useParams<{ id: string }>()
  const currentUser = useAuthStore((s) => s.currentUser)!
  const allowedSections = SECTION_ACCESS[currentUser.role]
  const rawBill = id ? api.bills.get(id) : undefined
  const bill = id ? api.bills.get(id, allowedSections) : undefined

  if (rawBill && !bill) {
    return <Navigate to="/dashboard" replace state={{ denied: true, attempted: `/billing/${id}` }} />
  }

  if (!bill) return <Navigate to="/billing" replace />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/billing"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to bills
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/billing/new">
              <FilePlus className="h-4 w-4 mr-2" />
              New bill
            </Link>
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto border border-border rounded-md bg-card">
        <PrintableBill bill={bill} />
      </div>
    </div>
  )
}
