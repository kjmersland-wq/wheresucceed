import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Btn, Card } from "@/components/ui-kit";
import { supabase } from "@/integrations/supabase/client";

const safePath = (v: unknown) =>
  typeof v === "string" && v.startsWith("/") && !v.startsWith("//") ? v : "/pricing";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — WhereSucceed" },
      { name: "description", content: "Sign in or create an account to use WhereSucceed Premium on any device." },
      { property: "og:title", content: "Sign in — WhereSucceed" },
      { property: "og:description", content: "Sign in to use Premium on any device." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { redirect } = Route.useSearch();
  const next = safePath(redirect);
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}${next}` },
      });
      setBusy(false);
      if (error) return setMessage(error.message);
      if (!data.session) return setMessage("Check your email and click the link to confirm your account.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setMessage(error.message);
    }
    navigate({ to: next });
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16 fade-up">
      <h1 className="text-center text-3xl">{mode === "signup" ? "Create your account" : "Sign in"}</h1>
      <p className="mt-3 text-center text-sm text-muted-foreground">
        An account keeps Premium with you on every device. The free tool needs no account.
      </p>
      <Card className="mt-8 p-6">
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm">
            Email
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-full border border-border bg-background px-4 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            Password
            <input type="password" required minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-full border border-border bg-background px-4 py-2 text-sm" />
          </label>
          <Btn type="submit" className="w-full" disabled={busy}>
            {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
          </Btn>
          {message && <p role="alert" className="text-sm text-muted-foreground">{message}</p>}
        </form>
      </Card>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
        <button type="button" className="text-accent underline-offset-4 hover:underline"
          onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setMessage(null); }}>
          {mode === "signup" ? "Sign in" : "Create an account"}
        </button>
      </p>
    </div>
  );
}
