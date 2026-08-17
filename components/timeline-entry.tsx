import { Award, Sparkles } from "lucide-react"
import { categoryIcons } from "@/lib/category-icons"
import { formatCurrency, formatSignedCurrency, type TimelineEntry } from "@/lib/finance-data"

function dayLabel(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
  })
}

export function TimelineEntryRow({ entry }: { entry: TimelineEntry }) {
  const isMilestone = entry.kind === "milestone"
  const isIncome = entry.kind === "income"
  const Icon = isMilestone ? Award : entry.category ? categoryIcons[entry.category] : Sparkles

  const nodeClass = isMilestone
    ? "border-primary bg-primary text-primary-foreground"
    : isIncome
      ? "border-income/30 bg-income/10 text-income"
      : "border-border bg-secondary text-muted-foreground"

  const amountClass = isIncome ? "text-income" : "text-expense"

  return (
    <li className="relative flex gap-4 pl-1">
      {/* Node on the rail */}
      <div className="relative z-10 flex shrink-0 flex-col items-center">
        <span
          className={`flex size-9 items-center justify-center rounded-full border ${nodeClass}`}
          aria-hidden="true"
        >
          <Icon className="size-4" />
        </span>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 pb-6">
        {isMilestone ? (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">Milestone</span>
              <time className="text-xs text-muted-foreground" dateTime={entry.date}>
                {dayLabel(entry.date)}
              </time>
            </div>
            <p className="mt-1.5 text-pretty font-medium text-foreground">{entry.title}</p>
            {entry.description ? (
              <p className="mt-1 text-sm text-muted-foreground">{entry.description}</p>
            ) : null}
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium text-foreground">{entry.title}</p>
                {entry.category ? (
                  <span className="hidden shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground sm:inline">
                    {entry.category}
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                <time dateTime={entry.date}>{dayLabel(entry.date)}</time>
                {entry.description ? <span> · {entry.description}</span> : null}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className={`font-mono text-sm font-semibold tabular-nums ${amountClass}`}>
                {formatSignedCurrency(entry.amount ?? 0, entry.kind)}
              </p>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground tabular-nums">
                {formatCurrency(entry.balance)}
              </p>
            </div>
          </div>
        )}
      </div>
    </li>
  )
}
