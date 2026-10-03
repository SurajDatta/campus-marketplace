"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { FiArrowUpRight, FiHeart, FiMapPin } from "react-icons/fi";

const navItems = [
  { href: "/buy", label: "Browse" },
  { href: "/sell", label: "Sell" },
  { href: "/my-stuff", label: "Meetups" },
];

export default function CampusShell({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  const pathname = usePathname();

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
          <Link href="/login" className="cm-link-button">Log in</Link>
          <Link href="/signup" className="cm-button cm-button-small">Join campus <FiArrowUpRight /></Link>
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
