const ONES = [
  'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
]
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function twoDigits(n: number): string {
  if (n < 20) return ONES[n]
  return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '')
}

function threeDigits(n: number): string {
  if (n === 0) return ''
  if (n < 100) return twoDigits(n)
  const h = Math.floor(n / 100)
  const rem = n % 100
  return ONES[h] + ' Hundred' + (rem ? ' ' + twoDigits(rem) : '')
}

export function amountInWords(amount: number): string {
  const n = Math.round(amount)
  if (n <= 0) return 'Zero Only'

  const crore    = Math.floor(n / 10_000_000)
  const lakh     = Math.floor((n % 10_000_000) / 100_000)
  const thousand = Math.floor((n % 100_000) / 1_000)
  const rem      = n % 1_000

  const parts: string[] = []
  if (crore)    parts.push(threeDigits(crore)  + ' Crore')
  if (lakh)     parts.push(twoDigits(lakh)      + ' Lakh')
  if (thousand) parts.push(twoDigits(thousand)  + ' Thousand')
  if (rem)      parts.push(threeDigits(rem))

  return parts.join(' ') + ' Only'
}
