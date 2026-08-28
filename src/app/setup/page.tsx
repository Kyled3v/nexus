"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();
  const [step,         setStep]         = useState(1);
  const [checking,     setChecking]     = useState(true);
  const [businessName, setBusinessName] = useState("");
  const [tradingName,  setTradingName]  = useState("");
  const [industry,     setIndustry]     = useState("");
  const [taxNumber,    setTaxNumber]    = useState("");
  const [logo,         setLogo]         = useState<File | null>(null);
  const [logoPreview,  setLogoPreview]  = useState("");
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);

  useEffect(() => {
    // Check if setup already complete
    fetch("/api/v1/auth/setup")
      .then(r => r.json())
      .then((data: { setupRequired: boolean; alreadySetup?: boolean }) => {
        if (!data.setupRequired) {
          router.replace("/");
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [router]);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError("Logo must be under 2MB."); return; }
    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    if (!businessName.trim()) { setError("Business name is required."); return; }
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("businessName", businessName.trim());
      formData.append("tradingName",  tradingName.trim());
      formData.append("industry",     industry);
      formData.append("taxNumber",    taxNumber.trim());
      if (logo) formData.append("logo", logo);

      const res  = await fetch("/api/v1/auth/setup", { method: "POST", body: formData });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok || !data.success) { setError(data.error ?? "Setup failed."); setLoading(false); return; }
      router.push("/");
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  const INDUSTRIES = [
    "Retail - General", "Retail - Paint & Hardware", "Retail - Food & Grocery",
    "Wholesale", "Manufacturing", "Services - Professional", "Services - Trade",
    "Mining & Resources", "Security", "Other",
  ];

  if (checking) {
    return (
      <div className="auth-layout">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-layout">
      <div className="setup-card">
        <div className="auth-card__brand">
          <h1 className="auth-card__logo">NEXUS</h1>
          <p className="auth-card__tagline">by KyleDev Software Systems</p>
        </div>

        <div className="setup-progress">
          <div className={["setup-progress__step", step >= 1 ? "setup-progress__step--done" : ""].join(" ").trim()}>1</div>
          <div className="setup-progress__line" />
          <div className={["setup-progress__step", step >= 2 ? "setup-progress__step--done" : ""].join(" ").trim()}>2</div>
        </div>

        <h2 className="auth-card__title">{step === 1 ? "Set up your business" : "Upload your logo"}</h2>
        <p className="setup-subtitle">
          {step === 1 ? "This information appears on invoices, receipts and reports." : "Your logo appears on documents, receipts and the POS interface."}
        </p>

        {error && <div className="auth-card__error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-card__form">
          {step === 1 && (
            <>
              <div className="form-field">
                <label htmlFor="businessName">Business Name <span className="required">*</span></label>
                <input id="businessName" type="text" required value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Acme Hardware (Pty) Ltd" />
              </div>
              <div className="form-field">
                <label htmlFor="tradingName">Trading Name <span className="optional">(optional)</span></label>
                <input id="tradingName" type="text" value={tradingName} onChange={(e) => setTradingName(e.target.value)} placeholder="e.g. Acme Hardware" />
              </div>
              <div className="form-field">
                <label htmlFor="industry">Industry</label>
                <select id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)}>
                  <option value="">Select your industry...</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="taxNumber">VAT / Tax Number <span className="optional">(optional)</span></label>
                <input id="taxNumber" type="text" value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} placeholder="e.g. 4123456789" />
              </div>
              <button type="submit" className="btn btn--primary btn--md auth-card__submit">Continue</button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="logo-upload">
                {logoPreview ? (
                  <div className="logo-upload__preview">
                    <img src={logoPreview} alt="Logo preview" />
                    <button type="button" className="logo-upload__remove" onClick={() => { setLogo(null); setLogoPreview(""); }}>Remove</button>
                  </div>
                ) : (
                  <label htmlFor="logo" className="logo-upload__dropzone">
                    <span className="logo-upload__icon">🖼</span>
                    <span className="logo-upload__text">Click to upload your logo</span>
                    <span className="logo-upload__hint">PNG or JPG, max 2MB. Recommended: 400x200px</span>
                    <input id="logo" type="file" accept="image/png,image/jpeg" onChange={handleLogoChange} className="sr-only" />
                  </label>
                )}
              </div>
              <div className="setup-actions">
                <button type="button" className="btn btn--ghost btn--md" onClick={() => setStep(1)}>Back</button>
                <button type="submit" className="btn btn--primary btn--md" disabled={loading}>
                  {loading ? <span className="btn__spinner" /> : null}
                  {loading ? "Setting up..." : logo ? "Finish setup" : "Skip for now"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
