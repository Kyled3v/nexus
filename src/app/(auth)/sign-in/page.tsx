"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";

function SignInForm() {
  const searchParams = useSearchParams();
  const next         = searchParams.get("next") ?? "/";
  const [email,   setEmail]   = useState("");
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await authClient.signIn.magicLink({
      email,
      callbackURL: next,
    });
    setLoading(false);
    if (result.error) {
      setError(result.error.message ?? "Failed to send sign-in link.");
      return;
    }
    setSent(true);
  }

  return (
    <div className="auth-card">
      <div className="auth-card__brand">
        <h1 className="auth-card__logo">NEXUS</h1>
        <p className="auth-card__tagline">by KyleDev Software Systems</p>
      </div>
      <h2 className="auth-card__title">Sign in to your account</h2>

      {sent ? (
        <div className="auth-card__success">
          A sign-in link has been sent to <strong>{email}</strong>.
          Check your inbox and click the link to continue.
          <br /><br />
          <small>Check your junk/spam folder if you do not see it.</small>
        </div>
      ) : (
        <>
          {error && <div className="auth-card__error" role="alert">{error}</div>}
          <form onSubmit={handleSubmit} className="auth-card__form">
            <div className="form-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email" type="email" autoComplete="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>
            <button type="submit" className="btn btn--primary btn--md auth-card__submit" disabled={loading}>
              {loading ? <span className="btn__spinner" /> : null}
              {loading ? "Sending link..." : "Send sign-in link"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="auth-card"><p>Loading...</p></div>}>
      <SignInForm />
    </Suspense>
  );
}
