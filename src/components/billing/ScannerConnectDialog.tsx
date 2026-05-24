import * as React from 'react'
import { Check, ExternalLink, ImageUp, Loader2, Search, ScanLine, XCircle } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useScanner } from '@/lib/useScanner'

interface ScannerConnectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImageScanned: (imageDataUrl: string) => void
  allowPdf?: boolean
}

function isMacPlatform() {
  return /mac/i.test(navigator.platform)
}

function scannerLabel(scannerUrl?: string) {
  if (!scannerUrl) return ''
  try {
    return new URL(scannerUrl).hostname
  } catch {
    return scannerUrl
  }
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('File could not be read.'))
    }
    reader.onerror = () => reject(new Error('File could not be read.'))
    reader.readAsDataURL(file)
  })
}

export function ScannerConnectDialog({
  open,
  onOpenChange,
  onImageScanned,
  allowPdf = false,
}: ScannerConnectDialogProps) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const [manualIp, setManualIp] = React.useState('')
  const {
    status,
    scannerUrl,
    scannedImage,
    networkResults,
    searchProgress,
    reset,
    detectScanner,
    connectToIp,
    searchNetwork,
    scanNow,
  } = useScanner()

  React.useEffect(() => {
    if (!open) {
      reset()
      setManualIp('')
      return
    }

    void detectScanner()
  }, [detectScanner, open, reset])

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('PDF scanning requires backend — image files only for now')
      return
    }

    const imageDataUrl = await readFileAsDataUrl(file)
    onImageScanned(imageDataUrl)
    onOpenChange(false)
  }

  function openScannerApp() {
    window.open(isMacPlatform() ? 'x-apple.systempreferences:' : 'ms-photos:')
  }

  function useCompletedScan() {
    if (!scannedImage) return
    onImageScanned(scannedImage)
    onOpenChange(false)
  }

  const networkPercent = searchProgress.total
    ? Math.round((searchProgress.completed / searchProgress.total) * 100)
    : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="h-5 w-5" />
            Connect to Scanner
          </DialogTitle>
          <DialogDescription>
            No scanner detected automatically. Try these options:
          </DialogDescription>
        </DialogHeader>

        {status === 'searching' && (
          <div className="flex items-center gap-3 rounded-md border border-border bg-muted p-4 text-sm">
            <Loader2 className="h-4 w-4 animate-spin text-brand-mid" />
            <span>Searching for scanner…</span>
          </div>
        )}

        {status === 'found' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted p-4 text-sm">
              <Check className="h-4 w-4 text-brand-mid" />
              <span>Scanner found at {scannerLabel(scannerUrl)} ✓</span>
            </div>
            <Button type="button" className="w-full" onClick={scanNow}>
              Scan now
            </Button>
          </div>
        )}

        {status === 'scanning' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Scanning document…</p>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-brand-mid" />
            </div>
          </div>
        )}

        {status === 'complete' && scannedImage && (
          <div className="space-y-4">
            <p className="text-sm font-medium">Scan complete</p>
            <img
              src={scannedImage}
              alt="Scanned document"
              className="max-h-64 w-full rounded-md border border-border object-contain"
            />
            <Button type="button" className="w-full" onClick={useCompletedScan}>
              Use this scan
            </Button>
          </div>
        )}

        {status === 'not-found' && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted p-4 text-sm">
              <XCircle className="h-4 w-4 text-muted-foreground" />
              <span>No scanner found</span>
            </div>

            <div className="space-y-2">
              <Label>Open scanner app</Label>
              <Button type="button" variant="outline" className="w-full justify-start" onClick={openScannerApp}>
                <ExternalLink className="h-4 w-4" />
                Open scanner app
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scanner-ip">Enter scanner IP</Label>
              <div className="flex gap-2">
                <Input
                  id="scanner-ip"
                  value={manualIp}
                  onChange={(event) => setManualIp(event.target.value)}
                  placeholder="192.168.1.105"
                />
                <Button type="button" variant="outline" onClick={() => void connectToIp(manualIp)}>
                  Connect
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Button type="button" variant="outline" className="w-full justify-start" onClick={() => void searchNetwork()}>
                <Search className="h-4 w-4" />
                Search network
              </Button>
              {searchProgress.total > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Searching for scanners on your network…</p>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-brand-mid" style={{ width: `${networkPercent}%` }} />
                  </div>
                </div>
              )}
              {networkResults.map((result) => (
                <Button
                  key={result}
                  type="button"
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => void connectToIp(result)}
                >
                  Scanner at {scannerLabel(result)}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <Button type="button" variant="outline" className="w-full justify-start" onClick={() => fileInputRef.current?.click()}>
                <ImageUp className="h-4 w-4" />
                Use file upload instead
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept={allowPdf ? 'image/*,.pdf' : 'image/*'}
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
