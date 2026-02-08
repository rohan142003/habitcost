"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sparkles,
  TrendingUp,
  Lightbulb,
  Trophy,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface Insight {
  id: string;
  type: string;
  title: string;
  content: string;
  isHelpful: boolean | null;
  isRead: boolean;
  createdAt: Date;
}

const insightIcons: Record<string, React.ElementType> = {
  pattern: BarChart3,
  suggestion: Lightbulb,
  prediction: TrendingUp,
  celebration: Trophy,
};

const insightColors: Record<string, string> = {
  pattern: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  suggestion: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  prediction: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  celebration: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
};

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      const res = await fetch("/api/insights");
      const data = await res.json();
      setInsights(data);
    } catch (err) {
      console.error("Failed to load insights:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/insights", { method: "POST" });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate insights");
      }

      toast.success("New insights generated!");
      loadInsights();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate insights"
      );
    } finally {
      setGenerating(false);
    }
  };

  const markHelpful = async (insightId: string, isHelpful: boolean) => {
    try {
      await fetch(`/api/insights/${insightId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHelpful }),
      });

      setInsights(
        insights.map((i) => (i.id === insightId ? { ...i, isHelpful } : i))
      );
      toast.success("Thanks for your feedback!");
    } catch (error) {
      toast.error("Failed to submit feedback");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Insights</h1>
          <p className="text-muted-foreground">
            Personalized insights powered by Claude AI
          </p>
        </div>
        <Button onClick={generateInsights} disabled={generating}>
          {generating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Insights
            </>
          )}
        </Button>
      </div>

      {insights.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No insights yet</h3>
            <p className="text-muted-foreground mb-4 text-center max-w-md">
              Generate AI-powered insights based on your spending patterns. Make
              sure you have some spending entries first.
            </p>
            <Button onClick={generateInsights} disabled={generating}>
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Your First Insights
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {insights.map((insight) => {
            const Icon = insightIcons[insight.type] || Lightbulb;
            const colorClass = insightColors[insight.type] || insightColors.suggestion;

            return (
              <Card key={insight.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <Badge variant="secondary" className="mt-1 capitalize">
                          {insight.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{insight.content}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {new Date(insight.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Was this helpful?
                      </span>
                      <Button
                        variant={insight.isHelpful === true ? "default" : "ghost"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => markHelpful(insight.id, true)}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={insight.isHelpful === false ? "default" : "ghost"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => markHelpful(insight.id, false)}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
