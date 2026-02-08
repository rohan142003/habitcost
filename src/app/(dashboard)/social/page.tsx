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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  UserPlus,
  Check,
  X,
  UserMinus,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

interface Friend {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface Friendship {
  id: string;
  status: string;
  isRequester: boolean;
  friend: Friend;
  createdAt: Date;
}

export default function SocialPage() {
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadFriendships();
  }, []);

  const loadFriendships = async () => {
    try {
      const res = await fetch("/api/friends");
      const data = await res.json();
      setFriendships(data);
    } catch (err) {
      console.error("Failed to load friendships:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send friend request");
      }

      toast.success("Friend request sent!");
      setEmail("");
      setAddDialogOpen(false);
      loadFriendships();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send friend request"
      );
    } finally {
      setSending(false);
    }
  };

  const acceptRequest = async (friendshipId: string) => {
    try {
      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "accepted" }),
      });

      if (!res.ok) throw new Error("Failed to accept request");

      toast.success("Friend request accepted!");
      loadFriendships();
    } catch (error) {
      toast.error("Failed to accept request");
    }
  };

  const removeFriend = async (friendshipId: string) => {
    if (!confirm("Are you sure you want to remove this friend?")) return;

    try {
      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to remove friend");

      toast.success("Friend removed");
      loadFriendships();
    } catch (error) {
      toast.error("Failed to remove friend");
    }
  };

  const pendingRequests = friendships.filter(
    (f) => f.status === "pending" && !f.isRequester
  );
  const sentRequests = friendships.filter(
    (f) => f.status === "pending" && f.isRequester
  );
  const friends = friendships.filter((f) => f.status === "accepted");

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Social</h1>
          <p className="text-muted-foreground">
            Connect with friends and share your progress
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Friend
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Friend</DialogTitle>
              <DialogDescription>
                Send a friend request by email. They&apos;ll need to accept it
                before you can see each other&apos;s progress.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={sendRequest}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Friend&apos;s Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="friend@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={sending || !email}>
                  {sending ? "Sending..." : "Send Request"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Friend Requests</CardTitle>
            <CardDescription>
              People who want to connect with you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={request.friend.image || undefined} />
                    <AvatarFallback>
                      {request.friend.name?.charAt(0) ||
                        request.friend.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {request.friend.name || request.friend.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {request.friend.email}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => acceptRequest(request.id)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeFriend(request.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Sent Requests */}
      {sentRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Requests</CardTitle>
            <CardDescription>
              Waiting for them to accept
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sentRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={request.friend.image || undefined} />
                    <AvatarFallback>
                      {request.friend.name?.charAt(0) ||
                        request.friend.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {request.friend.name || request.friend.email}
                    </p>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFriend(request.id)}
                >
                  Cancel
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Friends List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Friends</CardTitle>
          <CardDescription>
            People you&apos;re connected with
          </CardDescription>
        </CardHeader>
        <CardContent>
          {friends.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No friends yet. Send a request to connect with someone!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {friends.map((friendship) => (
                <div
                  key={friendship.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={friendship.friend.image || undefined} />
                      <AvatarFallback>
                        {friendship.friend.name?.charAt(0) ||
                          friendship.friend.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {friendship.friend.name || friendship.friend.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {friendship.friend.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share Progress
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFriend(friendship.id)}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Share2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Privacy First</p>
              <p className="text-sm text-muted-foreground">
                By default, only your progress percentages are shared, not
                actual dollar amounts. You can customize this in Settings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
