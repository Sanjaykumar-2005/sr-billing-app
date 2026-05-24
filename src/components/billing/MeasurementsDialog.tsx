import * as React from 'react'
import { Ruler } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MEASUREMENT_PRESETS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface MeasurementsDialogProps {
  productType: string
  currentValue: string
  onSelect: (value: string) => void
  onClose: () => void
}

const PRODUCT_TYPES = Object.keys(MEASUREMENT_PRESETS)

function normalizeProductType(productType: string) {
  const normalized = productType.trim().toLowerCase()
  return PRODUCT_TYPES.find((type) => type.toLowerCase() === normalized)
}

export function MeasurementsDialog({
  productType,
  currentValue,
  onSelect,
  onClose,
}: MeasurementsDialogProps) {
  const initialType = normalizeProductType(productType) ?? PRODUCT_TYPES[0]
  const [activeType, setActiveType] = React.useState(initialType)
  const [customValue, setCustomValue] = React.useState(currentValue)

  React.useEffect(() => {
    setActiveType(normalizeProductType(productType) ?? PRODUCT_TYPES[0])
    setCustomValue(currentValue)
  }, [currentValue, productType])

  function selectMeasurement(value: string) {
    onSelect(value)
    onClose()
  }

  function confirmCustom() {
    const nextValue = customValue.trim()
    if (!nextValue) return
    selectMeasurement(nextValue)
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Select Measurement
          </DialogTitle>
          <DialogDescription>{activeType} measurements</DialogDescription>
        </DialogHeader>

        <Tabs value={activeType} onValueChange={setActiveType}>
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-3">
            {PRODUCT_TYPES.map((type) => (
              <TabsTrigger key={type} value={type} className="text-xs">
                {type}
              </TabsTrigger>
            ))}
          </TabsList>

          {PRODUCT_TYPES.map((type) => (
            <TabsContent key={type} value={type} className="space-y-4">
              <div className="grid max-h-[42vh] grid-cols-2 gap-2 overflow-y-auto pr-1">
                {MEASUREMENT_PRESETS[type].map((preset) => {
                  const selected = preset.value === currentValue

                  return (
                    <button
                      key={`${type}-${preset.label}`}
                      type="button"
                      className={cn(
                        'rounded-full border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors hover:border-brand-mid hover:bg-muted',
                        selected && 'border-brand-mid bg-brand-mid text-white hover:bg-brand-mid'
                      )}
                      onClick={() => selectMeasurement(preset.value)}
                    >
                      {preset.label}
                    </button>
                  )
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex gap-2 border-t border-border pt-4">
          <Input
            value={customValue}
            onChange={(event) => setCustomValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                confirmCustom()
              }
            }}
            placeholder="Enter custom size..."
          />
          <Button type="button" onClick={confirmCustom}>
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
