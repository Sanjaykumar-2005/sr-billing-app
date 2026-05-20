export interface ParsedBillItem {
  name: string
  qty: number
  sqFt: number
  rate: number
}

export interface ParsedBill {
  customerName: string
  customerPhone?: string
  customerAddress?: string
  items: ParsedBillItem[]
}

export async function extractBillFromImage(imageDataUrl: string): Promise<ParsedBill> {
  void imageDataUrl

  // TODO: replace with backend vision endpoint — never call Anthropic with a key in the browser.
  await new Promise((resolve) => window.setTimeout(resolve, 1000))

  return {
    customerName: 'Amit Sharma',
    customerPhone: '+91 98765 43210',
    customerAddress: '22 MG Road, Bengaluru',
    items: [
      { name: 'Saint Gobain Clear Glass 8mm', qty: 2, sqFt: 48, rate: 145 },
      { name: 'Plywood 18mm Commercial', qty: 3, sqFt: 0, rate: 1850 },
      { name: 'Mirror Polish Edge Work', qty: 1, sqFt: 48, rate: 35 },
    ],
  }
}
