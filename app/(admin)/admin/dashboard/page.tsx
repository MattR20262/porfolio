import { createClient } from "@/lib/supabase/server";
import AdminHeader from "@/components/layout/AdminHeader";
import Link from "next/link";
import { Images, CalendarDays, MessageSquare, FolderOpen, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { count: projectCount },
    { count: bookingCount },
    { count: messageCount },
    { count: collectionCount },
    { data: recentBookings },
    { data: recentMessages },
  ] = await Promise.all([
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("contact_messages").select("*", { count: "exact", head: true }).eq("read", false),
    supabase.from("collections").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(5),
    supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(5),
  ]);

  const stats = [
    { label: "Total Projects", value: projectCount ?? 0, icon: Images, href: "/admin/projects" },
    { label: "New Bookings", value: bookingCount ?? 0, icon: CalendarDays, href: "/admin/bookings" },
    { label: "Unread Messages", value: messageCount ?? 0, icon: MessageSquare, href: "/admin/messages" },
    { label: "Collections", value: collectionCount ?? 0, icon: FolderOpen, href: "/admin/collections" },
  ];

  const statusColor: Record<string, string> = {
    new: "#c9a84c",
    pending: "#64a0dc",
    confirmed: "#50c878",
    completed: "#9a9a9a",
    archived: "#6b6b6b",
  };

  return (
    <>
      <AdminHeader title="Dashboard" />
      <div className="admin-content">
        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                href={stat.href}
                className="stat-card"
                style={{ textDecoration: "none" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p
                      style={{
                        fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                        fontSize: "0.6rem",
                        fontWeight: 600,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "#6b6b6b",
                        marginBottom: "0.75rem",
                      }}
                    >
                      {stat.label}
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                        fontSize: "3rem",
                        fontWeight: 300,
                        color: "#f5f3ef",
                        lineHeight: 1,
                      }}
                    >
                      {stat.value}
                    </p>
                  </div>
                  <Icon size={22} color="#c9a84c" strokeWidth={1.5} />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Two-column layout */}
        <div className="admin-dash-panels">
          {/* Recent Bookings */}
          <div
            style={{
              background: "#1a1a1a",
              border: "1px solid rgba(245,243,239,0.06)",
              padding: "1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                  fontSize: "1.2rem",
                  fontWeight: 300,
                  color: "#f5f3ef",
                }}
              >
                Recent Bookings
              </p>
              <Link
                href="/admin/bookings"
                style={{
                  color: "#c9a84c",
                  fontSize: "0.7rem",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                  letterSpacing: "0.1em",
                }}
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {recentBookings?.map((b) => (
                <div
                  key={b.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.75rem",
                    background: "#111",
                    border: "1px solid rgba(245,243,239,0.04)",
                  }}
                >
                  <div>
                    <p style={{ color: "#f5f3ef", fontSize: "0.85rem" }}>{b.full_name}</p>
                    <p style={{ color: "#6b6b6b", fontSize: "0.75rem" }}>{b.service_type}</p>
                  </div>
                  <span
                    className="badge"
                    style={{ color: statusColor[b.status] ?? "#6b6b6b", background: `${statusColor[b.status] ?? "#6b6b6b"}22` }}
                  >
                    {b.status}
                  </span>
                </div>
              ))}
              {!recentBookings?.length && (
                <p style={{ color: "#6b6b6b", fontSize: "0.85rem" }}>No bookings yet.</p>
              )}
            </div>
          </div>

          {/* Recent Messages */}
          <div
            style={{
              background: "#1a1a1a",
              border: "1px solid rgba(245,243,239,0.06)",
              padding: "1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                  fontSize: "1.2rem",
                  fontWeight: 300,
                  color: "#f5f3ef",
                }}
              >
                Recent Messages
              </p>
              <Link
                href="/admin/messages"
                style={{
                  color: "#c9a84c",
                  fontSize: "0.7rem",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                  letterSpacing: "0.1em",
                }}
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {recentMessages?.map((m) => (
                <div
                  key={m.id}
                  style={{
                    padding: "0.75rem",
                    background: "#111",
                    border: "1px solid rgba(245,243,239,0.04)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                    <p style={{ color: "#f5f3ef", fontSize: "0.85rem" }}>
                      {!m.read && (
                        <span
                          style={{
                            display: "inline-block",
                            width: 6,
                            height: 6,
                            background: "#c9a84c",
                            borderRadius: "50%",
                            marginRight: "0.5rem",
                            verticalAlign: "middle",
                          }}
                        />
                      )}
                      {m.name}
                    </p>
                    <p style={{ color: "#6b6b6b", fontSize: "0.7rem" }}>{m.email}</p>
                  </div>
                  {m.subject && (
                    <p style={{ color: "#6b6b6b", fontSize: "0.75rem" }}>{m.subject}</p>
                  )}
                </div>
              ))}
              {!recentMessages?.length && (
                <p style={{ color: "#6b6b6b", fontSize: "0.85rem" }}>No messages yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div
          style={{
            marginTop: "1.5rem",
            background: "#1a1a1a",
            border: "1px solid rgba(245,243,239,0.06)",
            padding: "1.5rem",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
              fontSize: "1.2rem",
              fontWeight: 300,
              color: "#f5f3ef",
              marginBottom: "1rem",
            }}
          >
            Quick Actions
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {[
              { label: "New Project", href: "/admin/projects/new" },
              { label: "View Bookings", href: "/admin/bookings" },
              { label: "Edit Content", href: "/admin/content" },
              { label: "View Site", href: "/", target: "_blank" },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                target={action.target}
                className="btn btn-outline"
                style={{ padding: "0.5rem 1rem", fontSize: "0.6rem" }}
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
