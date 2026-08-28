"use client";
import { Suspense } from "react";
import Link from "next/link";

function SignUpContent() {
  return (
    <div className="auth-card">
      <div className="auth-card__brand">
        <h1 className="auth-card__logo">NEXUS</h1>
        <p className="auth-card__tagline">by KyleDev Software Systems</p>
      </div>
      <h2 className="auth-card__title">Get access to NEXUS</h2>
      <p className="auth-card__desc">
        NEXUS accounts are created by KyleDev Software Systems when you purchase a licence.
        If you have received an invitation email, use the link in that email to sign in.
      </p>
      <p className="auth-card__footer">
        Already have access?{" "}
        <Link href="/sign-in" className="auth-card__link">Sign in here</Link>
      </p>
      <p className="auth-card__footer" style={{ marginTop: "0.5rem" }}>
        <a href="mailto:hello@kyledev.site" className="auth-card__link">Contact KyleDev to get started</a>
      </p>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="auth-card"><p>Loading...</p></div>}>
      <SignUpContent />
    </Suspense>
  );
}
