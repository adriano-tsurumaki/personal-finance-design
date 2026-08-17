"use client"

import { CalendarClock, Plus, Repeat, Trash2, X } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { categoryIcons } from "@/lib/category-icons"
import {
  type Category,
  formatCompactCurrency,
  formatCurrency,
  FREQUENCY_LABELS,
  type Frequency,
  getRecurringSummary,
  getUpcomingOccurrences,
  monthlyEquivalent,
  type RecurringRule,
} from "@/lib/finance-data"

const CATEGORIES: Category[] = [
  "Salary",
  "Freelance",
  "Investment",
  "Housing",
  "Food",
  "Transport",
  "Shopping",
  "Health",
  "Entertainment",
  "Savings",
]

const FREQUENCIES: Frequency[] = ["weekly", "monthly", "quarterly", "yearly"]

const dateFmt = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  day: "2-digit",
  month: "short",
})

export function RecurringManager({ initialRules }: { initialRules: RecurringRule[] }) {
  const [rules, setRules] = useState<RecurringRule[]>(initialRules)
  const [showForm, setShowForm] = useState(false)

  const summary = useMemo(() => getRecurringSummary(rules), [rules])
  const upcoming = useMemo(() => getUpcomingOccurrences(rules, 45), [rules])

  function toggle(id: string) {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)))
  }

  function remove(id: string) {
    setRules((prev) => prev.filter((r) => r.id !== id))
  }

  function addRule(rule: RecurringRule) {
    setRules((prev) => [...prev, rule])
    setShowForm(false)
  }

  const income = rules.filter((r) => r.kind === "income")
  const expense = rules.filter((r) => r.kind === "expense")

  return (
    <section className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Repeat className="size-4 text-primary" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-foreground">Recurring</h2>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
            {summary.activeCount} active
          </span>
        </div>
        <Button size="sm" variant={showForm ? "secondary" : "default"} onClick={() => setShowForm((s) => !s)}>
          {showForm ? <X className="size-4" /> : <Plus className="size-4" />}
          {showForm ? "Cancel" : "Add"}
        </Button>
      </div>

      {/* Monthly projection */}
      <dl className="mt-4 grid grid-cols-3 gap-3">
        <ProjectionStat label="Income / mo" value={formatCompactCurrency(summary.monthlyIncome)} tone="income" />
        <ProjectionStat label="Expenses / mo" value={formatCompactCurrency(summary.monthlyExpense)} tone="expense" />
        <ProjectionStat
          label="Net / mo"
          value={formatCompactCurrency(summary.monthlyNet)}
          tone={summary.monthlyNet >= 0 ? "income" : "expense"}
        />
      </dl>

      {showForm ? <RuleForm onAdd={addRule} /> : null}

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_260px]">
        {/* Rule lists */}
        <div className="space-y-6">
          {income.length > 0 ? (
            <RuleGroup title="Income" rules={income} onToggle={toggle} onRemove={remove} />
          ) : null}
          {expense.length > 0 ? (
            <RuleGroup title="Expenses" rules={expense} onToggle={toggle} onRemove={remove} />
          ) : null}
          {rules.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No recurring items yet. Add your salary, rent, or subscriptions to project them.
            </p>
          ) : null}
        </div>

        {/* Upcoming forecast */}
        <aside className="md:sticky md:top-4 md:self-start">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <CalendarClock className="size-3.5" aria-hidden="true" />
              Next 45 days
            </div>
            {upcoming.length > 0 ? (
              <ol className="mt-3 space-y-2.5">
                {upcoming.map(({ rule, date }, i) => (
                  <li key={`${rule.id}-${i}`} className="flex items-center justify-between gap-2 text-sm">
                    <div className="min-w-0">
                      <p className="truncate text-foreground">{rule.title}</p>
                      <p className="text-xs text-muted-foreground">{dateFmt.format(date)}</p>
                    </div>
                    <span
                      className={`shrink-0 font-mono text-xs tabular-nums ${
                        rule.kind === "income" ? "text-income" : "text-expense"
                      }`}
                    >
                      {rule.kind === "income" ? "+" : "\u2212"}
                      {formatCompactCurrency(rule.amount)}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Nothing scheduled.</p>
            )}
          </div>
        </aside>
      </div>
    </section>
  )
}

function ProjectionStat({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: "income" | "expense"
}) {
  return (
    <div className="rounded-lg border border-border bg-background/60 p-3">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd
        className={`mt-1 font-mono text-lg font-semibold tabular-nums ${
          tone === "income" ? "text-income" : "text-expense"
        }`}
      >
        {value}
      </dd>
    </div>
  )
}

function RuleGroup({
  title,
  rules,
  onToggle,
  onRemove,
}: {
  title: string
  rules: RecurringRule[]
  onToggle: (id: string) => void
  onRemove: (id: string) => void
}) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <ul className="space-y-2">
        {rules.map((rule) => (
          <RuleRow key={rule.id} rule={rule} onToggle={onToggle} onRemove={onRemove} />
        ))}
      </ul>
    </div>
  )
}

