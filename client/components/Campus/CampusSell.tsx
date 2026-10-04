"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FiArrowRight, FiCalendar, FiCheck, FiDollarSign, FiInfo, FiMapPin, FiPlus, FiShield, FiTrash2 } from "react-icons/fi";
import type { CampusListing } from "@/types/marketplace";
import { formatCampusMoney, MarketplaceRequestError, marketplaceRequest } from "@/utils/marketplace/client";
import useSupabaseBrowser from "@/utils/supabase/supabase-browser";
import CampusShell from "./CampusShell";

type MeetupDraft = { startsAt: string; location: string };

function defaultTime(daysAhead: number, hour: number) {
  const value = new Date();
  value.setDate(value.getDate() + daysAhead);
  value.setHours(hour, 0, 0, 0);
  const offset = value.getTimezoneOffset();
  return new Date(value.getTime() - offset * 60000).toISOString().slice(0, 16);
}

export default function CampusSell() {
  const supabase = useSupabaseBrowser();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [options, setOptions] = useState<MeetupDraft[]>([
    { startsAt: defaultTime(1, 17), location: "Student Union main entrance" },
    { startsAt: defaultTime(2, 14), location: "Main library lobby" },
  ]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CampusListing | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active) setAuthenticated(Boolean(data.user));
    });
    return () => { active = false; };
  }, [supabase]);

  const priceCents = useMemo(() => Math.round(Number(price || 0) * 100), [price]);

  const updateOption = (index: number, field: keyof MeetupDraft, value: string) => {
    setOptions((current) => current.map((option, optionIndex) => optionIndex === index ? { ...option, [field]: value } : option));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!title.trim() || !description.trim() || !Number.isSafeInteger(priceCents) || priceCents <= 0) {
      setError("Add a title, description, and positive price.");
      return;
    }
    if (options.some((option) => !option.location.trim() || !option.startsAt || new Date(option.startsAt) <= new Date())) {
      setError("Every meetup option needs a future time and public location.");
      return;
    }
    setBusy(true);
    try {
      const listing = await marketplaceRequest<CampusListing>("/api/marketplace/listings", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          priceCents,
          meetupOptions: options.map((option) => ({ startsAt: new Date(option.startsAt).toISOString(), location: option.location.trim() })),
        }),
      });
      setCreated(listing);
    } catch (requestError) {
      const loginHint = requestError instanceof MarketplaceRequestError && requestError.status === 401 ? " Log in before creating a listing." : "";
      setError(`${requestError instanceof Error ? requestError.message : "Listing could not be created."}${loginHint}`);
    } finally {
      setBusy(false);
    }
  };

  if (authenticated === null) {
    return <CampusShell compact><section className="cm-auth-gate"><div className="cm-success-icon"><FiShield /></div><span className="cm-kicker">Checking session</span><h1>Connecting your account.</h1></section></CampusShell>;
  }

  if (!authenticated) {
    return <CampusShell compact><section className="cm-auth-gate"><FiShield /><span className="cm-kicker">Seller access</span><h1>Log in before listing an item.</h1><p>Your signed-in identity becomes the listing owner. Seller IDs are never accepted from the form.</p><div><Link href="/login" className="cm-button">Log in <FiArrowRight /></Link><Link href="/signup" className="cm-button cm-button-ghost">Create account</Link></div></section></CampusShell>;
  }

  if (created) {
    return <CampusShell compact><section className="cm-success-page"><div className="cm-success-icon"><FiCheck /></div><span className="cm-kicker">Listing published</span><h1>{created.title} is live.</h1><p>Students can now reserve it for {formatCampusMoney(created.priceCents)} and select one of your {created.meetupOptions.length} meetup options.</p><div><Link href="/buy" className="cm-button">View marketplace <FiArrowRight /></Link><button className="cm-button cm-button-ghost" onClick={() => { setCreated(null); setTitle(""); setDescription(""); setPrice(""); }}>List another</button></div></section></CampusShell>;
  }

  return (
    <CampusShell compact>
      <section className="cm-page-hero cm-sell-hero"><div><span className="cm-kicker">Seller studio</span><h1>Give it a new home.</h1><p>Set the reserved price and offer a few public places where you are comfortable meeting.</p></div><div className="cm-seller-tip"><FiShield /><div><strong>You stay in control</strong><span>Only you can lower the final price after inspection.</span></div></div></section>

      <form className="cm-sell-layout" onSubmit={submit}>
        <div className="cm-form-card">
          <div className="cm-form-section-title"><span>01</span><div><h2>What are you selling?</h2><p>Keep it clear and useful for another student.</p></div></div>
          <label className="cm-field"><span>Listing title</span><input maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="MacBook Air M2" required /><small>{title.length}/120</small></label>
          <label className="cm-field"><span>Description</span><textarea maxLength={2000} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Condition, included accessories, and anything the buyer should know..." required /><small>{description.length}/2000</small></label>
          <label className="cm-field"><span>Reserved price</span><div className="cm-input-icon"><FiDollarSign /><input inputMode="decimal" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="500.00" required /></div><small>The seller may lower—but never raise—this price after inspection.</small></label>
        </div>

        <div className="cm-form-card">
          <div className="cm-form-section-title"><span>02</span><div><h2>Offer meetup options</h2><p>Use recognizable, public campus locations.</p></div></div>
          <div className="cm-meetup-editor">
            {options.map((option, index) => <div className="cm-meetup-edit-row" key={index}>
              <label><span><FiCalendar /> Date & time</span><input type="datetime-local" value={option.startsAt} onChange={(event) => updateOption(index, "startsAt", event.target.value)} required /></label>
              <label><span><FiMapPin /> Public location</span><input value={option.location} onChange={(event) => updateOption(index, "location", event.target.value)} placeholder="Library lobby" required /></label>
              {options.length > 1 && <button type="button" aria-label="Remove meetup option" onClick={() => setOptions((current) => current.filter((_, itemIndex) => itemIndex !== index))}><FiTrash2 /></button>}
            </div>)}
          </div>
          {options.length < 6 && <button type="button" className="cm-add-option" onClick={() => setOptions((current) => [...current, { startsAt: defaultTime(current.length + 1, 16), location: "" }])}><FiPlus /> Add another option</button>}
        </div>

        <aside className="cm-publish-card">
          <span className="cm-kicker">Preview</span>
          <div className="cm-preview-art"><span>{title ? title.charAt(0).toUpperCase() : "✦"}</span></div>
          <h2>{title || "Your item title"}</h2>
          <strong>{priceCents > 0 ? formatCampusMoney(priceCents) : "$0.00"}</strong>
          <p>{description || "Your description will appear here."}</p>
          <div className="cm-publish-meta"><span><FiMapPin /> {options.length} meetup option{options.length === 1 ? "" : "s"}</span><span><FiInfo /> Simulated wallet</span></div>
          {error && <div className="cm-inline-error">{error}</div>}
          <button className="cm-button cm-button-full" type="submit" disabled={busy}>{busy ? "Publishing..." : "Publish listing"}<FiArrowRight /></button>
          <small>By publishing, you confirm the item description and meetup options are accurate.</small>
        </aside>
      </form>
    </CampusShell>
  );
}
