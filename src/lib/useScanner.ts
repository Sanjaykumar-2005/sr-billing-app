import * as React from 'react'

export const SCANNER_ENDPOINTS = [
  'http://localhost:8080/eSCL/ScannerCapabilities',
  'http://localhost:9095/eSCL/ScannerCapabilities',
  'http://127.0.0.1:8080/eSCL/ScannerCapabilities',
]

const SCAN_SETTINGS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<scan:ScanSettings xmlns:scan="http://schemas.hp.com/imaging/escl/2011/05/03" xmlns:pwg="http://www.pwg.org/schemas/2010/12/sm">
  <pwg:Version>2.6</pwg:Version>
  <scan:Intent>Document</scan:Intent>
  <pwg:ScanRegions>
    <pwg:ScanRegion>
      <pwg:ContentRegionUnits>escl:ThreeHundredthsOfInches</pwg:ContentRegionUnits>
      <pwg:Width>2550</pwg:Width>
      <pwg:Height>3300</pwg:Height>
    </pwg:ScanRegion>
  </pwg:ScanRegions>
  <scan:ColorMode>RGB24</scan:ColorMode>
  <scan:XResolution>300</scan:XResolution>
  <scan:YResolution>300</scan:YResolution>
</scan:ScanSettings>`

type ScannerStatus = 'idle' | 'searching' | 'found' | 'scanning' | 'complete' | 'not-found'

interface ScannerNavigator extends Navigator {
  scanner?: {
    scan: () => Promise<unknown>
  }
}

interface SearchProgress {
  completed: number
  total: number
}

function hasWebScanApi() {
  const scannerNavigator = navigator as ScannerNavigator
  return ('ImageCapture' in window || 'scanner' in navigator) && typeof scannerNavigator.scanner?.scan === 'function'
}

function scannerBaseFromCapabilitiesUrl(url: string) {
  return url.replace(/\/ScannerCapabilities\/?$/i, '')
}

function normalizeScannerUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`
  return withProtocol.replace(/\/+$/, '')
}

function scannerUrlFromIp(ipAddress: string) {
  return `${normalizeScannerUrl(ipAddress)}/eSCL`
}

function capabilitiesUrlFromBase(baseUrl: string) {
  return `${baseUrl.replace(/\/+$/, '')}/ScannerCapabilities`
}

async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = 2000) {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    })
  } finally {
    window.clearTimeout(timeout)
  }
}

async function blobToDataUrl(blob: Blob) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('Scanner returned an unreadable image.'))
    }
    reader.onerror = () => reject(new Error('Scanner image could not be read.'))
    reader.readAsDataURL(blob)
  })
}

async function scanResultToDataUrl(result: unknown): Promise<string | undefined> {
  if (result instanceof Blob) return blobToDataUrl(result)
  if (typeof result === 'string' && result.startsWith('data:')) return result

  if (typeof result === 'object' && result !== null) {
    const values = Object.values(result as Record<string, unknown>)
    for (const value of values) {
      const nested = await scanResultToDataUrl(value)
      if (nested) return nested
    }
  }

  return undefined
}

async function findReachableScanner(capabilitiesUrl: string) {
  try {
    const response = await fetchWithTimeout(capabilitiesUrl, { method: 'GET' }, 2000)
    if (response.ok || response.type === 'opaque') {
      return scannerBaseFromCapabilitiesUrl(capabilitiesUrl)
    }
  } catch {
    return undefined
  }

  return undefined
}

async function pollScanJob(jobUrl: string) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      const response = await fetchWithTimeout(jobUrl, { method: 'GET' }, 2000)
      const body = await response.text()
      if (body.toLowerCase().includes('completed')) return
    } catch {
      return
    }

    await new Promise((resolve) => window.setTimeout(resolve, 1000))
  }
}

