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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  CreditCard,
  Shield,
  Bell,
  Check,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  hourlyWage: string | null;
  currency: string | null;
  subscriptionTier: string;
  subscriptionEndsAt: Date | null;
  privacyShareProgress: boolean;
  privacyShareAmounts: boolean;
}

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    description: "Get started with basic tracking",
    features: ["5 habits", "100 entries/month", "10 AI insights/month"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$5.99/mo",
    description: "For serious habit trackers",
    features: [
      "25 habits",
      "Unlimited entries",
      "100 AI insights/month",
      "Advanced charts",
      "Goal tracking",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "$12.99/mo",
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

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [hourlyWage, setHourlyWage] = useState("");
  const [shareProgress, setShareProgress] = useState(false);
  const [shareAmounts, setShareAmounts] = useState(false);

  useEffect(() => {
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setName(data.name || "");
        setHourlyWage(data.hourlyWage || "");
        setShareProgress(data.privacyShareProgress || false);
        setShareAmounts(data.privacyShareAmounts || false);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load user:", err);
        setLoading(false);
      });
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          hourlyWage,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success("Profile saved!");
    } catch (error) {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const savePrivacy = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          privacyShareProgress: shareProgress,
          privacyShareAmounts: shareAmounts,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success("Privacy settings saved!");
    } catch (error) {
      toast.error("Failed to save privacy settings");
    } finally {
      setSaving(false);
    }
  };

  const handleUpgrade = async (plan: "pro" | "premium") => {
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (!res.ok) throw new Error("Failed to create checkout");

      const { url } = await res.json();
      window.location.href = url;
    } catch (error) {
      toast.error("Failed to start checkout");
    }
  };

  const handleManageBilling = async () => {
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });

      if (!res.ok) throw new Error("Failed to create portal session");

      const { url } = await res.json();
      window.location.href = url;
    } catch (error) {
      toast.error("Failed to open billing portal");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="hourlyWage">Hourly Wage</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="hourlyWage"
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-8"
                    value={hourlyWage}
                    onChange={(e) => setHourlyWage(e.target.value)}
                    placeholder="25.00"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Used to calculate the time cost of your spending
                </p>
              </div>

              <Button onClick={saveProfile} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                You are currently on the{" "}
                <Badge variant="secondary" className="capitalize">
                  {user?.subscriptionTier}
                </Badge>{" "}
                plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user?.subscriptionTier !== "free" && user?.subscriptionEndsAt && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    Next billing date:{" "}
                    {new Date(user.subscriptionEndsAt).toLocaleDateString()}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={handleManageBilling}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Manage Subscription
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = user?.subscriptionTier === plan.id;
              const isUpgrade =
                (plan.id === "pro" && user?.subscriptionTier === "free") ||
                (plan.id === "premium" &&
                  (user?.subscriptionTier === "free" ||
                    user?.subscriptionTier === "pro"));

              return (
                <Card
                  key={plan.id}
                  className={isCurrent ? "border-primary" : ""}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{plan.name}</CardTitle>
                      {isCurrent && (
                        <Badge variant="secondary">Current</Badge>
                      )}
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                    <p className="text-2xl font-bold">{plan.price}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {isUpgrade && (
                      <Button
                        className="w-full mt-4"
                        onClick={() =>
                          handleUpgrade(plan.id as "pro" | "premium")
                        }
                      >
                        Upgrade to {plan.name}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Control what information is shared with friends
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Share Progress</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow friends to see your progress percentages
                  </p>
                </div>
                <Switch
                  checked={shareProgress}
                  onCheckedChange={setShareProgress}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Share Amounts</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow friends to see actual dollar amounts
                  </p>
                </div>
                <Switch
                  checked={shareAmounts}
                  onCheckedChange={setShareAmounts}
                />
              </div>

              <Button onClick={savePrivacy} disabled={saving}>
                {saving ? "Saving..." : "Save Privacy Settings"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Export</CardTitle>
              <CardDescription>
                Download all your data in JSON format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline">Export My Data</Button>
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Permanently delete your account and all data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive">Delete Account</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
