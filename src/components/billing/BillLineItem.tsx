import { useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { SECTIONS } from '@/lib/constants'
import { useAuthStore } from '@/store/authStore'
import { useInventoryStore } from '@/store/inventoryStore'
import { SECTION_ACCESS, type Product, type Section } from '@/types'
import { cn } from '@/lib/utils'

const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })

interface BillLineItemProps {
  index: number
  onRemove: () => void
  isOnly: boolean
  lockedSection?: Section
}

export function BillLineItem({ index, onRemove, isOnly, lockedSection }: BillLineItemProps) {
  const [open, setOpen] = useState(false)
  const { register, setValue, control, formState: { errors } } = useFormContext()
  const currentUser = useAuthStore((s) => s.currentUser)!
  const products = useInventoryStore((s) => s.products)

  const allowedSections = SECTION_ACCESS[currentUser.role]
  const selectedProductId = useWatch({ control, name: `items.${index}.productId` })
  const scannedProductName = useWatch({ control, name: `items.${index}.productName` })
  const quantity  = Number(useWatch({ control, name: `items.${index}.quantity`  })) || 0
  const unitPrice = Number(useWatch({ control, name: `items.${index}.unitPrice` })) || 0
  const sqFt      = Number(useWatch({ control, name: `items.${index}.sqFt`      })) || 0

  const selectedProduct = products.find((p) => p.id === selectedProductId)
  const subtotal = sqFt > 0 ? sqFt * unitPrice : quantity * unitPrice

  const sectionsToShow = lockedSection && !selectedProductId ? [lockedSection] : allowedSections
  const displayedProducts = products.filter((p) => sectionsToShow.includes(p.section))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const itemErrors = (errors.items as any)?.[index]

  function handleSelect(product: Product) {
    setValue(`items.${index}.productId`,   product.id,         { shouldValidate: true })
    setValue(`items.${index}.productName`, product.name)
    setValue(`items.${index}.unit`,        product.unit)
    setValue(`items.${index}.unitPrice`,   product.salePrice)
    setValue(`items.${index}.quantity`,    1)
    setOpen(false)
  }

  return (
    <div className="border-b border-border last:border-0 py-3 space-y-2">
      {/* Row 1: Name | Glass Size | Model */}
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                role="combobox"
                className={cn(
                  'w-full flex items-center rounded-md border border-input bg-background px-3 py-2 text-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  !selectedProductId && 'text-muted-foreground',
                  !selectedProductId && scannedProductName && 'text-foreground',
                  itemErrors?.productId && 'border-destructive'
                )}
              >
                <span className="flex-1 truncate">
                  {selectedProduct?.name ?? scannedProductName ?? 'Glass / Plywood name…'}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-80" align="start">
              <Command>
                <CommandInput placeholder="Search products…" />
                <CommandList>
                  <CommandEmpty>No products found.</CommandEmpty>
                  {sectionsToShow.map((section) => {
                    const group = displayedProducts.filter((p) => p.section === section)
                    if (!group.length) return null
                    const label = SECTIONS.find((s) => s.key === section)?.label ?? section
                    return (
                      <CommandGroup key={section} heading={label}>
                        {group.map((product) => (
                          <CommandItem
                            key={product.id}
                            value={`${product.section}-${product.id}-${product.name}`}
                            onSelect={() => handleSelect(product)}
                          >
                            <span className="flex-1">{product.name}</span>
                            <span className="font-mono text-xs text-muted-foreground">
                              ({product.stock} {product.unit})
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )
                  })}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {itemErrors?.productId && (
            <p className="text-xs text-destructive mt-0.5">{String(itemErrors.productId.message)}</p>
          )}
        </div>

        <Input
          placeholder="Glass size"
          className="w-28"
          {...register(`items.${index}.glassSize`)}
        />
        <Input
          placeholder="Model"
          className="w-24"
          {...register(`items.${index}.model`)}
        />
      </div>

      {/* Row 2: Qty | Sq.Ft | Rate | Amount | Delete */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Qty</span>
          <Input
            type="number"
            className="w-16 text-right font-mono tabular-nums"
            min={1}
            max={selectedProduct?.stock ?? undefined}
            {...register(`items.${index}.quantity`)}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Sq.Ft</span>
          <Input
            type="number"
            className="w-20 text-right font-mono tabular-nums"
            step="0.01"
            min={0}
            placeholder="0"
            {...register(`items.${index}.sqFt`)}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Rate</span>
          <Input
            type="number"
            className="w-24 text-right font-mono tabular-nums"
            step="0.01"
            min={0}
            {...register(`items.${index}.unitPrice`)}
          />
        </div>
        <div className="flex-1 text-right font-mono tabular-nums text-sm font-medium">
          {INR.format(subtotal)}
        </div>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className={cn('shrink-0', isOnly && 'invisible')}
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {itemErrors?.quantity && (
        <p className="text-xs text-destructive">{String(itemErrors.quantity.message)}</p>
      )}
    </div>
  )
}
