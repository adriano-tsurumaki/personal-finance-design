export type EntryKind = "income" | "expense" | "milestone"

export type Category =
  | "Salary"
  | "Freelance"
  | "Investment"
  | "Housing"
  | "Food"
  | "Transport"
  | "Shopping"
  | "Health"
  | "Entertainment"
  | "Savings"

export interface RawEntry {
  id: string
  /** ISO date string */
  date: string
  kind: EntryKind
  title: string
  description?: string
  category?: Category
  /** Positive number. Sign is derived from kind. */
  amount?: number
}

export interface TimelineEntry extends RawEntry {
  /** Running account balance after this entry (chronological order). */
  balance: number
}

export interface MonthGroup {
  key: string
  label: string
  income: number
  expense: number
  entries: TimelineEntry[]
}

// Starting balance before the first recorded entry.
export const OPENING_BALANCE = 4200

const RAW_ENTRIES: RawEntry[] = [
  { id: "1", date: "2026-01-02", kind: "income", title: "Monthly Salary", description: "Northwind Labs — payroll", category: "Salary", amount: 5200 },
  { id: "2", date: "2026-01-03", kind: "expense", title: "Rent", description: "Apartment 4B", category: "Housing", amount: 1850 },
  { id: "3", date: "2026-01-06", kind: "expense", title: "Groceries", description: "Whole Foods", category: "Food", amount: 214.32 },
  { id: "4", date: "2026-01-11", kind: "income", title: "Design Project", description: "Brand refresh for Atlas Co.", category: "Freelance", amount: 1400 },
  { id: "5", date: "2026-01-14", kind: "expense", title: "Transit Pass", category: "Transport", amount: 96 },
  { id: "6", date: "2026-01-19", kind: "expense", title: "New Headphones", description: "Sony WH-1000XM5", category: "Shopping", amount: 348 },
  { id: "7", date: "2026-01-24", kind: "expense", title: "Dinner & Show", category: "Entertainment", amount: 132.5 },
  { id: "m1", date: "2026-01-31", kind: "milestone", title: "Emergency fund fully topped up", description: "Reached 3 months of expenses set aside." },

  { id: "8", date: "2026-02-02", kind: "income", title: "Monthly Salary", description: "Northwind Labs — payroll", category: "Salary", amount: 5200 },
  { id: "9", date: "2026-02-03", kind: "expense", title: "Rent", description: "Apartment 4B", category: "Housing", amount: 1850 },
  { id: "10", date: "2026-02-05", kind: "income", title: "Dividend Payout", description: "Index fund quarterly", category: "Investment", amount: 312.4 },
  { id: "11", date: "2026-02-09", kind: "expense", title: "Groceries", category: "Food", amount: 268.9 },
  { id: "12", date: "2026-02-13", kind: "expense", title: "Doctor Visit", description: "Annual checkup", category: "Health", amount: 175 },
  { id: "13", date: "2026-02-18", kind: "expense", title: "Weekend Trip", description: "Train + hotel", category: "Transport", amount: 520 },
  { id: "14", date: "2026-02-27", kind: "income", title: "Freelance Retainer", description: "Atlas Co. monthly", category: "Freelance", amount: 900 },

  { id: "15", date: "2026-03-02", kind: "income", title: "Monthly Salary", description: "Northwind Labs — payroll", category: "Salary", amount: 5200 },
  { id: "16", date: "2026-03-03", kind: "expense", title: "Rent", description: "Apartment 4B", category: "Housing", amount: 1850 },
  { id: "m2", date: "2026-03-04", kind: "milestone", title: "Crossed $12,000 in savings", description: "Net worth milestone reached ahead of schedule." },
  { id: "17", date: "2026-03-08", kind: "expense", title: "Groceries", category: "Food", amount: 241.15 },
  { id: "18", date: "2026-03-12", kind: "expense", title: "Gym Membership", description: "Annual renewal", category: "Health", amount: 420 },
  { id: "19", date: "2026-03-16", kind: "income", title: "Bonus", description: "Q1 performance bonus", category: "Salary", amount: 1500 },
  { id: "20", date: "2026-03-21", kind: "expense", title: "Furniture", description: "Standing desk + chair", category: "Shopping", amount: 640 },
  { id: "21", date: "2026-03-28", kind: "expense", title: "Streaming Bundle", category: "Entertainment", amount: 47.97 },
]

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

export function formatCompactCurrency(value: number): string {
  return compactCurrencyFormatter.format(value)
}

