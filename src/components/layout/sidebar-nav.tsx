"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export type NavItem = {
  href: string;
  icon: React.ReactNode;
  label: string;
};

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {items.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-item ${isActive ? "active" : ""}`}
            id={`nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}
          >
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, flexShrink: 0 }}>
              {item.icon}
            </span>
            <span style={{ fontSize: "0.92rem" }}>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
