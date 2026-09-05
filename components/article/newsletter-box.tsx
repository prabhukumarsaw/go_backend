"use client";

import { useState } from "react";
import { IconMail, IconCheck, IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function NewsletterBox() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubscribed(true);
      toast.success("Thank you for subscribing to news alerts!");
    }, 600);
  };

  return (
    <div className="rounded-xl border border-border/80 bg-card p-5 text-center shadow-xs">
      <div className="h-11 w-11 rounded-xl border border-border/80 bg-muted/30 flex items-center justify-center mx-auto mb-3 text-foreground/80">
        <IconMail className="h-5 w-5" />
      </div>
      <h3 className="font-bold text-base text-foreground tracking-tight">
        Subscribe to News
      </h3>
      <p className="text-xs text-muted-foreground mt-1 mb-4 leading-relaxed">
        Get the latest sports news from NewsSite about world, sports and politics.
      </p>

      {subscribed ? (
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 py-2.5 px-3 rounded-lg border border-emerald-500/20">
          <IconCheck className="h-4 w-4" />
          <span>Subscribed successfully!</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2.5">
          <Input
            type="email"
            placeholder="Your email address.."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-9 text-xs bg-muted/30 border-border/70"
            disabled={isSubmitting}
          />
          <Button
            type="submit"
            size="sm"
            className="w-full h-9 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-xs"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <IconLoader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Subscribe"
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
