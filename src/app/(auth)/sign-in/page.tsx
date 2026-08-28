"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";

type Step = "email" | "otp";
type Method = "otp" | "magic";

function SignInForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const next         = searchParams.get("next") ?? "/";

  const [step,    setStep]    = useState<Step>("email");
  const [method,  setMethod]  = useState<Method>("otp");
  const [email,   setEmail]   = useState("");
  const [otp,     setOtp]     = useState("");
  const [remember, setRemember] = useState(false);
  const [error,   setError]   = useState("");
  const [info,    setInfo]    = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (method === "otp") {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });
      setLoading(false);
      if (result.error) {
        setError(result.error.message ?? "Failed to send code.");
        return;
      }
      setInfo("A 6-digit code was sent to " + email);
      setStep("otp");
    } else {
      const result = await authClient.signIn.magicLink({ email, callbackURL: next });
      setLoading(false);
      if (result.error) {
        setError(result.error.message ?? "Failed to send magic link.");
        return;
      }
      setInfo("A sign-in link was sent to " + email + ". Check your inbox.");
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await authClient.emailOtp.verifyEmail({ email, otp });
    setLoading(false);
    if (result.error) {
      setError(result.error.message ?? "Invalid or expired code.");
      return;
    }
    router.push(next);
  }

  return (
    <div className="auth-card">
      <div className="auth-card__brand">
        <h1 className="auth-card__logo">NEXUS</h1>
        <p className="auth-card__tagline">by KyleDev Software Systems</p>
      </div>

      {step === "email" && (
        <>
          <h2 className="auth-card__title">Sign in to your account</h2>
          {error && <div className="auth-card__error" role="alert">{error}</div>}
          {info  && <div className="auth-card__success">{info}</div>}

          <form onSubmit={handleEmailSubmit} className="auth-card__form">
            <div className="form-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email" type="email" autoComplete="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>

            <div className="auth-method-toggle">
              <p className="auth-method-toggle__label">How would you like to sign in?</p>
              <div className="auth-method-toggle__options">
                <label className={["auth-method-option", method === "otp" ? "auth-method-option--active" : ""].join(" ").trim()}>
                  <input type="radio" name="method" value="otp" checked={method === "otp"} onChange={() => setMethod("otp")} />
                  <span className="auth-method-option__title">Email code</span>
                  <span className="auth-method-option__desc">6-digit code sent to your email</span>
                </label>
                <label className={["auth-method-option", method === "magic" ? "auth-method-option--active" : ""].join(" ").trim()}>
                  <input type="radio" name="method" value="magic" checked={method === "magic"} onChange={() => setMethod("magic")} />
                  <span className="auth-method-option__title">Magic link</span>
                  <span className="auth-method-option__desc">One-click sign-in link via email</span>
                </label>
              </div>
            </div>

            <button type="submit" className="btn btn--primary btn--md auth-card__submit" disabled={loading}>
              {loading ? <span className="btn__spinner" /> : null}
              {loading ? "Sending…" : method === "otp" ? "Send code" : "Send magic link"}
            </button>
          </form>
        </>
      )}

      {step === "otp" && (
        <>
          <h2 className="auth-card__title">Enter your code</h2>
          {error && <div className="auth-card__error" role="alert">{error}</div>}
          {info  && <div className="auth-card__success">{info}</div>}

          <form onSubmit={handleOtpSubmit} className="auth-card__form">
            <div className="form-field">
              <label htmlFor="otp">6-digit code</label>
              <input
                id="otp" type="text" inputMode="numeric" pattern="[0-9]{6}"
                maxLength={6} autoComplete="one-time-code" required
                value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="otp-input"
              />
            </div>

            <label className="auth-remember">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span>Remember this device for 30 days</span>
            </label>

            <button type="submit" className="btn btn--primary btn--md auth-card__submit" disabled={loading || otp.length !== 6}>
              {loading ? <span className="btn__spinner" /> : null}
              {loading ? "Verifying…" : "Sign in"}
            </button>

            <button type="button" className="btn btn--ghost btn--md auth-card__submit" onClick={() => { setStep("email"); setOtp(""); setError(""); }}>
              Use a different email
            </button>
          </form>
        </>
      )}
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