export function formatSignedCurrency(value: number, kind: EntryKind): string {
  if (kind === "milestone" || !value) return ""
  const sign = kind === "income" ? "+" : "\u2212"
  return `${sign}${currencyFormatter.format(value)}`
}

function signedAmount(entry: RawEntry): number {
  if (!entry.amount) return 0
  return entry.kind === "income" ? entry.amount : -entry.amount
}

/** Entries in chronological order with a running balance attached. */
export function getTimeline(): TimelineEntry[] {
  const sorted = [...RAW_ENTRIES].sort((a, b) => a.date.localeCompare(b.date))
  let balance = OPENING_BALANCE
  return sorted.map((entry) => {
    balance += signedAmount(entry)
    return { ...entry, balance: Math.round(balance * 100) / 100 }
  })
}

/** Timeline grouped by month, most recent month first, newest entries first. */
export function getMonthGroups(): MonthGroup[] {
  const timeline = getTimeline()
  const map = new Map<string, MonthGroup>()

  for (const entry of timeline) {
    const key = entry.date.slice(0, 7)
    if (!map.has(key)) {
      const label = new Date(`${key}-01T00:00:00`).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
      map.set(key, { key, label, income: 0, expense: 0, entries: [] })
    }
    const group = map.get(key)!
    if (entry.kind === "income") group.income += entry.amount ?? 0
    if (entry.kind === "expense") group.expense += entry.amount ?? 0
    group.entries.push(entry)
  }

  return Array.from(map.values())
    .sort((a, b) => b.key.localeCompare(a.key))
    .map((group) => ({
      ...group,
      entries: group.entries.sort((a, b) => b.date.localeCompare(a.date)),
    }))
}

export interface FinanceSummary {
  currentBalance: number
  openingBalance: number
  totalIncome: number
  totalExpense: number
  net: number
  savingsRate: number
  entryCount: number
  rangeLabel: string
}

