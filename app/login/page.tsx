"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineUser,
  HiOutlineLockClosed,
  HiXMark,
} from "react-icons/hi2";
import { Background } from "@/components/background/Background";
import { Logo } from "@/components/ui/Logo";
import { signIn } from "@/src/lib/auth-client";
import { FaGithub } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!emailValid || !password) {
      setError("Username and password are required");
      return;
    }
    if (!emailValid) {
      setError("Format email are not valid");
      return;
    }

    setError(null);
    try {
      const callbackURL =
        new URLSearchParams(window.location.search).get("callbackURL") ||
        "/dashboard";

      const { error: resError } = await signIn.email({
        email,
        password,
        callbackURL,
      });

      if (resError) {
        setError(resError.message || "Login Failed");
        return;
      }

      router.push(callbackURL);
    } catch (resError: unknown) {
      const message = (resError as { message?: string })?.message;
      setError(message || "Login Failed");
    }
  };

  return (
    <>
      <Background />
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6">
        {/* Main Card Container with fixed min-height for uniform layout */}
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
                <h2 className="font-heading text-2xl font-bold text-foreground">
                  Welcome back
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Log in to manage your mock JSON APIs and endpoints in
                  real-time.
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
                  Log in
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter your credentials to access your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-semibold text-foreground"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <HiOutlineUser className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      placeholder="e.g. revan@example.com"
                      className="w-full rounded-lg border border-border/70 bg-background py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-sm font-semibold text-foreground"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <HiOutlineLockClosed className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-border/70 bg-background py-2.5 pl-10 pr-11 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
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

                {error && (
                  <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="mt-1 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-background cursor-pointer"
                >
                  Log in
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-white rounded-md cursor-pointer transition ease-in duration-200 hover:bg-white hover:text-black">
                  <FaGithub size={15} />
                  <span className="text-sm font-medium">Github</span>
                </button>
              </form>

              <p className="mt-5 text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-primary transition-colors hover:text-primary-hover"
                >
                  Create one
                </Link>
              </p>

              <div className="flex items-center mt-3.5">
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
