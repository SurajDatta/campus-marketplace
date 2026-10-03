"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FiArrowRight, FiCheck, FiClock, FiMapPin, FiSearch, FiShield, FiShoppingBag, FiSliders } from "react-icons/fi";
import type { CampusListing, CampusMeetupOption, CampusTransaction, CampusWallet } from "@/types/marketplace";
import { formatCampusDate, formatCampusMoney, MarketplaceRequestError, marketplaceRequest } from "@/utils/marketplace/client";
import CampusShell from "./CampusShell";

const productSymbols = ["⌘", "✦", "◫", "◒", "◇", "◎"];

export default function CampusMarketplace() {
  const [listings, setListings] = useState<CampusListing[]>([]);
  const [wallet, setWallet] = useState<CampusWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "available" | "reserved" | "sold">("available");
  const [selected, setSelected] = useState<CampusListing | null>(null);
  const [meetup, setMeetup] = useState<CampusMeetupOption | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await marketplaceRequest<CampusListing[]>("/api/marketplace/listings", { cache: "no-store" });
      setListings(data);
      marketplaceRequest<CampusWallet>("/api/marketplace/wallet", { cache: "no-store" })
        .then(setWallet)
        .catch(() => setWallet(null));
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Listings could not be loaded." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 8000);
    return () => window.clearInterval(timer);
  }, [load]);

  const visibleListings = useMemo(() => listings.filter((listing) => {
    const matchesFilter = filter === "all" || listing.state === filter;
    const term = `${listing.title} ${listing.description}`.toLowerCase();
    return matchesFilter && term.includes(search.toLowerCase());
  }), [filter, listings, search]);

  const openReserve = (listing: CampusListing) => {
    setSelected(listing);
    setMeetup(listing.meetupOptions[0] ?? null);
    setMessage(null);
  };

  const reserve = async () => {
    if (!selected || !meetup) return;
    setBusy(true);
    setMessage(null);
    try {
      await marketplaceRequest<CampusTransaction>(`/api/marketplace/listings/${selected.id}/reserve`, {
        method: "POST",
        body: JSON.stringify({ meetup }),
      });
      setSelected(null);
      setMessage({ kind: "success", text: `${selected.title} is reserved. Your simulated wallet hold is active.` });
      await load();
    } catch (error) {
      const loginHint = error instanceof MarketplaceRequestError && error.status === 401 ? " Log in to reserve it." : "";
      setMessage({ kind: "error", text: `${error instanceof Error ? error.message : "Reservation failed."}${loginHint}` });
    } finally {
      setBusy(false);
    }
  };

  return (
    <CampusShell compact>
      <section className="cm-page-hero">
        <div><span className="cm-kicker">Student exchange</span><h1>Find your next campus essential.</h1><p>Reserve now, inspect at the meetup, and approve the final price together.</p></div>
        <div className="cm-wallet-card">
          <span><FiShield /> SIMULATED WALLET</span>
          <strong>{wallet ? formatCampusMoney(wallet.availableCents) : "Sign in"}</strong>
          <small>{wallet ? `${formatCampusMoney(wallet.heldCents)} currently held` : "to see your demo balance"}</small>
        </div>
      </section>

      <section className="cm-market-toolbar">
        <label className="cm-search"><FiSearch /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search desks, bikes, books..." /></label>
        <div className="cm-filter-row"><FiSliders />{(["available", "all", "reserved", "sold"] as const).map((value) => <button key={value} className={filter === value ? "is-active" : ""} onClick={() => setFilter(value)}>{value}</button>)}</div>
        <Link href="/sell" className="cm-button cm-button-small">Sell an item <FiArrowRight /></Link>
      </section>

      {message && <div className={`cm-notice cm-notice-${message.kind}`}>{message.kind === "success" ? <FiCheck /> : <FiShield />}{message.text}</div>}

      <section className="cm-listing-grid" aria-live="polite">
        {loading ? [...Array(6)].map((_, index) => <div className="cm-listing-card cm-skeleton" key={index} />) : visibleListings.length === 0 ? (
          <div className="cm-empty"><FiShoppingBag /><h2>No listings here yet.</h2><p>Try another filter or be the first person to list something.</p><Link href="/sell" className="cm-button">Create a listing</Link></div>
        ) : visibleListings.map((listing, index) => (
          <article className="cm-listing-card" key={listing.id}>
            <div className={`cm-listing-art art-${index % 6}`}><span>{productSymbols[index % productSymbols.length]}</span><b>{listing.state}</b></div>
            <div className="cm-listing-body">
              <div className="cm-listing-title"><div><span>Campus pickup</span><h2>{listing.title}</h2></div><strong>{formatCampusMoney(listing.priceCents)}</strong></div>
              <p>{listing.description}</p>
              {listing.meetupOptions[0] && <div className="cm-listing-meetup"><FiMapPin /><span>{listing.meetupOptions[0].location}<small><FiClock /> {formatCampusDate(listing.meetupOptions[0].startsAt)}</small></span></div>}
              <button className="cm-button cm-button-full" disabled={listing.state !== "available"} onClick={() => openReserve(listing)}>{listing.state === "available" ? "Reserve & choose meetup" : listing.state}<FiArrowRight /></button>
            </div>
          </article>
        ))}
      </section>

      {selected && <div className="cm-modal-backdrop" role="presentation" onMouseDown={() => !busy && setSelected(null)}>
        <div className="cm-modal" role="dialog" aria-modal="true" aria-labelledby="reserve-title" onMouseDown={(event) => event.stopPropagation()}>
          <button className="cm-modal-close" onClick={() => setSelected(null)} aria-label="Close">×</button>
          <span className="cm-kicker">Reserve item</span>
          <h2 id="reserve-title">Choose your public meetup.</h2>
          <div className="cm-reserve-summary"><span>{selected.title}</span><strong>{formatCampusMoney(selected.priceCents)}</strong></div>
          <div className="cm-option-list">
            {selected.meetupOptions.map((option) => {
              const active = meetup?.startsAt === option.startsAt && meetup?.location === option.location;
              return <button key={`${option.startsAt}-${option.location}`} className={active ? "cm-meetup-option is-active" : "cm-meetup-option"} onClick={() => setMeetup(option)}><i>{active && <FiCheck />}</i><span><strong>{option.location}</strong><small>{formatCampusDate(option.startsAt)}</small></span></button>;
            })}
          </div>
          <div className="cm-hold-note"><FiShield /><span><strong>{formatCampusMoney(selected.priceCents)} will be held</strong><small>No real payment request is made in this demo.</small></span></div>
          <button className="cm-button cm-button-full" disabled={!meetup || busy} onClick={reserve}>{busy ? "Reserving..." : "Confirm reservation"}<FiArrowRight /></button>
        </div>
      </div>}
    </CampusShell>
  );
}