export function getSummary(): FinanceSummary {
  const timeline = getTimeline()
  const totalIncome = timeline.reduce((sum, e) => sum + (e.kind === "income" ? e.amount ?? 0 : 0), 0)
  const totalExpense = timeline.reduce((sum, e) => sum + (e.kind === "expense" ? e.amount ?? 0 : 0), 0)
  const currentBalance = timeline.length ? timeline[timeline.length - 1].balance : OPENING_BALANCE
  const net = totalIncome - totalExpense
  const savingsRate = totalIncome ? net / totalIncome : 0

  const first = timeline[0]
  const last = timeline[timeline.length - 1]
  const rangeLabel =
    first && last
      ? `${new Date(`${first.date}T00:00:00`).toLocaleDateString("en-US", { month: "short", year: "numeric" })} – ${new Date(
          `${last.date}T00:00:00`,
        ).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
      : ""

  return {
    currentBalance,
    openingBalance: OPENING_BALANCE,
    totalIncome,
    totalExpense,
    net,
    savingsRate,
    entryCount: timeline.filter((e) => e.kind !== "milestone").length,
    rangeLabel,
  }
}

/** Chronological balance points for the sparkline / trend. */
export function getBalanceSeries(): { date: string; balance: number }[] {
  return getTimeline().map((e) => ({ date: e.date, balance: e.balance }))
}

export interface MonthlyStatement {
  key: string
  label: string
  income: number
  expense: number
  net: number
  savingsRate: number
  openingBalance: number
  closingBalance: number
  transactionCount: number
  /** Entries newest-first, ready for display in the timeline. */
  entries: TimelineEntry[]
  /** Chronological balance points within the month, for the sparkline. */
  balanceSeries: { date: string; balance: number }[]
}

/** One statement per month, oldest month first. */
export function getMonthlyStatements(): MonthlyStatement[] {
  const timeline = getTimeline() // chronological, running balance attached
  const map = new Map<string, TimelineEntry[]>()

  for (const entry of timeline) {
    const key = entry.date.slice(0, 7)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(entry)
  }

  return Array.from(map.keys())
    .sort((a, b) => a.localeCompare(b))
    .map((key) => {
      const chron = map.get(key)!
      const income = chron.reduce((s, e) => s + (e.kind === "income" ? e.amount ?? 0 : 0), 0)
      const expense = chron.reduce((s, e) => s + (e.kind === "expense" ? e.amount ?? 0 : 0), 0)
      const net = income - expense
      const closingBalance = chron[chron.length - 1].balance
      // closing = opening + net (milestones carry no amount), so:
      const openingBalance = Math.round((closingBalance - net) * 100) / 100
      const label = new Date(`${key}-01T00:00:00`).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })

      return {
        key,
        label,
        income,
        expense,
        net,
        savingsRate: income ? net / income : 0,
        openingBalance,
        closingBalance,
        transactionCount: chron.filter((e) => e.kind !== "milestone").length,
        entries: [...chron].sort((a, b) => b.date.localeCompare(a.date)),
        balanceSeries: chron.map((e) => ({ date: e.date, balance: e.balance })),
      }
    })
}

/* -------------------------------------------------------------------------- */
/* Recurring rules (subscriptions, rent, salary, ...)                         */
/* -------------------------------------------------------------------------- */

export type Frequency = "weekly" | "monthly" | "quarterly" | "yearly"

export interface RecurringRule {
  id: string
  title: string
  kind: "income" | "expense"
  category: Category
  amount: number
  frequency: Frequency
  /** ISO date used as the seed for computing future occurrences. */
  startDate: string
  active: boolean
  description?: string
}

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
}

const RECURRING_RULES: RecurringRule[] = [
  { id: "r-salary", title: "Monthly Salary", kind: "income", category: "Salary", amount: 5200, frequency: "monthly", startDate: "2026-01-02", active: true, description: "Northwind Labs — payroll" },
  { id: "r-retainer", title: "Freelance Retainer", kind: "income", category: "Freelance", amount: 900, frequency: "monthly", startDate: "2026-01-27", active: true, description: "Atlas Co. monthly" },
  { id: "r-dividend", title: "Index Fund Dividend", kind: "income", category: "Investment", amount: 312.4, frequency: "quarterly", startDate: "2026-02-05", active: true },
  { id: "r-rent", title: "Rent", kind: "expense", category: "Housing", amount: 1850, frequency: "monthly", startDate: "2026-01-03", active: true, description: "Apartment 4B" },
  { id: "r-internet", title: "Internet & Phone", kind: "expense", category: "Housing", amount: 84.9, frequency: "monthly", startDate: "2026-01-10", active: true },
  { id: "r-gym", title: "Gym Membership", kind: "expense", category: "Health", amount: 45, frequency: "monthly", startDate: "2026-01-12", active: true },
  { id: "r-streaming", title: "Streaming Bundle", kind: "expense", category: "Entertainment", amount: 47.97, frequency: "monthly", startDate: "2026-01-28", active: true, description: "Netflix + Spotify + Max" },
  { id: "r-cloud", title: "Cloud Storage", kind: "expense", category: "Shopping", amount: 9.99, frequency: "monthly", startDate: "2026-01-15", active: false },
  { id: "r-insurance", title: "Renter's Insurance", kind: "expense", category: "Housing", amount: 240, frequency: "yearly", startDate: "2026-02-01", active: true },
]

export function getRecurringRules(): RecurringRule[] {
  return RECURRING_RULES.map((r) => ({ ...r }))
}

/** Normalize any cadence to an average monthly amount. */
export function monthlyEquivalent(rule: RecurringRule): number {
  switch (rule.frequency) {
    case "weekly":
      return (rule.amount * 52) / 12
    case "monthly":
      return rule.amount
    case "quarterly":
      return rule.amount / 3
    case "yearly":
      return rule.amount / 12
  }
}

function advance(date: Date, frequency: Frequency, count = 1): Date {
  const d = new Date(date)
  switch (frequency) {
    case "weekly":
      d.setDate(d.getDate() + 7 * count)
      break
    case "monthly":
      d.setMonth(d.getMonth() + count)
      break
    case "quarterly":
      d.setMonth(d.getMonth() + 3 * count)
      break
    case "yearly":
      d.setFullYear(d.getFullYear() + count)
      break
  }
  return d
}

/** First occurrence on or after `from` (defaults to today). */
export function nextOccurrence(rule: RecurringRule, from: Date = new Date()): Date {
  const anchor = new Date(from)
  anchor.setHours(0, 0, 0, 0)
  let d = new Date(`${rule.startDate}T00:00:00`)
  let guard = 0
  while (d < anchor && guard < 5000) {
    d = advance(d, rule.frequency)
    guard++
  }
  return d
}

export interface UpcomingOccurrence {
  rule: RecurringRule
  date: Date
}

/** Active-rule occurrences within the next `days` days, sorted by date. */
export function getUpcomingOccurrences(
  rules: RecurringRule[],
  days = 45,
  from: Date = new Date(),
): UpcomingOccurrence[] {
  const start = new Date(from)
  start.setHours(0, 0, 0, 0)
  const horizon = new Date(start)
  horizon.setDate(horizon.getDate() + days)

  const out: UpcomingOccurrence[] = []
  for (const rule of rules) {
    if (!rule.active) continue
    let d = nextOccurrence(rule, start)
    let guard = 0
    while (d <= horizon && guard < 100) {
      out.push({ rule, date: new Date(d) })
      d = advance(d, rule.frequency)
      guard++
    }
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime())
}

export interface RecurringSummary {
  monthlyIncome: number
  monthlyExpense: number
  monthlyNet: number
  activeCount: number
}

export function getRecurringSummary(rules: RecurringRule[]): RecurringSummary {
  let monthlyIncome = 0
  let monthlyExpense = 0
  let activeCount = 0
  for (const rule of rules) {
    if (!rule.active) continue
    activeCount++
    const m = monthlyEquivalent(rule)
    if (rule.kind === "income") monthlyIncome += m
    else monthlyExpense += m
  }
  return {
    monthlyIncome,
    monthlyExpense,
    monthlyNet: monthlyIncome - monthlyExpense,
    activeCount,
  }
}

/* -------------------------------------------------------------------------- */
/* Weekly spending goal                                                       */
/* -------------------------------------------------------------------------- */

/** Suggested default weekly spending budget (discretionary). */
export const DEFAULT_WEEKLY_BUDGET = 400

export interface WeekBucket {
  /** ISO date of the week's Monday, also used as the key. */
  key: string
  start: string
  end: string
  /** Human label, e.g. "Mar 23 – 29". */
  label: string
  total: number
  count: number
}

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

/** Monday 00:00 of the week containing `date`. */
function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = (d.getDay() + 6) % 7 // Monday = 0 ... Sunday = 6
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

function weekLabel(start: Date, end: Date): string {
  const startStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  const sameMonth = start.getMonth() === end.getMonth()
  const endStr = end.toLocaleDateString("en-US", {
    month: sameMonth ? undefined : "short",
    day: "numeric",
  })
  return `${startStr} – ${endStr}`
}

/** Expenses bucketed by ISO week (Mon–Sun), oldest first. */
export function getWeeklySpending(): WeekBucket[] {
  const expenses = getTimeline().filter((e) => e.kind === "expense" && e.amount)
  const map = new Map<string, WeekBucket>()

  for (const entry of expenses) {
    const start = startOfWeek(new Date(`${entry.date}T00:00:00`))
    const key = toISODate(start)
    if (!map.has(key)) {
      const end = new Date(start)
      end.setDate(end.getDate() + 6)
      map.set(key, {
        key,
        start: key,
        end: toISODate(end),
        label: weekLabel(start, end),
        total: 0,
        count: 0,
      })
    }
    const bucket = map.get(key)!
    bucket.total += entry.amount ?? 0
    bucket.count += 1
  }

  return Array.from(map.values())
    .map((b) => ({ ...b, total: Math.round(b.total * 100) / 100 }))
    .sort((a, b) => a.key.localeCompare(b.key))
}

export interface WeeklyGoalStatus {
  budget: number
  /** Most recent weeks (oldest → newest), capped to `weeksBack`. */
  weeks: WeekBucket[]
  /** The latest week with activity — treated as "this week". */
  current: WeekBucket | null
  spent: number
  remaining: number
  /** 0..1 (can exceed 1 when over budget). */
  progress: number
  over: boolean
  dailyBudget: number
  avgWeekly: number
  onTrackWeeks: number
  trackedWeeks: number
}

export function getWeeklyGoalStatus(budget: number, weeksBack = 8): WeeklyGoalStatus {
  const all = getWeeklySpending()
  const weeks = all.slice(-weeksBack)
  const current = weeks.length ? weeks[weeks.length - 1] : null
  const spent = current ? current.total : 0
  const remaining = budget - spent
  const progress = budget > 0 ? spent / budget : 0
  const avgWeekly = weeks.length
    ? weeks.reduce((sum, w) => sum + w.total, 0) / weeks.length
    : 0
  const onTrackWeeks = weeks.filter((w) => w.total <= budget).length

  return {
    budget,
    weeks,
    current,
    spent,
    remaining,
    progress,
    over: spent > budget,
    dailyBudget: budget / 7,
    avgWeekly,
    onTrackWeeks,
    trackedWeeks: weeks.length,
  }
}
