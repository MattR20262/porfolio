"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Images,
  FolderOpen,
  CalendarDays,
  MessageSquare,
  Library,
  FileText,
  Settings,
  LogOut,
  Quote,
  LayoutTemplate,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAdminCtx } from "@/lib/admin-context";
import toast from "react-hot-toast";

const nav = [
  {
    section: "Content",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/projects", label: "Projects", icon: Images },
      { href: "/admin/media", label: "Media Library", icon: Library },
      { href: "/admin/collections", label: "Collections", icon: FolderOpen },
      { href: "/admin/testimonials", label: "Testimonials", icon: Quote },
      { href: "/admin/pages",        label: "Pages",        icon: LayoutTemplate },
    ],
  },
  {
    section: "Clients",
    items: [
      { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
      { href: "/admin/messages", label: "Messages", icon: MessageSquare },
    ],
  },
  {
    section: "Site",
    items: [
      { href: "/admin/content", label: "Content Editor", icon: FileText },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen } = useAdminCtx();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className={`admin-sidebar${sidebarOpen ? " open" : ""}`}>
      <Link href="/admin/dashboard" className="sidebar-logo">
        Rift<span>.</span> Studio
      </Link>

      <nav className="sidebar-nav">
        {nav.map((group) => (
          <div key={group.section}>
            <p className="sidebar-section">{group.section}</p>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link${active ? " active" : ""}`}
                >
                  <Icon size={15} strokeWidth={1.5} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div style={{ padding: "1.5rem", borderTop: "1px solid rgba(201,168,76,0.08)" }}>
        <button
          onClick={handleLogout}
          className="sidebar-link"
          style={{ width: "100%", background: "none", border: "none" }}
        >
          <LogOut size={15} strokeWidth={1.5} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
