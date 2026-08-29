import { useState } from "react";
import { ArrowRight, LockKeyhole, X } from "lucide-react";
import { apiUrl, safeStorage } from "./apiConfig";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  provider: "email" | "google" | "linkedin" | "github";
  bio?: string;
  linkedin?: string;
  github?: string;
  experience?: string;
  projects?: string;
};

type Props = {
  onClose: () => void;
  onAuthenticated: (user: AuthUser) => void;
};

export function AuthModal({ onClose, onAuthenticated }: Props) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanName = name.trim();

    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (cleanPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (mode === "signup" && cleanName.length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const endpoint = mode === "signin" ? "/api/auth/login" : "/api/auth/signup";
      const targetUrl = apiUrl(endpoint);
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName || "Candidate",
          email: cleanEmail,
          password: cleanPassword,
        }),
      });

      const rawText = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        data = { error: rawText || "Unexpected response from authentication server." };
      }

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed. Please check your credentials.");
      }

      if (data.token) {
        safeStorage.set("telos-token", data.token);
      }
      if (data.user) {
        onAuthenticated(data.user);
      }
    } catch (reason) {
      const msg = reason instanceof Error ? reason.message : "Authentication failed.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal auth-modal" role="dialog" aria-modal="true" aria-label="TeLos account access">
      <div className="auth-card">
        <button className="close-modal" type="button" onClick={onClose} aria-label="Close account dialog">
          <X size={18} />
        </button>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
          <p className="kicker">TELOS / PRIVATE CANDIDATE SPACE</p>
          <h2>
            {mode === "signin" ? (
              <>
                Welcome
                <br />
                <i>back.</i>
              </>
            ) : (
              <>
                Build your
                <br />
                <i>signal.</i>
              </>
            )}
          </h2>
          <p className="auth-copy">
            Your interview history, assessment integrity record, and drills travel with your account.
          </p>

          {mode === "signup" && (
            <label>
              FULL NAME
              <input
                required
                minLength={2}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Aarav Sharma"
                autoComplete="name"
              />
            </label>
          )}

          <label>
            EMAIL ADDRESS
            <input
              required
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <label>
            PASSWORD
            <input
              required
              minLength={8}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-submit" disabled={busy} type="submit">
            {busy ? "SECURING YOUR SESSION…" : mode === "signin" ? "SIGN IN TO TELOS" : "CREATE ACCOUNT"}{" "}
            <ArrowRight size={16} />
          </button>

          <p className="auth-switch">
            {mode === "signin" ? "New to TeLos?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError("");
              }}
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>

          <p className="auth-security">
            <LockKeyhole size={13} /> Passwords and session tokens are encrypted end-to-end.
          </p>
        </form>
      </div>
    </div>
  );
}
