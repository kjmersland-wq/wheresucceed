import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";

/** The signed-in user (null when signed out) and whether we have checked yet. */
export function useAccount() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setReady(true);
    });
    supabase.auth.getSession().then(({ data: s }) => {
      setUser(s.session?.user ?? null);
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return { user, ready };
}

export type SubscriptionInfo = {
  active: boolean;
  cancelAtPeriodEnd: boolean;
  periodEnd: string | null;
};

const NONE: SubscriptionInfo = { active: false, cancelAtPeriodEnd: false, periodEnd: null };

/** Premium status for the signed-in user. Canceled plans stay active until the period ends. */
export function useSubscription(userId: string | null | undefined) {
  const [info, setInfo] = useState<SubscriptionInfo>(NONE);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setInfo(NONE);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("subscriptions")
        .select("status, current_period_end, cancel_at_period_end")
        .eq("user_id", userId)
        .eq("environment", getStripeEnvironment())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      setLoading(false);
      if (!data) return setInfo(NONE);
      const future = !data.current_period_end || new Date(data.current_period_end) > new Date();
      const active =
        (["active", "trialing", "past_due"].includes(data.status) && future) ||
        (data.status === "canceled" && Boolean(data.current_period_end) && future);
      setInfo({
        active,
        cancelAtPeriodEnd: Boolean(data.cancel_at_period_end),
        periodEnd: data.current_period_end,
      });
    };
    void load();
    // The webhook can land a moment after checkout; check again briefly.
    const timer = setInterval(load, 4000);
    const stop = setTimeout(() => clearInterval(timer), 30000);
    return () => {
      cancelled = true;
      clearInterval(timer);
      clearTimeout(stop);
    };
  }, [userId]);

  return { ...info, loading };
}
