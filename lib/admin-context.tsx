"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface AdminCtxType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

const AdminCtx = createContext<AdminCtxType>({
  sidebarOpen: false,
  toggleSidebar: () => {},
  closeSidebar: () => {},
});

export function useAdminCtx() {
  return useContext(AdminCtx);
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  return (
    <AdminCtx.Provider value={{
      sidebarOpen,
      toggleSidebar: () => setSidebarOpen(o => !o),
      closeSidebar:  () => setSidebarOpen(false),
    }}>
      {children}
    </AdminCtx.Provider>
  );
}
