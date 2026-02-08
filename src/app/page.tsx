import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Coffee,
  Clock,
  TrendingUp,
  Target,
  Sparkles,
  Users,
  Check,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "Time Cost Calculator",
    description:
      "See how many hours you work to pay for your daily habits. That $5 coffee? 12 minutes of your life.",
  },
  {
    icon: TrendingUp,
    title: "Spending Projections",
    description:
      "Visualize your 5-year spending with investment growth. Small daily habits add up to big numbers.",
  },
  {
    icon: Sparkles,
    title: "AI Insights",
    description:
      "Get personalized insights powered by Claude AI. Discover patterns and get actionable tips.",
  },
  {
    icon: Target,
    title: "Goal Tracking",
    description:
      "Set savings or reduction goals and track your progress with beautiful visualizations.",
  },
  {
    icon: Users,
    title: "Social Features",
    description:
      "Connect with friends and share your progress. Privacy-first: share percentages, not dollars.",
  },
  {
    icon: Coffee,
    title: "Habit Categories",
    description:
      "Track coffee, food, transport, subscriptions, and more. Quick-add for frequent purchases.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Get started with basic tracking",
    features: ["5 habits", "100 entries/month", "10 AI insights/month", "Basic charts"],
  },
  {
    name: "Pro",
    price: "$5.99",
    period: "/mo",
    description: "For serious habit trackers",
    features: [
      "25 habits",
      "Unlimited entries",
      "100 AI insights/month",
      "Advanced charts",
      "Goal tracking",
    ],
    popular: true,
  },
  {
    name: "Premium",
    price: "$12.99",
    period: "/mo",
    description: "Everything, unlimited",
    features: [
      "Unlimited habits",
      "Unlimited entries",
      "Unlimited AI insights",
      "API access",
      "Family sharing (up to 5)",
      "Priority support",
    ],
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Coffee className="h-6 w-6" />
            HabitCost
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            See the{" "}
            <span className="text-primary">real cost</span>
            <br />
            of your daily habits
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Transform how you think about spending by seeing costs in terms of
            time worked, not just dollars. Track habits, set goals, and get
            AI-powered insights.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/login">
                Start for Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <p className="text-3xl font-bold text-primary">$6,977</p>
              <p className="text-sm text-muted-foreground">
                5-year cost of $100/mo coffee habit
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">208 hrs</p>
              <p className="text-sm text-muted-foreground">
                Time worked for that habit at $25/hr
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">7%</p>
              <p className="text-sm text-muted-foreground">
                Investment return factored in
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to take control
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="p-2 w-fit rounded-lg bg-primary/10 mb-2">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Start free and upgrade when you need more. Cancel anytime.
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={plan.popular ? "border-primary shadow-lg" : ""}
              >
                <CardHeader>
                  {plan.popular && (
                    <p className="text-sm font-medium text-primary mb-2">
                      Most Popular
                    </p>
                  )}
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <p className="text-3xl font-bold">
                    {plan.price}
                    {plan.period && (
                      <span className="text-lg font-normal text-muted-foreground">
                        {plan.period}
                      </span>
                    )}
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href="/login">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to see where your money really goes?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join thousands of users who have transformed their spending habits
            with HabitCost.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/login">
              Start Tracking for Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Coffee className="h-5 w-5" />
              <span className="font-semibold">HabitCost</span>
            </div>
            <p className="text-sm text-muted-foreground">
              2024 HabitCost. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
