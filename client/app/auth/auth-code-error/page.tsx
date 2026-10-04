import Link from "next/link";
import { FiAlertTriangle, FiArrowRight } from "react-icons/fi";
import CampusShell from "@/components/Campus/CampusShell";

export default function AuthCodeError() {
  return (
    <CampusShell compact>
      <section className="cm-auth-gate">
        <div className="cm-success-icon"><FiAlertTriangle /></div>
        <span className="cm-kicker">Authentication link unavailable</span>
        <h1>That sign-in link did not work.</h1>
        <p>It may have expired or already been used. Request a fresh password link or return to login and try again.</p>
        <div>
          <Link href="/login" className="cm-button">Return to login <FiArrowRight /></Link>
          <Link href="/forgot-password" className="cm-button cm-button-ghost">Reset password</Link>
        </div>
      </section>
    </CampusShell>
  );
}

