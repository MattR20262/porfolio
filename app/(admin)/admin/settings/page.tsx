"use client";

import { useState } from "react";
import AdminHeader from "@/components/layout/AdminHeader";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [tab, setTab] = useState("account");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handlePasswordChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const newPassword = (form.elements.namedItem("new_password") as HTMLInputElement).value;
    const confirm = (form.elements.namedItem("confirm_password") as HTMLInputElement).value;

    if (newPassword !== confirm) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) toast.error(error.message);
    else { toast.success("Password updated"); form.reset(); }
    setLoading(false);
  }

  const tabs = [
    { id: "account", label: "Account" },
    { id: "notifications", label: "Notifications" },
    { id: "danger", label: "Danger Zone" },
  ];

  return (
    <>
      <AdminHeader title="Settings" />
      <div className="admin-content">
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`filter-btn${tab === t.id ? " active" : ""}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ background: "#1a1a1a", border: "1px solid rgba(245,243,239,0.06)", padding: "2rem", maxWidth: "600px" }}>
          {tab === "account" && (
            <div>
              <p style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 300, color: "#f5f3ef", marginBottom: "1.5rem" }}>
                Change Password
              </p>
              <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label className="form-label">New Password</label>
                  <input name="new_password" type="password" className="form-input" required minLength={6} placeholder="Min 6 characters" />
                </div>
                <div>
                  <label className="form-label">Confirm Password</label>
                  <input name="confirm_password" type="password" className="form-input" required minLength={6} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: "flex-start" }}>
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>
          )}

          {tab === "notifications" && (
            <div>
              <p style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 300, color: "#f5f3ef", marginBottom: "1.5rem" }}>
                Email Notifications
              </p>
              <p style={{ color: "#6b6b6b", fontSize: "0.85rem" }}>
                Notification settings coming soon. Configure email alerts for new bookings and messages.
              </p>
            </div>
          )}

          {tab === "danger" && (
            <div>
              <p style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 300, color: "#ef4444", marginBottom: "1.5rem" }}>
                Danger Zone
              </p>
              <p style={{ color: "#6b6b6b", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                These actions are irreversible. Proceed with caution.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ padding: "1rem", border: "1px solid rgba(239,68,68,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ color: "#f5f3ef", fontSize: "0.9rem" }}>Sign Out All Sessions</p>
                    <p style={{ color: "#6b6b6b", fontSize: "0.75rem" }}>Signs out all active admin sessions</p>
                  </div>
                  <button
                    onClick={async () => {
                      const supabase = createClient();
                      await supabase.auth.signOut({ scope: "global" });
                      router.push("/admin/login");
                    }}
                    style={{ padding: "0.5rem 1rem", background: "none", border: "1px solid rgba(239,68,68,0.4)", color: "#ef4444", cursor: "pointer", fontFamily: "var(--font-montserrat), Montserrat, sans-serif", fontSize: "0.6rem", letterSpacing: "0.1em" }}
                  >
                    Sign Out All
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
