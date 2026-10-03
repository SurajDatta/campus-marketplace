"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiArrowRight, FiCalendar, FiCheck, FiClock, FiMapPin, FiShield, FiUsers } from "react-icons/fi";
import type { CampusListing } from "@/types/marketplace";
import { formatCampusDate, formatCampusMoney, marketplaceRequest } from "@/utils/marketplace/client";
import CampusShell from "./CampusShell";

const fallbackListing: CampusListing = {
  id: "demo-macbook",
  sellerId: "demo-sarah",
  title: "MacBook Air M2",
  description: "Excellent condition, charger included. Perfect for classes and projects.",
  priceCents: 50000,
  state: "available",
  meetupOptions: [{
    startsAt: new Date(Date.now() + 86400000).toISOString(),
    location: "Student Union main entrance",
  }],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function CampusLanding() {
  const [listing, setListing] = useState<CampusListing>(fallbackListing);

  useEffect(() => {
    marketplaceRequest<CampusListing[]>("/api/marketplace/listings")
      .then((listings) => setListing(listings.find((item) => item.state === "available") ?? listings[0] ?? fallbackListing))
      .catch(() => undefined);
  }, []);

  return (
    <CampusShell>
      <section className="cm-hero">
        <div className="cm-hero-copy">
          <div className="cm-eyebrow"><span /> Verified campus exchange</div>
          <h1>Buy nearby.<br />Meet safely.<br /><em>Agree together.</em></h1>
          <p>
            A student marketplace built around public meetups, shared price confirmation,
            and simulated wallet protection—without awkward payment handoffs.
          </p>
          <div className="cm-hero-actions">
            <Link href="/buy" className="cm-button">Explore marketplace <FiArrowRight /></Link>
            <Link href="/sell" className="cm-button cm-button-ghost">List an item</Link>
          </div>
          <div className="cm-trust-row">
            <span><FiShield /> Funds held before meetup</span>
            <span><FiUsers /> Both people approve</span>
          </div>
        </div>

        <div className="cm-hero-visual" aria-label="Campus Marketplace transaction preview">
          <div className="cm-logo-orbit">
            <Image src="/images/campus-marketplace-logo.png" alt="Campus Marketplace logo" width={136} height={136} priority />
          </div>
          <div className="cm-preview-card">
            <div className="cm-preview-top">
              <span className="cm-status-dot" />
              <span>Meetup in progress</span>
              <small>SIMULATED WALLET</small>
            </div>
            <div className="cm-preview-product">
              <div className="cm-product-symbol">⌘</div>
              <div><strong>{listing.title}</strong><span>Reserved from Sarah</span></div>
              <strong>{formatCampusMoney(listing.priceCents)}</strong>
            </div>
            <div className="cm-preview-meetup">
              <span><FiCalendar /> {formatCampusDate(listing.meetupOptions[0]?.startsAt ?? fallbackListing.meetupOptions[0].startsAt)}</span>
              <span><FiMapPin /> {listing.meetupOptions[0]?.location ?? fallbackListing.meetupOptions[0].location}</span>
            </div>
            <div className="cm-progress-track"><i /><i /><i /><i /></div>
            <div className="cm-preview-steps"><span>Reserved</span><span>Meet</span><span>Approve</span><span>Done</span></div>
            <div className="cm-price-agreement">
              <div><span>Final price</span><strong>$450.00</strong></div>
              <div className="cm-avatar-pair"><span>S</span><span>A</span><b><FiCheck /></b></div>
            </div>
          </div>
          <div className="cm-float-note cm-note-top"><FiClock /><div><strong>10:00</strong><span>Code expires</span></div></div>
          <div className="cm-float-note cm-note-bottom"><FiCheck /><div><strong>Price matched</strong><span>Both approved v2</span></div></div>
        </div>
      </section>

      <section className="cm-proof-strip">
        <div><strong>6 digits</strong><span>Expiring meetup code</span></div>
        <div><strong>2 approvals</strong><span>One shared final price</span></div>
        <div><strong>1 atomic step</strong><span>Exactly-once settlement</span></div>
        <div><strong>$0 real money</strong><span>Safe hackathon simulation</span></div>
      </section>

      <section className="cm-section">
        <div className="cm-section-heading">
          <div><span className="cm-kicker">How it works</span><h2>From listing to handoff,<br />everyone stays in sync.</h2></div>
          <p>Four clear moments replace scattered messages, surprise prices, and uncertain payment status.</p>
        </div>
        <div className="cm-step-grid">
          {[
            ["01", "List it", "Set a price and offer public campus meetup options."],
            ["02", "Reserve it", "The buyer chooses a time while simulated funds are held."],
            ["03", "Meet & inspect", "Use the seller's expiring code, then lower the price if needed."],
            ["04", "Approve together", "Both sides accept the same version before settlement."],
          ].map(([number, title, body]) => (
            <article className="cm-step-card" key={number}>
              <span>{number}</span><h3>{title}</h3><p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cm-feature-panel">
        <div className="cm-feature-copy">
          <span className="cm-kicker">Built for the meetup</span>
          <h2>The item can change hands.<br />The rules don&apos;t.</h2>
          <p>Every action is tied to the signed-in participant and current transaction state.</p>
          <ul>
            <li><FiCheck /> Only the buyer can verify the code</li>
            <li><FiCheck /> Only the seller can lower the price</li>
            <li><FiCheck /> Price changes clear both approvals</li>
            <li><FiCheck /> Cancellation releases the hold once</li>
          </ul>
        </div>
        <div className="cm-code-demo">
          <span>MEETUP CODE</span>
          <strong>4 8 2 1 0 6</strong>
          <p><FiClock /> Expires in 08:42</p>
          <small>Confirms shared knowledge of the code—not physical presence.</small>
        </div>
      </section>

      <section className="cm-final-cta">
        <Image src="/images/campus-marketplace-logo.png" alt="" width={88} height={88} />
        <div><span className="cm-kicker">Campus Marketplace</span><h2>Give good stuff a second semester.</h2></div>
        <Link href="/buy" className="cm-button cm-button-light">Browse listings <FiArrowRight /></Link>
      </section>
    </CampusShell>
  );
}
