"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/layout/AdminHeader";
import { createClient } from "@/lib/supabase/client";
import type { ContactMessage } from "@/types";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";
import { Trash2 } from "lucide-react";

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    setMessages(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function openMessage(msg: ContactMessage) {
    setSelected(msg);
    if (!msg.read) {
      const supabase = createClient();
      await supabase.from("contact_messages").update({ read: true }).eq("id", msg.id);
      setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, read: true } : m));
    }
  }

  async function deleteMessage(id: string) {
    const supabase = createClient();
    await supabase.from("contact_messages").delete().eq("id", id);
    toast.success("Message deleted");
    setSelected(null);
    load();
  }

  return (
    <>
      <AdminHeader title="Messages" />
      <div className="admin-content" style={{ padding: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", height: "calc(100vh - 64px)" }}>
          {/* List */}
          <div style={{ borderRight: "1px solid rgba(245,243,239,0.06)", overflowY: "auto", background: "#111" }}>
            {loading ? (
              <p style={{ padding: "2rem", color: "#6b6b6b" }}>Loading...</p>
            ) : messages.length === 0 ? (
              <p style={{ padding: "2rem", color: "#6b6b6b" }}>No messages yet.</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => openMessage(msg)}
                  style={{
                    padding: "1.25rem 1.5rem",
                    borderBottom: "1px solid rgba(245,243,239,0.04)",
                    cursor: "pointer",
                    background: selected?.id === msg.id ? "rgba(201,168,76,0.06)" : "transparent",
                    transition: "background 0.2s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                    {!msg.read && (
                      <span style={{ width: 7, height: 7, background: "#c9a84c", borderRadius: "50%", flexShrink: 0 }} />
                    )}
                    <p style={{ color: msg.read ? "#9a9a9a" : "#f5f3ef", fontSize: "0.875rem", fontWeight: msg.read ? 400 : 500 }}>
                      {msg.name}
                    </p>
                  </div>
                  {msg.subject && (
                    <p style={{ color: "#6b6b6b", fontSize: "0.75rem", marginBottom: "0.25rem" }}>{msg.subject}</p>
                  )}
                  <p style={{ color: "#6b6b6b", fontSize: "0.7rem" }}>{formatDate(msg.created_at)}</p>
                </div>
              ))
            )}
          </div>

          {/* Detail */}
          {selected ? (
            <div style={{ padding: "2rem", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
                <div>
                  <h2 style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: 300, color: "#f5f3ef", marginBottom: "0.25rem" }}>
                    {selected.subject ?? "No subject"}
                  </h2>
                  <p style={{ color: "#6b6b6b", fontSize: "0.85rem" }}>
                    From {selected.name} &lt;{selected.email}&gt; · {formatDate(selected.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => deleteMessage(selected.id)}
                  style={{ background: "none", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", padding: "0.5rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: "var(--font-montserrat), Montserrat, sans-serif", fontSize: "0.65rem", letterSpacing: "0.1em" }}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
              <div className="gold-divider" />
              <p style={{ color: "#c8c8c8", lineHeight: 1.9, fontSize: "0.95rem", marginTop: "1.5rem", whiteSpace: "pre-wrap" }}>
                {selected.message}
              </p>
              <div style={{ marginTop: "2rem" }}>
                <a
                  href={`mailto:${selected.email}?subject=Re: ${selected.subject ?? "Your message"}`}
                  className="btn btn-primary"
                >
                  Reply via Email
                </a>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#3d3d3d" }}>
              <p>Select a message to read</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
