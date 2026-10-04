import Link from "next/link";
import { FiArrowRight, FiCheck, FiDollarSign, FiMapPin, FiShield } from "react-icons/fi";
import CampusShell from "@/components/Campus/CampusShell";

const steps = [
  {
    icon: FiDollarSign,
    title: "Reserve with demo credits",
    text: "The buyer chooses an advertised public meetup option. Licks atomically reserves the listing and places a simulated wallet hold.",
  },
  {
    icon: FiMapPin,
    title: "Meet and inspect",
    text: "The seller generates an expiring six-digit code. The buyer enters it to unlock confirmation; the code does not prove physical presence.",
  },
  {
    icon: FiCheck,
    title: "Agree on one price",
    text: "The seller may lower the price. Buyer and seller approve the same version before the simulated credits settle exactly once.",
  },
];

export default function About() {
  return (
    <CampusShell compact>
      <section className="cm-page-hero">
        <div>
          <span className="cm-kicker">About Licks</span>
          <h1>Student exchange, made human.</h1>
          <p>Licks helps students list items, reserve them with simulated credits, and coordinate a clear public-campus meetup.</p>
        </div>
        <div className="cm-seller-tip">
          <FiShield />
          <div><strong>Hackathon payment simulation</strong><span>No cards, bank accounts, Stripe requests, or real money are used.</span></div>
        </div>
      </section>

      <section className="cm-section">
        <div className="cm-section-heading">
          <div><span className="cm-kicker">How it works</span><h2>One protected transaction flow.</h2></div>
          <p>Server-validated identities and atomic database operations keep both devices on the same transaction state.</p>
        </div>
        <div className="cm-step-grid">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <article className="cm-step-card" key={title}>
              <span>0{index + 1}</span>
              <Icon />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cm-final-cta">
        <FiShield />
        <div><span className="cm-kicker">Ready to try it?</span><h2>Explore the Licks demo.</h2></div>
        <Link href="/buy" className="cm-button cm-button-light">Browse listings <FiArrowRight /></Link>
      </section>
    </CampusShell>
  );
}
