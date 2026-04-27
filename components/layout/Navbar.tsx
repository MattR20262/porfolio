"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";

const baseLinks = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

interface NavPage { title: string; slug: string; nav_parent: string | null; }

interface NavItem {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
}

export default function Navbar({ navPages = [] }: { navPages?: NavPage[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLUListElement>(null);

  // Build nav structure: merge base links with custom pages
  const navItems: NavItem[] = baseLinks.map((base) => {
    const children = navPages
      .filter((p) => p.nav_parent?.toLowerCase() === base.label.toLowerCase())
      .map((p) => ({ href: `/${p.slug}`, label: p.title }));
    return children.length > 0 ? { ...base, children } : base;
  });

  // Top-level custom pages (no parent) appended after base links
  const topLevelPages = navPages
    .filter((p) => !p.nav_parent)
    .map((p) => ({ href: `/${p.slug}`, label: p.title }));

  const allItems: NavItem[] = [...navItems, ...topLevelPages];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setOpenDropdown(null); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <>
      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
        <Link href="/" className="nav-logo">
          Rift<span>.</span>
        </Link>

        {/* Desktop links */}
        <ul className="nav-links" ref={dropdownRef}>
          {allItems.map((item) => (
            <li key={item.href} style={{ position: "relative" }}>
              {item.children && item.children.length > 0 ? (
                <>
                  <button
                    onClick={() => setOpenDropdown(openDropdown === item.href ? null : item.href)}
                    className={pathname.startsWith(item.href) ? "active" : ""}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      padding: 0,
                      font: "inherit",
                      color: "inherit",
                      letterSpacing: "inherit",
                      textTransform: "inherit",
                    }}
                  >
                    {item.label}
                    <ChevronDown
                      size={11}
                      style={{
                        transition: "transform 0.25s",
                        transform: openDropdown === item.href ? "rotate(180deg)" : "rotate(0deg)",
                        opacity: 0.6,
                      }}
                    />
                  </button>

                  {/* Dropdown panel */}
                  {openDropdown === item.href && (
                    <div style={{
                      position: "absolute",
                      top: "calc(100% + 1rem)",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#111",
                      border: "1px solid rgba(201,168,76,0.15)",
                      minWidth: "180px",
                      zIndex: 200,
                      padding: "0.5rem 0",
                    }}>
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          style={{
                            display: "block",
                            padding: "0.65rem 1.25rem",
                            color: pathname === child.href ? "#c9a84c" : "#c8c8c8",
                            textDecoration: "none",
                            fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                            fontSize: "0.65rem",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            transition: "color 0.2s",
                            whiteSpace: "nowrap",
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#c9a84c"; }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.color =
                              pathname === child.href ? "#c9a84c" : "#c8c8c8";
                          }}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link href={item.href} className={pathname === item.href ? "active" : ""}>
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* Desktop book button */}
        <Link href="/booking" className="btn btn-primary nav-book-btn" style={{ padding: "0.6rem 1.4rem" }}>
          Book a Session
        </Link>

        {/* Mobile hamburger */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: "#f5f3ef",
            cursor: "pointer",
            padding: "0.4rem",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#080808",
          zIndex: 998,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          transform: menuOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          overflowY: "auto",
          padding: "2rem",
        }}
      >
        {allItems.map((item) => (
          <div key={item.href} style={{ textAlign: "center" }}>
            <Link
              href={item.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                fontSize: "2.8rem",
                fontWeight: 300,
                color: pathname === item.href ? "#c9a84c" : "#f5f3ef",
                textDecoration: "none",
                letterSpacing: "0.03em",
                transition: "color 0.3s",
              }}
            >
              {item.label}
            </Link>
            {/* Mobile sub-items */}
            {item.children && item.children.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.75rem" }}>
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                      fontSize: "0.7rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: pathname === child.href ? "#c9a84c" : "#6b6b6b",
                      textDecoration: "none",
                      transition: "color 0.3s",
                    }}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
        <Link
          href="/booking"
          onClick={() => setMenuOpen(false)}
          className="btn btn-primary"
          style={{ marginTop: "1rem" }}
        >
          Book a Session
        </Link>
      </div>
    </>
  );
}
