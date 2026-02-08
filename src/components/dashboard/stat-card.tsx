import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          {trend && (
            <div
              className={cn(
                "flex items-center text-xs font-medium",
                trend.direction === "up" && "text-destructive",
                trend.direction === "down" && "text-green-600"
              )}
            >
              {trend.direction === "up" ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : trend.direction === "down" ? (
                <TrendingDown className="h-3 w-3 mr-1" />
              ) : null}
              {trend.value}%
            </div>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
