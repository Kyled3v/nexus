"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth/client";

export default function SignUpPage() {
  const router = useRouter();

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signUp.email({ name, email, password });
    setLoading(false);
    if (result.error) {
      setError(result.error.message ?? "Sign up failed.");
    } else {
      router.push("/");
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-card__brand">
        <h1 className="auth-card__logo">NEXUS</h1>
        <p className="auth-card__tagline">by KyleDev Software Systems</p>
      </div>

      <h2 className="auth-card__title">Create your account</h2>

      {error && (
        <div className="auth-card__error" role="alert">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="auth-card__form">
        <div className="form-field">
          <label htmlFor="name">Full name</label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Kyle Dev"
          />
        </div>

        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
          />
        </div>

        <button
          type="submit"
          className="btn btn--primary btn--md auth-card__submit"
          disabled={loading}
        >
          {loading ? <span className="btn__spinner" /> : null}
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="auth-card__footer">
        Already have an account?{" "}
        <Link href="/sign-in" className="auth-card__link">Sign in</Link>
      </p>
    </div>
  );
}
