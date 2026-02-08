// Time cost calculation
export function calculateTimeCost(amount: number, hourlyWage: number): number {
  if (hourlyWage <= 0) return 0;
  return amount / hourlyWage;
}

// Format time duration
export function formatTimeCost(hours: number): string {
  if (hours < 1 / 60) {
    return "less than a minute";
  }
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }
  if (hours < 24) {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    if (minutes === 0) {
      return `${wholeHours} hour${wholeHours !== 1 ? "s" : ""}`;
    }
    return `${wholeHours}h ${minutes}m`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  if (remainingHours === 0) {
    return `${days} day${days !== 1 ? "s" : ""}`;
  }
  return `${days}d ${remainingHours}h`;
}

// Project spending over time
export function projectSpending(
  monthlyAmount: number,
  months: number
): number {
  return monthlyAmount * months;
}

// Project spending with investment growth (7% annual return)
export function projectSpendingWithGrowth(
  monthlyAmount: number,
  months: number,
  annualReturn: number = 0.07
): number {
  const monthlyRate = annualReturn / 12;
  // Future value of monthly contributions
  // FV = PMT * ((1 + r)^n - 1) / r
  if (monthlyRate === 0) return monthlyAmount * months;
  return monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
}

// Calculate daily/weekly/monthly/yearly totals
export function calculatePeriodTotals(
  entries: { amount: string | number; date: Date }[]
) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  let daily = 0;
  let weekly = 0;
  let monthly = 0;
  let yearly = 0;

  for (const entry of entries) {
    const amount = typeof entry.amount === "string" ? parseFloat(entry.amount) : entry.amount;
    const date = new Date(entry.date);

    if (date >= startOfYear) {
      yearly += amount;
      if (date >= startOfMonth) {
        monthly += amount;
        if (date >= startOfWeek) {
          weekly += amount;
          if (date >= startOfDay) {
            daily += amount;
          }
        }
      }
    }
  }

  return { daily, weekly, monthly, yearly };
}

// Opportunity cost comparisons
export const opportunityCosts = [
  { name: "Cup of coffee", amount: 5 },
  { name: "Nice dinner out", amount: 50 },
  { name: "Weekend getaway", amount: 500 },
  { name: "New iPhone", amount: 1000 },
  { name: "Vacation", amount: 2500 },
  { name: "Used car", amount: 10000 },
  { name: "Down payment on house", amount: 50000 },
];

export function getOpportunityCost(amount: number): string | null {
  for (let i = opportunityCosts.length - 1; i >= 0; i--) {
    if (amount >= opportunityCosts[i].amount) {
      const count = Math.floor(amount / opportunityCosts[i].amount);
      return `${count} ${opportunityCosts[i].name}${count > 1 ? "s" : ""}`;
    }
  }
  return null;
}

// Calculate spending trend
export function calculateTrend(
  currentPeriod: number,
  previousPeriod: number
): { value: number; direction: "up" | "down" | "neutral" } {
  if (previousPeriod === 0) {
    return { value: currentPeriod > 0 ? 100 : 0, direction: "up" };
  }
  const change = ((currentPeriod - previousPeriod) / previousPeriod) * 100;
  return {
    value: Math.abs(Math.round(change)),
    direction: change > 0 ? "up" : change < 0 ? "down" : "neutral",
  };
}

// Format currency
export function formatCurrency(
  amount: number,
  currency: string = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Subscription tier limits
export const tierLimits = {
  free: {
    maxHabits: 5,
    maxEntriesPerMonth: 100,
    maxAiInsightsPerMonth: 10,
  },
  pro: {
    maxHabits: 25,
    maxEntriesPerMonth: Infinity,
    maxAiInsightsPerMonth: 100,
  },
  premium: {
    maxHabits: Infinity,
    maxEntriesPerMonth: Infinity,
    maxAiInsightsPerMonth: Infinity,
  },
} as const;

export type SubscriptionTier = keyof typeof tierLimits;
