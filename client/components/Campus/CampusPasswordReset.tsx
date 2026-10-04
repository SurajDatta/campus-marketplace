"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { FiArrowRight, FiCheck, FiLock, FiMail } from "react-icons/fi";
import useSupabaseBrowser from "@/utils/supabase/supabase-browser";
import CampusShell from "./CampusShell";

export default function CampusPasswordReset({ mode }: { mode: "request" | "update" }) {
  const supabase = useSupabaseBrowser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "request") {
        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail) throw new Error("Enter your account email.");
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        });
        if (resetError) throw resetError;
        setComplete(true);
        return;
      }

      if (password.length < 8) throw new Error("Use at least eight characters.");
      if (password !== confirmation) throw new Error("The passwords do not match.");
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      await supabase.auth.signOut();
      setComplete(true);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Password reset could not be completed.");
    } finally {
      setBusy(false);
    }
  };

  if (complete) {
    return (
      <CampusShell compact>
        <section className="cm-auth-gate">
          <div className="cm-success-icon"><FiCheck /></div>
          <span className="cm-kicker">{mode === "request" ? "Email sent" : "Password updated"}</span>
          <h1>{mode === "request" ? "Check your inbox." : "Your new password is ready."}</h1>
          <p>{mode === "request" ? "Use the secure link in the email to choose a new password." : "Log in again to continue to Licks."}</p>
          <Link href="/login" className="cm-button">Return to login <FiArrowRight /></Link>
        </section>
      </CampusShell>
    );
  }

  return (
    <CampusShell compact>
      <section className="cm-reset-layout">
        <div className="cm-auth-card cm-reset-card">
          <span className="cm-kicker">Account recovery</span>
          <h2>{mode === "request" ? "Reset your password." : "Choose a new password."}</h2>
          <p>{mode === "request" ? "We will send a secure recovery link to your account email." : "Your recovery link is verified. Enter a new password below."}</p>
          <form className="cm-auth-form" onSubmit={submit}>
            {mode === "request" ? (
              <label className="cm-field"><span>Email</span><div className="cm-input-icon"><FiMail /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="student@example.edu" required /></div></label>
            ) : <>
              <label className="cm-field"><span>New password</span><div className="cm-input-icon"><FiLock /><input type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" placeholder="At least 8 characters" required /></div></label>
              <label className="cm-field"><span>Confirm password</span><div className="cm-input-icon"><FiLock /><input type="password" minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" placeholder="Repeat your password" required /></div></label>
            </>}
            {error && <div className="cm-inline-error cm-form-error" role="alert">{error}</div>}
            <button className="cm-button cm-button-full" type="submit" disabled={busy}>{busy ? "Updating..." : mode === "request" ? "Send recovery link" : "Save new password"}<FiArrowRight /></button>
          </form>
          <div className="cm-auth-switch"><Link href="/login">Back to login</Link></div>
        </div>
      </section>
    </CampusShell>
  );
}
