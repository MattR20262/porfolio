"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/layout/AdminHeader";
import { createClient } from "@/lib/supabase/client";
import type { Booking } from "@/types";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";

const statuses = ["new", "pending", "confirmed", "completed", "archived"] as const;

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    setBookings(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id);

    if (error) { toast.error("Failed to update status"); return; }
    toast.success(`Status updated to ${status}`);
    setSelected((prev) => prev ? { ...prev, status: status as Booking["status"] } : null);
    load();
  }

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const statusColor: Record<string, string> = {
    new: "#c9a84c", pending: "#64a0dc", confirmed: "#50c878",
    completed: "#9a9a9a", archived: "#6b6b6b",
  };

  return (
    <>
      <AdminHeader title="Bookings" />
      <div className="admin-content">
        {/* Stats mini-cards */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {[{ label: "All", val: "all" }, ...statuses.map((s) => ({ label: s, val: s }))].map((s) => {
            const count = s.val === "all" ? bookings.length : bookings.filter((b) => b.status === s.val).length;
            return (
              <button
                key={s.val}
                onClick={() => setFilter(s.val)}
                style={{
                  padding: "0.75rem 1.25rem",
                  background: filter === s.val ? "rgba(201,168,76,0.1)" : "#1a1a1a",
                  border: `1px solid ${filter === s.val ? "#c9a84c" : "rgba(245,243,239,0.06)"}`,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <p style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif", fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#6b6b6b", marginBottom: "0.3rem" }}>
                  {s.label}
                </p>
                <p style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: 300, color: "#f5f3ef" }}>
                  {count}
                </p>
              </button>
            );
          })}
        </div>

        <div className={`admin-bookings-split${selected ? "" : " no-detail"}`}>
          {/* Table */}
          <div style={{ background: "#1a1a1a", border: "1px solid rgba(245,243,239,0.06)", overflow: "auto" }}>
            {loading ? (
              <p style={{ padding: "2rem", color: "#6b6b6b" }}>Loading...</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Budget</th>
                    <th>Status</th>
                    <th>Received</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => (
                    <tr
                      key={b.id}
                      onClick={() => setSelected(b)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>
                        <p style={{ color: "#f5f3ef", fontWeight: 500 }}>{b.full_name}</p>
                        <p style={{ color: "#6b6b6b", fontSize: "0.75rem" }}>{b.email}</p>
                      </td>
                      <td>{b.service_type}</td>
                      <td>{b.event_date ?? "—"}</td>
                      <td>{b.budget ?? "—"}</td>
                      <td>
                        <span
                          className="badge"
                          style={{ color: statusColor[b.status], background: `${statusColor[b.status]}22` }}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td style={{ color: "#6b6b6b" }}>{formatDate(b.created_at)}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: "center", color: "#6b6b6b", padding: "3rem" }}>No bookings.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Detail panel */}
          {selected && (
            <div style={{ background: "#1a1a1a", border: "1px solid rgba(245,243,239,0.06)", padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                <p style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontSize: "1.3rem", fontWeight: 300, color: "#f5f3ef" }}>
                  {selected.full_name}
                </p>
                <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#6b6b6b", cursor: "pointer", fontSize: "1.2rem" }}>×</button>
              </div>

              {[
                { label: "Email", val: selected.email },
                { label: "Phone", val: selected.phone ?? "—" },
                { label: "Service", val: selected.service_type },
                { label: "Date", val: selected.event_date ?? "—" },
                { label: "Location", val: selected.location ?? "—" },
                { label: "Budget", val: selected.budget ?? "—" },
              ].map((f) => (
                <div key={f.label} style={{ marginBottom: "1rem" }}>
                  <p style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif", fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#6b6b6b", marginBottom: "0.25rem" }}>{f.label}</p>
                  <p style={{ color: "#c8c8c8", fontSize: "0.9rem" }}>{f.val}</p>
                </div>
              ))}

              <div style={{ marginBottom: "1.5rem" }}>
                <p style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif", fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#6b6b6b", marginBottom: "0.5rem" }}>Message</p>
                <p style={{ color: "#c8c8c8", fontSize: "0.875rem", lineHeight: 1.8 }}>{selected.message}</p>
              </div>

              <div className="gold-divider" style={{ margin: "1.5rem 0" }} />
              <p style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif", fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#6b6b6b", marginBottom: "0.75rem" }}>Update Status</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {statuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(selected.id, s)}
                    className="filter-btn"
                    style={{
                      background: selected.status === s ? statusColor[s] + "33" : "",
                      borderColor: selected.status === s ? statusColor[s] : "",
                      color: selected.status === s ? statusColor[s] : "",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
