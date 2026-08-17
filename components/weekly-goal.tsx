"use client"

import { Minus, Plus, Target, TrendingDown, TrendingUp } from "lucide-react"
import { useMemo, useState } from "react"
import {
  formatCompactCurrency,
  formatCurrency,
  type WeekBucket,
} from "@/lib/finance-data"

const MIN_BUDGET = 50
const MAX_BUDGET = 1500
const STEP = 25

export function WeeklyGoal({
  weeks,
  initialBudget,
}: {
  weeks: WeekBucket[]
  initialBudget: number
}) {
  const [budget, setBudget] = useState(initialBudget)

  const status = useMemo(() => {
    const current = weeks.length ? weeks[weeks.length - 1] : null
    const spent = current ? current.total : 0
    const remaining = budget - spent
    const progress = budget > 0 ? spent / budget : 0
    const avgWeekly = weeks.length
      ? weeks.reduce((sum, w) => sum + w.total, 0) / weeks.length
      : 0
    const onTrackWeeks = weeks.filter((w) => w.total <= budget).length
    return {
      current,
      spent,
      remaining,
      progress,
      over: spent > budget,
      dailyBudget: budget / 7,
      avgWeekly,
      onTrackWeeks,
    }
  }, [weeks, budget])

  const maxBar = useMemo(
    () => Math.max(budget, ...weeks.map((w) => w.total), 1),
    [weeks, budget],
  )

  const clamp = (n: number) => Math.min(MAX_BUDGET, Math.max(MIN_BUDGET, n))
  const barPct = Math.min(status.progress, 1) * 100
  const overPct = status.over ? Math.min((status.progress - 1) * 100, 100) : 0

  return (
    <section className="bg-background" aria-labelledby="weekly-goal-heading">
      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Target className="size-4" aria-hidden="true" />
          <h2 id="weekly-goal-heading">Weekly spending goal</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          Set a target for discretionary spending each week and pace yourself against it.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-5">
          {/* This week tracker */}
          <div className="rounded-xl border border-border bg-card p-5 lg:col-span-3">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  This week{status.current ? ` · ${status.current.label}` : ""}
                </p>
                <p className="mt-1 font-mono text-3xl font-semibold tabular-nums text-foreground">
                  {formatCurrency(status.spent)}
                </p>
              </div>
              <p className="text-right text-sm text-muted-foreground">
                of{" "}
                <span className="font-mono font-medium text-foreground">
                  {formatCurrency(budget)}
                </span>
              </p>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
                <div className="flex h-full w-full">
                  <div
                    className={`h-full rounded-full transition-all ${status.over ? "bg-expense" : "bg-primary"}`}
                    style={{ width: `${barPct}%` }}
                  />
                  {overPct > 0 ? (
                    <div
                      className="h-full animate-pulse rounded-full bg-expense/60"
                      style={{ width: `${overPct}%` }}
                    />
                  ) : null}
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {Math.round(status.progress * 100)}% used
                </span>
                <span
                  className={`font-mono font-medium ${status.over ? "text-expense" : "text-income"}`}
                >
                  {status.over
                    ? `${formatCurrency(Math.abs(status.remaining))} over`
                    : `${formatCurrency(status.remaining)} left`}
                </span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4">
              <MiniStat
                label="Daily budget"
                value={formatCurrency(status.dailyBudget)}
              />
              <MiniStat
                label="Avg / week"
                value={formatCompactCurrency(status.avgWeekly)}
                tone={status.avgWeekly > budget ? "expense" : "income"}
              />
              <MiniStat
                label="Weeks on track"
                value={`${status.onTrackWeeks}/${weeks.length}`}
              />
            </div>
          </div>

          {/* Budget control */}
          <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
            <p className="text-xs font-medium text-muted-foreground">Weekly target</p>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setBudget((b) => clamp(b - STEP))}
                className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-accent disabled:opacity-40"
                disabled={budget <= MIN_BUDGET}
                aria-label="Decrease weekly target"
              >
                <Minus className="size-4" aria-hidden="true" />
              </button>
              <span className="flex-1 text-center font-mono text-2xl font-semibold tabular-nums text-foreground">
                {formatCurrency(budget)}
              </span>
              <button
                type="button"
                onClick={() => setBudget((b) => clamp(b + STEP))}
                className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-accent disabled:opacity-40"
                disabled={budget >= MAX_BUDGET}
                aria-label="Increase weekly target"
              >
                <Plus className="size-4" aria-hidden="true" />
              </button>
            </div>

            <input
              type="range"
              min={MIN_BUDGET}
              max={MAX_BUDGET}
              step={STEP}
              value={budget}
              onChange={(e) => setBudget(clamp(Number(e.target.value)))}
              className="mt-4 w-full accent-primary"
              aria-label="Weekly spending target"
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>{formatCompactCurrency(MIN_BUDGET)}</span>
              <span>{formatCompactCurrency(MAX_BUDGET)}</span>
            </div>

            <p className="mt-4 flex items-start gap-2 rounded-lg bg-secondary/60 p-3 text-xs text-muted-foreground text-pretty">
              {status.avgWeekly > budget ? (
                <>
                  <TrendingUp className="mt-0.5 size-3.5 shrink-0 text-expense" aria-hidden="true" />
                  <span>
                    Your recent average is{" "}
                    <span className="font-medium text-foreground">
                      {formatCurrency(status.avgWeekly)}
                    </span>
                    /week — above this target. Trim about{" "}
                    {formatCurrency(status.avgWeekly - budget)} to stay on pace.
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="mt-0.5 size-3.5 shrink-0 text-income" aria-hidden="true" />
                  <span>
                    Nice — your recent average of{" "}
                    <span className="font-medium text-foreground">
                      {formatCurrency(status.avgWeekly)}
                    </span>
                    /week is within this target.
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Recent weeks */}
        <div className="mt-4 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Recent weeks vs target</p>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-block h-1 w-4 rounded-full bg-primary" /> target
            </span>
          </div>

          <div className="mt-4 flex items-stretch gap-2 sm:gap-3" style={{ height: 140 }}>
            {status.current === null ? (
              <p className="text-sm text-muted-foreground">No spending data yet.</p>
            ) : (
              weeks.map((week) => {
                const heightPct = (week.total / maxBar) * 100
                const over = week.total > budget
                const isCurrent = week.key === status.current?.key
                return (
                  <div key={week.key} className="flex h-full flex-1 flex-col items-center gap-2">
                    <div className="relative flex w-full flex-1 items-end">
                      {/* target line */}
                      <div
                        className="absolute left-0 right-0 border-t border-dashed border-primary/70"
                        style={{ bottom: `${(budget / maxBar) * 100}%` }}
                        aria-hidden="true"
                      />
                      <div
                        className={`w-full rounded-t-md transition-all ${
                          over ? "bg-expense" : "bg-income"
                        } ${isCurrent ? "opacity-100" : "opacity-55"}`}
                        style={{ height: `${Math.max(heightPct, 2)}%` }}
                        title={`${week.label}: ${formatCurrency(week.total)}`}
                      />
                    </div>
                    <span
                      className={`text-[10px] tabular-nums ${isCurrent ? "font-medium text-foreground" : "text-muted-foreground"}`}
                    >
                      {week.label.split(" – ")[0]}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function MiniStat({
  label,
  value,
  tone = "neutral",
}: {
  label: string
  value: string
  tone?: "income" | "expense" | "neutral"
}) {
  const toneClass =
    tone === "income" ? "text-income" : tone === "expense" ? "text-expense" : "text-foreground"
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-0.5 font-mono text-sm font-semibold tabular-nums ${toneClass}`}>{value}</p>
    </div>
  )
}
