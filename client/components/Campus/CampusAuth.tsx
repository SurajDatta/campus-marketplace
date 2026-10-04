"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiArrowRight, FiCheck, FiLock, FiMail, FiShield, FiUser } from "react-icons/fi";
import useSupabaseBrowser from "@/utils/supabase/supabase-browser";
import CampusShell from "./CampusShell";

type AuthMode = "login" | "signup";

const demoAccounts = {
  seller: { label: "Sarah · seller", email: "sarah@campus.demo" },
  buyer: { label: "Alex · buyer", email: "alex@campus.demo" },
} as const;

export default function CampusAuth({ mode }: { mode: AuthMode }) {
  const supabase = useSupabaseBrowser();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const isLogin = mode === "login";
  const showDemoAccounts = process.env.NEXT_PUBLIC_ENV === "development" && isLogin;

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active && data.user) {
        router.replace("/buy");
        router.refresh();
      }
    });
    return () => { active = false; };
  }, [router, supabase]);

  const continueToMarketplace = () => {
    router.replace("/buy");
    router.refresh();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || password.length < 8) {
      setError("Enter a valid email and a password with at least eight characters.");
      return;
    }
    if (!isLogin && !normalizedEmail.endsWith(".edu")) {
      setError("Use your .edu campus email to create an account.");
      return;
    }
    if (!isLogin && (!name.trim() || password !== confirmation)) {
      setError(!name.trim() ? "Enter your name." : "The passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      if (isLogin) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (authError) throw authError;
        continueToMarketplace();
        return;
      }

      const { data, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            name: name.trim(),
            campus_email: normalizedEmail,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/buy`,
        },
      });
      if (authError) throw authError;
      if (data.session) continueToMarketplace();
      else setConfirmationSent(true);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Authentication could not be completed.");
    } finally {
      setBusy(false);
    }
  };

  const chooseDemoAccount = (emailAddress: string) => {
    setEmail(emailAddress);
    setPassword("CampusDemo123!");
    setError(null);
  };

  if (confirmationSent) {
    return (
      <CampusShell compact>
        <section className="cm-auth-gate">
          <div className="cm-success-icon"><FiMail /></div>
          <span className="cm-kicker">Check your inbox</span>
          <h1>Confirm your campus email.</h1>
          <p>We sent a secure sign-in link to {email.trim().toLowerCase()}.</p>
          <Link href="/login" className="cm-button">Return to login <FiArrowRight /></Link>
        </section>
      </CampusShell>
    );
  }

  return (
    <CampusShell compact>
      <section className="cm-auth-layout">
        <aside className="cm-auth-story">
          <Image src="/images/campus-marketplace-logo.png" alt="" width={96} height={96} priority />
          <span className="cm-kicker">Licks</span>
          <h1>One account.<br />Both sides of the deal.</h1>
          <p>Your authenticated session connects listings, wallet holds, meetup verification, and price approvals.</p>
          <ul>
            <li><FiCheck /> Identities are validated by Supabase</li>
            <li><FiCheck /> Private transactions stay participant-only</li>
            <li><FiCheck /> Payments remain a clearly labeled simulation</li>
          </ul>
        </aside>

        <div className="cm-auth-card">
          <span className="cm-kicker">{isLogin ? "Welcome back" : "Student registration"}</span>
          <h2>{isLogin ? "Log in to continue." : "Join your campus exchange."}</h2>
          <p>{isLogin ? "Use the email and password connected to your marketplace wallet." : "Create one secure identity for buying, selling, and meetups."}</p>

          {showDemoAccounts && (
            <div className="cm-demo-accounts">
              <strong>Development demo</strong>
              <div>
                {Object.values(demoAccounts).map((account) => (
                  <button type="button" key={account.email} onClick={() => chooseDemoAccount(account.email)}>{account.label}</button>
                ))}
              </div>
              <small>Select an account to fill the seeded demo credentials.</small>
            </div>
          )}

          <form className="cm-auth-form" onSubmit={submit}>
            {!isLogin && (
              <label className="cm-field">
                <span>Name</span>
                <div className="cm-input-icon"><FiUser /><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Alex Student" required /></div>
              </label>
            )}
            <label className="cm-field">
              <span>{isLogin ? "Email" : "Campus email"}</span>
              <div className="cm-input-icon"><FiMail /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder={isLogin ? "alex@campus.demo" : "student@example.edu"} required /></div>
            </label>
            <label className="cm-field">
              <span>Password</span>
              <div className="cm-input-icon"><FiLock /><input type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isLogin ? "current-password" : "new-password"} placeholder="At least 8 characters" required /></div>
            </label>
            {!isLogin && (
              <label className="cm-field">
                <span>Confirm password</span>
                <div className="cm-input-icon"><FiShield /><input type="password" minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" placeholder="Repeat your password" required /></div>
              </label>
            )}
            {error && <div className="cm-inline-error" role="alert">{error}</div>}
            <button className="cm-button cm-button-full" type="submit" disabled={busy}>{busy ? "Connecting..." : isLogin ? "Log in" : "Create account"}<FiArrowRight /></button>
          </form>

          {isLogin && <Link href="/forgot-password" className="cm-forgot-link">Forgot your password?</Link>}

          <div className="cm-auth-switch">
            {isLogin ? <>New here? <Link href="/signup">Create an account</Link></> : <>Already registered? <Link href="/login">Log in</Link></>}
          </div>
        </div>
      </section>
    </CampusShell>
  );
}
