// BACKEND SEAM: every function in this file currently reads from
// localStorage / Zustand stores. When the real backend lands, swap
// each function body to a fetch() call. Signatures must not change.

import { useInventoryStore } from '@/store/inventoryStore'
import { useBillingStore } from '@/store/billingStore'
import type { CreateBillInput, SalesBill, Section } from '@/types'

export class InsufficientStockError extends Error {
  readonly productName: string
  readonly available: number
  readonly requested: number

  constructor(productName: string, available: number, requested: number) {
    super(`Not enough stock for ${productName}`)
    this.name = 'InsufficientStockError'
    this.productName = productName
    this.available = available
    this.requested = requested
  }
}

const PHONE_RE = /^[+]?[\d\s-]{7,15}$/

export const api = {
  inventory: {
    listBySection(section: Section) {
      return useInventoryStore.getState().getBySection(section)
    },
    listByGodown(godownId: string, section?: Section) {
      return useInventoryStore.getState().getByGodown(godownId, section)
    },
    search(query: string, allowedSections: Section[]) {
      return useInventoryStore.getState().searchProducts(query, allowedSections)
    },
    godownsForSection(section: Section) {
      return useInventoryStore.getState().getGodownsForSection(section)
    },
  },

  bills: {
    create(input: CreateBillInput): SalesBill {
      if (input.customerPhone && !PHONE_RE.test(input.customerPhone)) {
        throw new Error('Invalid customer phone number')
      }
      const inventory = useInventoryStore.getState()
      // Check all stock before touching anything (all-or-nothing)
      for (const item of input.items) {
        const product = inventory.products.find((p) => p.id === item.productId)
        if (!product) throw new Error(`Product ${item.productId} not found`)
        if (product.stock < item.quantity) {
          throw new InsufficientStockError(item.productName, product.stock, item.quantity)
        }
      }
      // All checks passed — decrement atomically
      for (const item of input.items) {
        inventory.decrementStock(item.productId, item.quantity)
      }
      return useBillingStore.getState().createBill(input)
    },

    list({
      from,
      to,
      section,
      sections,
      userId,
    }: { from?: string; to?: string; section?: Section; sections?: Section[]; userId?: string } = {}): SalesBill[] {
      const store = useBillingStore.getState()
      let bills = from && to ? store.getBillsByDateRange(from, to) : store.bills
      if (sections?.length) bills = bills.filter((b) => sections.includes(b.section))
      else if (section)     bills = bills.filter((b) => b.section === section)
      if (userId)           bills = bills.filter((b) => b.createdBy === userId)
      return bills
    },

    get(id: string, allowedSections?: Section[]): SalesBill | undefined {
      const bill = useBillingStore.getState().getBillById(id)
      if (!bill) return undefined
      if (allowedSections && !allowedSections.includes(bill.section)) return undefined
      return bill
    },

    today(userId?: string): SalesBill[] {
      return useBillingStore.getState().getTodaysBills(userId)
    },
  },
} as const
