"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { HiOutlineUser, HiLockClosed } from "react-icons/hi2";
import { FcGoogle } from "react-icons/fc";

import { AuthShell } from "@/components/layout/AuthShell";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field, PasswordInput, TextInput } from "@/components/ui/Input";
import { signIn, useSession } from "@/src/lib/auth-client";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function resolveCallbackURL(
  raw: string | null,
  role: string | null | undefined,
) {
  if (role === "admin") return "/admin";

  if (raw && raw.startsWith("/") && !raw.startsWith("//")) {
    return raw;
  }

  return "/dashboard";
}

export default function LoginPage() {
  const router = useRouter();
  const { data } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  useEffect(() => {
    const handlePageShow = () => {
      setLoading(false);
      setLoadingGoogle(false);
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  const emailValid = EMAIL_PATTERN.test(email);

  const handleAuthGoogle = async () => {
    try {
      setError(null);
      setLoadingGoogle(true);
      const callbackURL = resolveCallbackURL(
        new URLSearchParams(window.location.search).get("callbackURL"),
        data?.user.role,
      );
      await signIn.social({
        provider: "google",
        callbackURL,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      setLoadingGoogle(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    if (!emailValid) {
      setError("That email format is not valid");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const callbackURL = resolveCallbackURL(
        new URLSearchParams(window.location.search).get("callbackURL"),
        data?.user.role,
      );

      const { error: resError } = await signIn.email({
        email,
        password,
        callbackURL,
      });

      if (resError) {
        setError(resError.message || "Login failed");
        setLoading(false);
        return;
      }

      router.push(callbackURL);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  };

  return (
    <AuthShell
      aside={{
        heading: "Welcome back",
        description:
          "Log in to manage your mock JSON APIs and endpoints in real-time.",
      }}
    >
      <div className="mb-6">
        <h1 className="font-heading text-xl font-bold text-foreground">
          Log in
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your credentials to access your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Email" htmlFor="email">
          <TextInput
            id="email"
            icon={HiOutlineUser}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="e.g. revan@example.com"
          />
        </Field>

        <Field label="Password" htmlFor="password">
          <PasswordInput
            id="password"
            icon={HiLockClosed}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </Field>

        {error && <Alert tone="danger">{error}</Alert>}

        <Button
          type="submit"
          variant="primary"
          disabled={loading || loadingGoogle}
          className="mt-1 w-full cursor-pointer py-2.5 shadow-xs"
        >
          {loading ? "Logging in..." : "Log in"}
        </Button>

        <div className="relative my-1 flex items-center justify-center">
          <div className="w-full border-t border-border/80" />
          <span className="absolute bg-card px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            or
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleAuthGoogle}
          disabled={loading || loadingGoogle}
          className="w-full flex items-center justify-center gap-2.5 cursor-pointer py-2.5 border-border/80 hover:bg-muted/80 transition-all font-medium"
        >
          <FcGoogle className="h-4 w-4 shrink-0 text-base" />
          <span>{loadingGoogle ? "Connecting to Google..." : "Continue with Google"}</span>
        </Button>
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
    </AuthShell>
  );
}
