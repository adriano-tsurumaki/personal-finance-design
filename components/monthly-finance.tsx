"use client"

import { ArrowDownRight, ArrowUpRight, ChevronLeft, ChevronRight, Wallet } from "lucide-react"
import { useState } from "react"
import {
  formatCompactCurrency,
  formatCurrency,
  type MonthlyStatement,
} from "@/lib/finance-data"
import { BalanceSparkline } from "./balance-sparkline"
import { TimelineEntryRow } from "./timeline-entry"

export function MonthlyFinance({ statements }: { statements: MonthlyStatement[] }) {
  // Start on the most recent month.
  const [index, setIndex] = useState(statements.length - 1)

  if (!statements.length) return null

  const clamped = Math.min(Math.max(index, 0), statements.length - 1)
  const stmt = statements[clamped]
  const hasOlder = clamped > 0
  const hasNewer = clamped < statements.length - 1
  const net = stmt.net

  return (
    <section>
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-5 pb-8 pt-10 sm:px-8">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Wallet className="size-4" aria-hidden="true" />
            <span>Ledger</span>
          </div>

          {/* Month navigator */}
          <div className="mt-6 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setIndex(clamped - 1)}
              disabled={!hasOlder}
              aria-label="Previous month"
              className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
            </button>

            <div className="text-center">
              <h1 className="text-lg font-semibold text-foreground">{stmt.label}</h1>
              <p className="text-xs text-muted-foreground">
                Month {clamped + 1} of {statements.length}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIndex(clamped + 1)}
              disabled={!hasNewer}
              aria-label="Next month"
              className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">End-of-month balance</p>
              <p className="mt-1 font-mono text-4xl font-semibold tracking-tight text-foreground tabular-nums sm:text-5xl">
                {formatCurrency(stmt.closingBalance)}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Opened at {formatCompactCurrency(stmt.openingBalance)} ·{" "}
                <span className={net >= 0 ? "text-income" : "text-expense"}>
                  {net >= 0 ? "+" : "\u2212"}
                  {formatCompactCurrency(Math.abs(net))} this month
                </span>
              </p>
            </div>

            {stmt.balanceSeries.length >= 2 ? (
              <div className="w-full max-w-[240px] shrink-0">
                <BalanceSparkline data={stmt.balanceSeries} />
                <p className="mt-2 text-right text-xs text-muted-foreground">Balance this month</p>
              </div>
            ) : null}
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat
              label="Income"
              value={formatCompactCurrency(stmt.income)}
              tone="income"
              icon={<ArrowUpRight className="size-4" aria-hidden="true" />}
            />
            <Stat
              label="Expenses"
              value={formatCompactCurrency(stmt.expense)}
              tone="expense"
              icon={<ArrowDownRight className="size-4" aria-hidden="true" />}
            />
            <Stat
              label="Saved"
              value={`${Math.round(stmt.savingsRate * 100)}%`}
              tone="neutral"
              hint={formatCompactCurrency(stmt.net)}
            />
          </dl>
        </div>
      </header>

      {/* Transactions for the selected month */}
      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-foreground">Transactions</h2>
          <p className="text-xs text-muted-foreground">
            {stmt.transactionCount} {stmt.transactionCount === 1 ? "entry" : "entries"}
          </p>
        </div>

        <ol className="relative">
          <span className="absolute bottom-4 left-[18px] top-2 w-px bg-border" aria-hidden="true" />
          {stmt.entries.map((entry) => (
            <TimelineEntryRow key={entry.id} entry={entry} />
          ))}
        </ol>
      </div>
    </section>
  )
}

function Stat({
  label,
  value,
  tone,
  icon,
  hint,
}: {
  label: string
  value: string
  tone: "income" | "expense" | "neutral"
  icon?: React.ReactNode
  hint?: string
}) {
  const toneClass =
    tone === "income" ? "text-income" : tone === "expense" ? "text-expense" : "text-foreground"

  return (
    <div className="rounded-lg border border-border bg-background/60 p-3">
      <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className={`mt-1 font-mono text-lg font-semibold tabular-nums ${toneClass}`}>
        {value}
        {hint ? <span className="ml-1.5 text-xs font-normal text-muted-foreground">net {hint}</span> : null}
      </dd>
    </div>
  )
}
