"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#080808",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        backgroundImage: `
          linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "#0d0d0d",
          border: "1px solid rgba(201,168,76,0.15)",
          padding: "3rem",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <p
            style={{
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
              fontSize: "2rem",
              fontWeight: 300,
              letterSpacing: "0.08em",
              color: "#f5f3ef",
            }}
          >
            Matt<span style={{ color: "#c9a84c" }}>.</span>
          </p>
          <p
            style={{
              fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
              fontSize: "0.6rem",
              fontWeight: 500,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#6b6b6b",
              marginTop: "0.5rem",
            }}
          >
            Studio Admin
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              required
              autoComplete="email"
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group" style={{ position: "relative" }}>
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type={showPass ? "text" : "password"}
              className="form-input"
              required
              autoComplete="current-password"
              style={{ paddingRight: "3rem" }}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              style={{
                position: "absolute",
                right: "1rem",
                top: "calc(1.4rem + 0.9rem)",
                background: "none",
                border: "none",
                color: "#6b6b6b",
                cursor: "pointer",
                padding: 0,
              }}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: "100%",
              justifyContent: "center",
              marginTop: "0.5rem",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p
          style={{
            marginTop: "1.5rem",
            textAlign: "center",
            fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
            fontSize: "0.65rem",
            color: "#3d3d3d",
            letterSpacing: "0.05em",
          }}
        >
          Trouble signing in? Contact your administrator.
        </p>
      </div>
    </div>
  );
}
