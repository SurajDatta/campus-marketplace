"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FiArrowRight, FiCalendar, FiCheck, FiClock, FiDollarSign, FiMapPin, FiRefreshCw, FiShield, FiX } from "react-icons/fi";
import type { CampusListing, CampusTransaction, CampusWallet } from "@/types/marketplace";
import useSupabaseBrowser from "@/utils/supabase/supabase-browser";
import { formatCampusDate, formatCampusMoney, MarketplaceRequestError, marketplaceRequest } from "@/utils/marketplace/client";
import CampusShell from "./CampusShell";

type GeneratedCode = { code: string; expiresAt: string; transaction: CampusTransaction };

export default function CampusTransactions() {
  const supabase = useSupabaseBrowser();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<CampusTransaction[]>([]);
  const [listings, setListings] = useState<CampusListing[]>([]);
  const [wallet, setWallet] = useState<CampusWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [codes, setCodes] = useState<Record<string, GeneratedCode>>({});
  const [verificationCodes, setVerificationCodes] = useState<Record<string, string>>({});
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});

  const load = useCallback(async (quiet = false) => {
    try {
      const [transactionData, listingData, walletData] = await Promise.all([
        marketplaceRequest<CampusTransaction[]>("/api/marketplace/transactions", { cache: "no-store" }),
        marketplaceRequest<CampusListing[]>("/api/marketplace/listings", { cache: "no-store" }),
        marketplaceRequest<CampusWallet>("/api/marketplace/wallet", { cache: "no-store" }),
      ]);
      setTransactions(transactionData);
      setListings(listingData);
      setWallet(walletData);
      setAuthRequired(false);
    } catch (error) {
      if (error instanceof MarketplaceRequestError && error.status === 401) setAuthRequired(true);
      else if (!quiet) setNotice({ kind: "error", text: error instanceof Error ? error.message : "Transactions could not be loaded." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
    load();
    const timer = window.setInterval(() => load(true), 4000);
    return () => window.clearInterval(timer);
  }, [load, supabase]);

  const listingMap = useMemo(() => new Map(listings.map((listing) => [listing.id, listing])), [listings]);

  const updateTransaction = (updated: CampusTransaction) => {
    setTransactions((current) => current.map((transaction) => transaction.id === updated.id ? updated : transaction));
  };

  const run = async <T,>(transactionId: string, action: () => Promise<T>, onSuccess: (data: T) => void, successText: string) => {
    setBusy(transactionId);
    setNotice(null);
    try {
      const data = await action();
      onSuccess(data);
      setNotice({ kind: "success", text: successText });
      await load(true);
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "The action could not be completed." });
    } finally {
      setBusy(null);
    }
  };

  const generateCode = (transaction: CampusTransaction) => run(
    transaction.id,
    () => marketplaceRequest<GeneratedCode>(`/api/marketplace/transactions/${transaction.id}/meetup-code`, { method: "POST" }),
    (data) => { setCodes((current) => ({ ...current, [transaction.id]: data })); updateTransaction(data.transaction); },
    "A new meetup code is ready for the buyer.",
  );

  const verifyCode = (transaction: CampusTransaction) => run(
    transaction.id,
    () => marketplaceRequest<CampusTransaction>(`/api/marketplace/transactions/${transaction.id}/meetup-code/verify`, { method: "POST", body: JSON.stringify({ code: verificationCodes[transaction.id] ?? "" }) }),
    updateTransaction,
    "Meetup code verified. Both participants can now approve the price.",
  );

  const lowerPrice = (transaction: CampusTransaction) => run(
    transaction.id,
    () => marketplaceRequest<CampusTransaction>(`/api/marketplace/transactions/${transaction.id}/final-price`, { method: "PATCH", body: JSON.stringify({ finalPriceCents: Math.round(Number(priceDrafts[transaction.id]) * 100), expectedPriceVersion: transaction.priceVersion }) }),
    updateTransaction,
    "Final price updated. Both approvals were reset for the new version.",
  );

  const approve = (transaction: CampusTransaction) => run(
    transaction.id,
    () => marketplaceRequest<CampusTransaction>(`/api/marketplace/transactions/${transaction.id}/approve`, { method: "POST", body: JSON.stringify({ priceVersion: transaction.priceVersion }) }),
    updateTransaction,
    "Your approval is recorded for the current price.",
  );

  const complete = (transaction: CampusTransaction) => run(
    transaction.id,
    () => marketplaceRequest<CampusTransaction>(`/api/marketplace/transactions/${transaction.id}/complete`, { method: "POST" }),
    updateTransaction,
    "Sale completed and the simulated wallet hold was settled.",
  );

  const cancel = (transaction: CampusTransaction) => {
    if (!window.confirm("Cancel this transaction and release the simulated wallet hold?")) return;
    run(
      transaction.id,
      () => marketplaceRequest<CampusTransaction>(`/api/marketplace/transactions/${transaction.id}/cancel`, { method: "POST" }),
      updateTransaction,
      "Transaction canceled. The hold was released and the listing is available again.",
    );
  };

  if (authRequired) return <CampusShell compact><section className="cm-auth-gate"><FiShield /><span className="cm-kicker">Private workspace</span><h1>Sign in to see your meetups.</h1><p>Only the buyer and seller can access a transaction&apos;s code, price, and approval state.</p><div><Link href="/login" className="cm-button">Log in <FiArrowRight /></Link><Link href="/signup" className="cm-button cm-button-ghost">Create account</Link></div></section></CampusShell>;

  return (
    <CampusShell compact>
      <section className="cm-page-hero">
        <div><span className="cm-kicker">Transaction workspace</span><h1>Your meetups, in sync.</h1><p>This page polls every four seconds so the buyer and seller see each other&apos;s latest action.</p></div>
        <div className="cm-wallet-card"><span><FiShield /> SIMULATED WALLET</span><strong>{wallet ? formatCampusMoney(wallet.availableCents) : "—"}</strong><small>{wallet ? `${formatCampusMoney(wallet.heldCents)} currently held` : "Loading balance"}</small></div>
      </section>

      <div className="cm-workspace-toolbar"><div><span className="cm-live-dot" /> Live polling enabled</div><button onClick={() => load()}><FiRefreshCw /> Refresh now</button></div>
      {notice && <div className={`cm-notice cm-notice-${notice.kind}`}>{notice.kind === "success" ? <FiCheck /> : <FiShield />}{notice.text}</div>}

      <section className="cm-transaction-list">
        {loading ? [...Array(2)].map((_, index) => <div className="cm-transaction-card cm-skeleton" key={index} />) : transactions.length === 0 ? <div className="cm-empty"><FiCalendar /><h2>No meetups yet.</h2><p>Reserve a listing and it will appear here for both participants.</p><Link href="/buy" className="cm-button">Browse marketplace</Link></div> : transactions.map((transaction) => {
          const isSeller = currentUserId === transaction.sellerId;
          const isBuyer = currentUserId === transaction.buyerId;
          const listing = listingMap.get(transaction.listingId);
          const generated = codes[transaction.id];
          const verified = Boolean(transaction.meetupCode.verifiedAt);
          const bothApproved = transaction.approvals.sellerApproved && transaction.approvals.buyerApproved;
          const canComplete = transaction.status === "active" && verified && bothApproved;
          const step = transaction.status === "completed" ? 4 : bothApproved ? 3 : verified ? 2 : 1;
          return <article className={`cm-transaction-card status-${transaction.status}`} key={transaction.id}>
            <div className="cm-transaction-head">
              <div><span className="cm-role-tag">You&apos;re the {isSeller ? "seller" : isBuyer ? "buyer" : "participant"}</span><h2>{listing?.title ?? "Licks item"}</h2><p><FiMapPin /> {transaction.meetup.location} · {formatCampusDate(transaction.meetup.startsAt)}</p></div>
              <div><span>{transaction.status}</span><strong>{formatCampusMoney(transaction.finalPriceCents)}</strong><small>{transaction.finalPriceCents < transaction.reservedPriceCents ? `${formatCampusMoney(transaction.reservedPriceCents - transaction.finalPriceCents)} below reserved price` : "Reserved price"}</small></div>
            </div>

            <div className="cm-transaction-progress">{["Reserved", "Code verified", "Price approved", "Completed"].map((label, index) => <div className={step >= index + 1 ? "is-done" : ""} key={label}><i>{step > index + 1 || transaction.status === "completed" ? <FiCheck /> : index + 1}</i><span>{label}</span></div>)}</div>

            {transaction.status === "active" && <div className="cm-action-grid">
              <div className="cm-action-panel">
                <span className="cm-panel-number">01</span><h3>Meetup code</h3>
                {verified ? <div className="cm-complete-line"><FiCheck /> Verified successfully</div> : isSeller ? <>{generated ? <div className="cm-generated-code"><strong>{generated.code.split("").join(" ")}</strong><span><FiClock /> Expires {formatCampusDate(generated.expiresAt)}</span></div> : <p>Generate a six-digit code and show it to the buyer at the meetup.</p>}<button disabled={busy === transaction.id} onClick={() => generateCode(transaction)} className="cm-button cm-button-small">{generated ? "Generate a new code" : "Generate code"}</button></> : <><p>Enter the six-digit code shown on the seller&apos;s device.</p><div className="cm-code-entry"><input inputMode="numeric" maxLength={6} value={verificationCodes[transaction.id] ?? ""} onChange={(event) => setVerificationCodes((current) => ({ ...current, [transaction.id]: event.target.value.replace(/\D/g, "") }))} placeholder="000000" /><button disabled={busy === transaction.id || (verificationCodes[transaction.id]?.length ?? 0) !== 6} onClick={() => verifyCode(transaction)}><FiArrowRight /></button></div><small>{transaction.meetupCode.attemptsRemaining ?? 5} attempts remaining</small></>}
              </div>

              <div className="cm-action-panel">
                <span className="cm-panel-number">02</span><h3>Final price · v{transaction.priceVersion}</h3>
                <div className="cm-price-display"><strong>{formatCampusMoney(transaction.finalPriceCents)}</strong><span>Reserved at {formatCampusMoney(transaction.reservedPriceCents)}</span></div>
                {isSeller && <div className="cm-price-input"><FiDollarSign /><input inputMode="decimal" value={priceDrafts[transaction.id] ?? ""} onChange={(event) => setPriceDrafts((current) => ({ ...current, [transaction.id]: event.target.value }))} placeholder={(transaction.finalPriceCents / 100).toFixed(2)} /><button disabled={busy === transaction.id || !priceDrafts[transaction.id]} onClick={() => lowerPrice(transaction)}>Lower price</button></div>}
                <div className="cm-approval-pills"><span className={transaction.approvals.sellerApproved ? "is-approved" : ""}>{transaction.approvals.sellerApproved && <FiCheck />} Seller</span><span className={transaction.approvals.buyerApproved ? "is-approved" : ""}>{transaction.approvals.buyerApproved && <FiCheck />} Buyer</span></div>
                <button className="cm-button cm-button-full" disabled={!verified || busy === transaction.id || (isSeller ? transaction.approvals.sellerApproved : transaction.approvals.buyerApproved)} onClick={() => approve(transaction)}>{!verified ? "Verify code first" : (isSeller ? transaction.approvals.sellerApproved : transaction.approvals.buyerApproved) ? "You approved this version" : "Approve this price"}</button>
              </div>

              <div className="cm-action-panel cm-finish-panel">
                <span className="cm-panel-number">03</span><h3>Finish the exchange</h3><p>Completion only works after code verification and both price approvals.</p>
                <button className="cm-button cm-button-full" disabled={!canComplete || busy === transaction.id} onClick={() => complete(transaction)}>{busy === transaction.id ? "Updating..." : "Complete sale"}<FiCheck /></button>
                <button className="cm-danger-link" disabled={busy === transaction.id} onClick={() => cancel(transaction)}><FiX /> Cancel & release hold</button>
              </div>
            </div>}

            {transaction.status === "completed" && transaction.receipt && <div className="cm-receipt"><div><FiCheck /><span><strong>Sale completed</strong><small>{formatCampusDate(transaction.receipt.completedAt)}</small></span></div><div><span>Final price<strong>{formatCampusMoney(transaction.receipt.finalPriceCents)}</strong></span><span>Buyer refund<strong>{formatCampusMoney(transaction.receipt.buyerRefundCents)}</strong></span><span>Payment mode<strong>Simulated wallet</strong></span></div></div>}
            {transaction.status === "canceled" && <div className="cm-canceled"><FiX /><span><strong>Transaction canceled</strong><small>The hold was released and the listing returned to available.</small></span></div>}
          </article>;
        })}
      </section>
    </CampusShell>
  );
}
