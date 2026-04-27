"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminHeader from "@/components/layout/AdminHeader";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/types";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    setProjects(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function togglePublished(id: string, current: boolean) {
    const res = await fetch("/api/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, published: !current }),
    });
    if (!res.ok) { toast.error("Failed"); return; }
    toast.success(current ? "Unpublished" : "Published");
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, published: !current } : p));
  }

  async function deleteProject(id: string) {
    if (!confirm("Delete this project?")) return;
    const res = await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Failed to delete"); return; }
    toast.success("Deleted");
    load();
  }

  return (
    <>
      <AdminHeader
        title="Projects"
        action={
          <Link href="/admin/projects/new" className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.6rem" }}>
            <Plus size={13} /> New Project
          </Link>
        }
      />
      <div className="admin-content">
        <div style={{ background: "#1a1a1a", border: "1px solid rgba(245,243,239,0.06)", overflow: "auto" }}>
          {loading ? (
            <p style={{ padding: "2rem", color: "#6b6b6b" }}>Loading...</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Featured</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <p style={{ color: "#f5f3ef" }}>{p.title}</p>
                      <p style={{ color: "#6b6b6b", fontSize: "0.7rem" }}>/{p.slug}</p>
                    </td>
                    <td style={{ textTransform: "capitalize" }}>{p.category}</td>
                    <td>
                      {p.featured ? (
                        <span className="badge badge-new">Featured</span>
                      ) : (
                        <span style={{ color: "#3d3d3d", fontSize: "0.75rem" }}>—</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${p.published ? "badge-published" : "badge-draft"}`}>
                        {p.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td style={{ color: "#6b6b6b" }}>{formatDate(p.created_at)}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => togglePublished(p.id, p.published)}
                          style={{ background: "none", border: "none", color: "#6b6b6b", cursor: "pointer", padding: "0.25rem" }}
                          title={p.published ? "Unpublish" : "Publish"}
                        >
                          {p.published ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <Link
                          href={`/admin/projects/${p.id}/edit`}
                          style={{ color: "#6b6b6b", display: "flex", padding: "0.25rem" }}
                        >
                          <Pencil size={15} />
                        </Link>
                        <button
                          onClick={() => deleteProject(p.id)}
                          style={{ background: "none", border: "none", color: "#6b6b6b", cursor: "pointer", padding: "0.25rem" }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {projects.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", color: "#6b6b6b", padding: "3rem" }}>
                      No projects yet.{" "}
                      <Link href="/admin/projects/new" style={{ color: "#c9a84c" }}>
                        Create your first project →
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
