"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth/client";

function SignInForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const next         = searchParams.get("next") ?? "/";
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn.email({ email, password });
    setLoading(false);
    if (result.error) {
      setError(result.error.message ?? "Sign in failed.");
    } else {
      router.push(next);
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-card__brand">
        <h1 className="auth-card__logo">NEXUS</h1>
        <p className="auth-card__tagline">by KyleDev Software Systems</p>
      </div>
      <h2 className="auth-card__title">Sign in to your account</h2>
      {error && <div className="auth-card__error" role="alert">{error}</div>}
      <form onSubmit={handleSubmit} className="auth-card__form">
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <div className="auth-card__forgot">
          <Link href="/forgot-password" className="auth-card__link">Forgot password?</Link>
        </div>
        <button type="submit" className="btn btn--primary btn--md auth-card__submit" disabled={loading}>
          {loading ? <span className="btn__spinner" /> : null}
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="auth-card__footer">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="auth-card__link">Create one</Link>
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="auth-card"><p>Loading…</p></div>}>
      <SignInForm />
    </Suspense>
  );
}
