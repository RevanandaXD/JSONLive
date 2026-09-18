"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineEnvelope,
  HiOutlineUser,
  HiOutlineLockClosed,
  HiOutlineCheckBadge,
  HiXMark,
} from "react-icons/hi2";
import { Background } from "@/components/background/Background";
import { Logo } from "@/components/ui/Logo";
import { signUp } from "@/src/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const usernameValid = /^[a-z0-9_-]{3,20}$/.test(username);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim() || !username.trim() || !password) {
      setError("All fields are required");
      return;
    }
    if (!emailValid) {
      setError("Please enter a valid email address");
      return;
    }
    if (!usernameValid) {
      setError("Username must be 3-20 characters (a-z, 0-9, _ or -)");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: resError } = await signUp.email({
        email,
        password,
        name: username,
        username,
        callbackURL: "/dashboard",
      });

      if (resError) {
        setError(resError.message || "Registration failed");
        return;
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Background />
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6">
        
        {/* Main Card Container */}
        <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-2xl backdrop-blur-md md:min-h-[560px]">
          
          {/* Tombol Exit (Close Button) */}
          <Link
            href="/"
            className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/60 text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95"
            title="Exit to home"
            aria-label="Exit to home"
          >
            <HiXMark className="h-5 w-5" />
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 md:min-h-[560px]">
            
            {/* Section Kosong / Brand Panel (Sebelah Kiri) */}
            <div className="relative hidden flex-col justify-between border-r border-border/60 bg-gradient-to-br from-primary/10 via-card to-background p-8 md:flex md:min-h-[560px]">
              
              {/* Logo di Kiri Atas */}
              <Logo href="/" className="text-xl" />

              {/* Konten Tengah (Minimalis) */}
              <div className="my-auto py-8">
                <h2 className="font-md text-2xl font-bold text-foreground">
                  Create account
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Turn your JSON into a public API endpoint in seconds. Zero backend setup required.
                </p>
              </div>

              {/* Footer Kiri */}
              <div className="text-xs text-muted-foreground/60">
                JSONLive API Platform
              </div>
            </div>

            {/* Section Form (Sebelah Kanan) */}
            <div className="flex flex-col justify-center px-6 py-8 sm:px-8 md:min-h-[560px]">
              
              {/* Logo khusus tampilan Mobile (saat panel kiri tersembunyi) */}
              <Logo href="/" className="mb-6 text-xl md:hidden" />

              <div className="mb-6">
                <h1 className="font-heading text-xl font-bold text-foreground">
                  Create your account
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get started for free.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-foreground">
                    Email
                  </label>
                  <div className="relative">
                    <HiOutlineEnvelope className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      placeholder="e.g. revan@example.com"
                      className="w-full rounded-lg border border-border/70 bg-background py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="username" className="mb-1.5 block text-sm font-semibold text-foreground">
                    Username
                  </label>
                  <div className="relative">
                    <HiOutlineUser className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                      placeholder="e.g. revan"
                      className="w-full rounded-lg border border-border/70 bg-background py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <HiOutlineLockClosed className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      placeholder="Min. 6 characters"
                      className="w-full rounded-lg border border-border/70 bg-background py-2.5 pl-10 pr-11 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showPassword ? (
                        <HiOutlineEyeSlash className="h-5 w-5" />
                      ) : (
                        <HiOutlineEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm" className="mb-1.5 block text-sm font-semibold text-foreground">
                    Confirm password
                  </label>
                  <div className="relative">
                    <HiOutlineCheckBadge className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="confirm"
                      type={showPassword ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      autoComplete="new-password"
                      placeholder="Repeat your password"
                      className="w-full rounded-lg border border-border/70 bg-background py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/50"
                    />
                  </div>
                </div>

                {error && (
                  <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-background cursor-pointer"
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>
              </form>

              <p className="mt-5 text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-primary transition-colors hover:text-primary-hover"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