async function scanWithEscl(baseUrl: string) {
  const scanJobsUrl = `${baseUrl.replace(/\/+$/, '')}/ScanJobs`
  const response = await fetchWithTimeout(
    scanJobsUrl,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/xml' },
      body: SCAN_SETTINGS_XML,
    },
    5000
  )
  const location = response.headers.get('Location')
  const jobUrl = location?.startsWith('http') ? location : location ? new URL(location, scanJobsUrl).toString() : ''
  if (!jobUrl) throw new Error('Scanner did not return a scan job.')

  await pollScanJob(jobUrl)

  const documentResponse = await fetchWithTimeout(`${jobUrl.replace(/\/+$/, '')}/NextDocument`, { method: 'GET' }, 10000)
  const blob = await documentResponse.blob()
  return blobToDataUrl(blob)
}

function localNetworkIps() {
  return [
    ...Array.from({ length: 20 }, (_, index) => `192.168.1.${index + 1}`),
    ...Array.from({ length: 20 }, (_, index) => `192.168.0.${index + 1}`),
  ]
}

export function useScanner() {
  const [status, setStatus] = React.useState<ScannerStatus>('idle')
  const [scannerUrl, setScannerUrl] = React.useState<string>()
  const [scannedImage, setScannedImage] = React.useState<string>()
  const [networkResults, setNetworkResults] = React.useState<string[]>([])
  const [searchProgress, setSearchProgress] = React.useState<SearchProgress>({ completed: 0, total: 0 })

  const reset = React.useCallback(() => {
    setStatus('idle')
    setScannerUrl(undefined)
    setScannedImage(undefined)
    setNetworkResults([])
    setSearchProgress({ completed: 0, total: 0 })
  }, [])

  const scanWithWebApi = React.useCallback(async () => {
    if (!hasWebScanApi()) return undefined

    try {
      setStatus('scanning')
      const result = await (navigator as ScannerNavigator).scanner?.scan()
      return await scanResultToDataUrl(result)
    } catch {
      return undefined
    }
  }, [])

  const detectScanner = React.useCallback(async () => {
    setStatus('searching')
    setScannedImage(undefined)

    const webScanImage = await scanWithWebApi()
    if (webScanImage) {
      setScannedImage(webScanImage)
      setStatus('complete')
      return
    }

    for (const endpoint of SCANNER_ENDPOINTS) {
      const foundUrl = await findReachableScanner(endpoint)
      if (foundUrl) {
        setScannerUrl(foundUrl)
        setStatus('found')
        return
      }
    }

    setStatus('not-found')
  }, [scanWithWebApi])

  const connectToIp = React.useCallback(async (ipAddress: string) => {
    const baseUrl = ipAddress.includes('/eSCL') ? normalizeScannerUrl(ipAddress) : scannerUrlFromIp(ipAddress)
    setStatus('searching')

    const foundUrl = await findReachableScanner(capabilitiesUrlFromBase(baseUrl))
    if (foundUrl) {
      setScannerUrl(foundUrl)
      setStatus('found')
      return true
    }

    setStatus('not-found')
    return false
  }, [])

  const searchNetwork = React.useCallback(async () => {
    const ips = localNetworkIps()
    const found: string[] = []
    setNetworkResults([])
    setSearchProgress({ completed: 0, total: ips.length })

    await Promise.all(
      ips.map(async (ipAddress) => {
        const foundUrl = await findReachableScanner(capabilitiesUrlFromBase(scannerUrlFromIp(ipAddress)))
        if (foundUrl) {
          found.push(foundUrl)
          setNetworkResults((current) => [...current, foundUrl])
        }
        setSearchProgress((current) => ({ ...current, completed: current.completed + 1 }))
      })
    )

    if (found[0]) {
      setScannerUrl(found[0])
      setStatus('found')
      return
    }

    setStatus('not-found')
  }, [])

  const scanNow = React.useCallback(async () => {
    if (!scannerUrl) {
      await detectScanner()
      return
    }

    try {
      setStatus('scanning')
      const imageDataUrl = await scanWithEscl(scannerUrl)
      setScannedImage(imageDataUrl)
      setStatus('complete')
    } catch {
      setStatus('not-found')
    }
  }, [detectScanner, scannerUrl])

  return {
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
  }
}
