"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  icon: string;
  label: string;
};

export function MobileNav({ items }: { items: NavItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div className="mobile-nav-wrapper">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation menu"
        className="mobile-nav-toggle"
        id="mobile-menu-toggle-btn"
      >
        <span style={{ fontSize: "1.2rem" }}>{isOpen ? "✕" : "☰"}</span>
      </button>

      {isOpen && (
        <div
          className="mobile-drawer-overlay"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="mobile-drawer-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--bg-border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: "var(--brand-gradient)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 14,
                  }}
                >
                  ⚔
                </div>
                <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>
                  Better<span className="gradient-text">CP</span>
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                ✕
              </button>
            </div>

            <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-item ${isActive ? "active" : ""}`}
                    id={`mobile-nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
