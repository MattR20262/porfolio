"use client";

import { ExternalLink, Menu } from "lucide-react";
import Link from "next/link";
import { useAdminCtx } from "@/lib/admin-context";

interface AdminHeaderProps {
  title: string;
  action?: React.ReactNode;
}

export default function AdminHeader({ title, action }: AdminHeaderProps) {
  const { toggleSidebar } = useAdminCtx();

  return (
    <header className="admin-header">
      {/* Mobile hamburger */}
      <button
        onClick={toggleSidebar}
        className="admin-hamburger"
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </button>

      <h1 className="admin-header-title">{title}</h1>

      {action && <div className="admin-header-action">{action}</div>}

      <Link
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="admin-view-site"
      >
        <ExternalLink size={13} />
        <span>View Site</span>
      </Link>
    </header>
  );
}
