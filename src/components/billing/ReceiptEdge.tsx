interface ReceiptEdgeProps {
  direction?: 'top' | 'bottom'
  color?: string
  stroke?: string
  className?: string
}

export function ReceiptEdge({ direction = 'top', color = '#ffffff', stroke = '#5F9598', className = '' }: ReceiptEdgeProps) {
  const path = 'M0 8 L5 0 L10 8 L15 0 L20 8 L25 0 L30 8 L35 0 L40 8 L45 0 L50 8 L55 0 L60 8 L65 0 L70 8 L75 0 L80 8 L85 0 L90 8 L95 0 L100 8 Z'

  return (
    <svg
      viewBox="0 0 100 8"
      preserveAspectRatio="none"
      className={`${className} w-full h-4 block ${direction === 'bottom' ? 'rotate-180' : ''}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={path} fill={color} stroke={stroke} strokeWidth={0.5} />
    </svg>
  )
}
