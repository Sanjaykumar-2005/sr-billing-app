import { cn } from '@/lib/utils'
import { safeMoney, type WeeklyRevenueDay } from '@/lib/reportSelectors'

export function WeeklyBarChart({ days }: { days: Pick<WeeklyRevenueDay, 'label' | 'revenue' | 'isToday'>[] }) {
  const max = Math.max(...days.map((day) => day.revenue), 1)

  return (
    <div className="flex h-28 items-end gap-1.5">
      {days.map((day, index) => {
        const pct = day.revenue > 0
          ? Math.max((safeMoney(day.revenue) / safeMoney(max)) * 100, 6)
          : 0

        return (
          <div key={`${day.label}-${index}`} className="flex h-full flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full flex-1 flex-col justify-end">
              {day.revenue > 0 && (
                <p className="mb-0.5 text-center font-mono text-[9px] tabular-nums text-muted-foreground">
                  {day.revenue >= 1000 ? `${Math.round(day.revenue / 1000)}k` : String(Math.round(day.revenue))}
                </p>
              )}
              <div
                className={cn(
                  'min-h-[2px] w-full rounded-t-sm transition-all duration-500',
                  day.isToday ? 'bg-primary' : 'bg-primary/35',
                )}
                style={{ height: `${pct}%` }}
              />
            </div>
            <span
              className={cn(
                'font-mono text-[10px]',
                day.isToday ? 'font-semibold text-foreground' : 'text-muted-foreground',
              )}
            >
              {day.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
