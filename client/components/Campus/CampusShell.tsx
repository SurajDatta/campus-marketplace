"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { FiArrowUpRight, FiHeart, FiLogOut, FiMapPin } from "react-icons/fi";
import type { User } from "@supabase/supabase-js";
import useSupabaseBrowser from "@/utils/supabase/supabase-browser";

const navItems = [
  { href: "/buy", label: "Browse" },
  { href: "/sell", label: "Sell" },
  { href: "/my-stuff", label: "Meetups" },
];

export default function CampusShell({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useSupabaseBrowser();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active) setUser(data.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.replace("/");
    router.refresh();
  };

  return (
    <div className="cm-site">
      <header className="cm-header">
        <Link href="/" className="cm-brand" aria-label="Campus Marketplace home">
          <Image
            src="/images/campus-marketplace-wordmark.png"
            alt="Campus Marketplace"
            width={260}
            height={87}
            priority
          />
        </Link>
        <nav className="cm-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname.startsWith(item.href) ? "cm-nav-link is-active" : "cm-nav-link"}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="cm-header-actions">
          {user ? <>
            <Link href="/my-stuff" className="cm-link-button cm-user-link">{user.user_metadata?.name ?? user.email ?? "Account"}</Link>
            <button type="button" className="cm-button cm-button-small" onClick={signOut}>Log out <FiLogOut /></button>
          </> : <>
            <Link href="/login" className="cm-link-button">Log in</Link>
            <Link href="/signup" className="cm-button cm-button-small">Join campus <FiArrowUpRight /></Link>
          </>}
        </div>
      </header>

      <main className={compact ? "cm-main cm-main-compact" : "cm-main"}>{children}</main>

      <footer className="cm-footer">
        <div>
          <Image src="/images/campus-marketplace-logo.png" alt="" width={44} height={44} />
          <div>
            <strong>Campus Marketplace</strong>
            <span>Student exchange, made human.</span>
          </div>
        </div>
        <div className="cm-footer-notes">
          <span><FiMapPin /> Public campus meetups</span>
          <span><FiHeart /> Built for students</span>
          <span>Payments are simulated for this demo.</span>
        </div>
      </footer>
    </div>
  );
}
