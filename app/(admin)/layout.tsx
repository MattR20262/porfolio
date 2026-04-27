"use client";

import { AdminProvider, useAdminCtx } from "@/lib/admin-context";
import AdminSidebar from "@/components/layout/AdminSidebar";
import CustomCursor from "@/components/public/CustomCursor";

function AdminShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, closeSidebar } = useAdminCtx();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <CustomCursor />

      {/* Mobile overlay — closes sidebar on tap */}
      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 99,
            display: "none",
          }}
          className="admin-overlay"
        />
      )}

      <AdminSidebar />
      <div className="admin-main">{children}</div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminShell>{children}</AdminShell>
    </AdminProvider>
  );
}
