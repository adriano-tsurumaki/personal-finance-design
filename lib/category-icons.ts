import {
  Banknote,
  Bus,
  Car,
  Clapperboard,
  Dumbbell,
  Home,
  Landmark,
  Laptop,
  type LucideIcon,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react"
import type { Category } from "@/lib/finance-data"

export const categoryIcons: Record<Category, LucideIcon> = {
  Salary: Banknote,
  Freelance: Laptop,
  Investment: Landmark,
  Housing: Home,
  Food: UtensilsCrossed,
  Transport: Bus,
  Shopping: ShoppingBag,
  Health: Dumbbell,
  Entertainment: Clapperboard,
  Savings: Car,
}
