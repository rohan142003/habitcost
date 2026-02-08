import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { formatTimeCost, calculateTimeCost } from "@/lib/calculations";

interface TimeCostDisplayProps {
  totalSpent: number;
  hourlyWage: number;
  period?: string;
}

export function TimeCostDisplay({
  totalSpent,
  hourlyWage,
  period = "this month",
}: TimeCostDisplayProps) {
  const hoursWorked = calculateTimeCost(totalSpent, hourlyWage);
  const formattedTime = formatTimeCost(hoursWorked);

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Time Worked {period}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-primary">{formattedTime}</div>
        <p className="text-sm text-muted-foreground mt-1">
          At ${hourlyWage}/hour, you worked{" "}
          <span className="font-medium">{formattedTime}</span> to pay for your
          habits {period}.
        </p>
      </CardContent>
    </Card>
  );
}
