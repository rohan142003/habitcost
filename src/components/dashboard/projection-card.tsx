import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import {
  projectSpending,
  projectSpendingWithGrowth,
  formatCurrency,
  getOpportunityCost,
} from "@/lib/calculations";

interface ProjectionCardProps {
  monthlySpending: number;
  currency?: string;
}

export function ProjectionCard({
  monthlySpending,
  currency = "USD",
}: ProjectionCardProps) {
  const yearly = projectSpending(monthlySpending, 12);
  const fiveYear = projectSpending(monthlySpending, 60);
  const fiveYearWithGrowth = projectSpendingWithGrowth(monthlySpending, 60);

  const opportunityCost = getOpportunityCost(fiveYearWithGrowth);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Spending Projections
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase">Yearly</p>
            <p className="text-xl font-bold">{formatCurrency(yearly, currency)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">5 Years</p>
            <p className="text-xl font-bold">{formatCurrency(fiveYear, currency)}</p>
          </div>
        </div>

        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground uppercase mb-1">
            With 7% Investment Return
          </p>
          <p className="text-2xl font-bold text-primary">
            {formatCurrency(fiveYearWithGrowth, currency)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            in 5 years if invested instead
          </p>
        </div>

        {opportunityCost && (
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground uppercase mb-1">
              Opportunity Cost
            </p>
            <p className="text-sm font-medium">
              This could be{" "}
              <span className="text-primary">{opportunityCost}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