function RuleRow({
  rule,
  onToggle,
  onRemove,
}: {
  rule: RecurringRule
  onToggle: (id: string) => void
  onRemove: (id: string) => void
}) {
  const Icon = categoryIcons[rule.category]
  const monthly = monthlyEquivalent(rule)

  return (
    <li
      className={`flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-opacity ${
        rule.active ? "" : "opacity-55"
      }`}
    >
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-full border ${
          rule.kind === "income"
            ? "border-income/30 bg-income/10 text-income"
            : "border-border bg-secondary text-muted-foreground"
        }`}
        aria-hidden="true"
      >
        <Icon className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{rule.title}</p>
        <p className="text-xs text-muted-foreground">
          {FREQUENCY_LABELS[rule.frequency]}
          {rule.frequency !== "monthly" ? (
            <span> · ~{formatCurrency(monthly)}/mo</span>
          ) : null}
        </p>
      </div>

      <span
        className={`shrink-0 font-mono text-sm font-semibold tabular-nums ${
          rule.kind === "income" ? "text-income" : "text-expense"
        }`}
      >
        {rule.kind === "income" ? "+" : "\u2212"}
        {formatCurrency(rule.amount)}
      </span>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          role="switch"
          aria-checked={rule.active}
          aria-label={`${rule.active ? "Pause" : "Activate"} ${rule.title}`}
          onClick={() => onToggle(rule.id)}
          className={`relative h-5 w-9 rounded-full transition-colors ${
            rule.active ? "bg-primary" : "bg-input"
          }`}
        >
          <span
            className={`absolute top-0.5 size-4 rounded-full bg-background transition-transform ${
              rule.active ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>
        <button
          type="button"
          aria-label={`Remove ${rule.title}`}
          onClick={() => onRemove(rule.id)}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-expense"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </li>
  )
}

function RuleForm({ onAdd }: { onAdd: (rule: RecurringRule) => void }) {
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [kind, setKind] = useState<"income" | "expense">("expense")
  const [category, setCategory] = useState<Category>("Shopping")
  const [frequency, setFrequency] = useState<Frequency>("monthly")
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10))

  const numericAmount = Number.parseFloat(amount)
  const valid = title.trim().length > 0 && Number.isFinite(numericAmount) && numericAmount > 0

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) return
    onAdd({
      id: `r-${Date.now()}`,
      title: title.trim(),
      kind,
      category,
      amount: Math.round(numericAmount * 100) / 100,
      frequency,
      startDate,
      active: true,
    })
  }

  const fieldClass =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
  const labelClass = "mb-1 block text-xs font-medium text-muted-foreground"

  return (
    <form onSubmit={submit} className="mt-4 rounded-lg border border-border bg-card p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="rule-title">
            Title
          </label>
          <input
            id="rule-title"
            className={fieldClass}
            placeholder="e.g. Netflix, Rent, Salary"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="rule-amount">
            Amount
          </label>
          <input
            id="rule-amount"
            className={fieldClass}
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="rule-kind">
            Type
          </label>
          <select
            id="rule-kind"
            className={fieldClass}
            value={kind}
            onChange={(e) => setKind(e.target.value as "income" | "expense")}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="rule-category">
            Category
          </label>
          <select
            id="rule-category"
            className={fieldClass}
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="rule-frequency">
            Frequency
          </label>
          <select
            id="rule-frequency"
            className={fieldClass}
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as Frequency)}
          >
            {FREQUENCIES.map((f) => (
              <option key={f} value={f}>
                {FREQUENCY_LABELS[f]}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="rule-start">
            First / next date
          </label>
          <input
            id="rule-start"
            className={fieldClass}
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button type="submit" disabled={!valid}>
          Add recurring item
        </Button>
      </div>
    </form>
  )
}
