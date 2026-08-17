import { MonthlyFinance } from "@/components/monthly-finance"
import { RecurringManager } from "@/components/recurring-manager"
import { WeeklyGoal } from "@/components/weekly-goal"
import {
  DEFAULT_WEEKLY_BUDGET,
  getMonthlyStatements,
  getRecurringRules,
  getWeeklySpending,
} from "@/lib/finance-data"

export default function Page() {
  const statements = getMonthlyStatements()
  const recurringRules = getRecurringRules()
  const weeks = getWeeklySpending().slice(-8)

  return (
    <main className="min-h-screen bg-background">
      <MonthlyFinance statements={statements} />
      <div className="border-t border-border" />
      <WeeklyGoal weeks={weeks} initialBudget={DEFAULT_WEEKLY_BUDGET} />
      <div className="border-t border-border" />
      <RecurringManager initialRules={recurringRules} />
    </main>
  )
}
