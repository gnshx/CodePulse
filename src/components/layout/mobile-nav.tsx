"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Menu, Swords } from "lucide-react";
import type { NavItem } from "./sidebar-nav";

export function MobileNav({ items }: { items: NavItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

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
        {isOpen ? <X size={20} /> : <Menu size={20} />}
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--bg-border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 6,
                    background: "var(--brand-gradient)",
                    display: "grid",
                    placeItems: "center",
                    color: "#fff",
                  }}
                >
                  <Swords size={14} />
                </div>
                <span style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--text-primary)" }}>
                  Better<span style={{ color: "var(--brand-primary)" }}>CP</span>
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: 4,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`sidebar-item ${isActive ? "active" : ""}`}
                    id={`mobile-nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, flexShrink: 0 }}>
                      {item.icon}
                    </span>
                    <span style={{ fontSize: "var(--text-sm)" }}>{item.label}</span>
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
