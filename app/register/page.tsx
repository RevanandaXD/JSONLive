"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HiOutlineCheckBadge,
  HiOutlineEnvelope,
  HiOutlineUser,
  HiLockClosed,
} from "react-icons/hi2";
import { FcGoogle } from "react-icons/fc";
import { AuthShell } from "@/components/layout/AuthShell";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Turnstile } from "@/components/ui/Turnstile";
import { Field, PasswordInput, TextInput } from "@/components/ui/Input";
import { signIn, signUp } from "@/src/lib/auth-client";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-z0-9_-]{3,20}$/;
const MIN_PASSWORD = 6;

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

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

  const handleAuthGoogle = async () => {
    try {
      setError(null);
      setLoadingGoogle(true);
      await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      setLoadingGoogle(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim() || !username.trim() || !password) {
      setError("All fields are required");
      return;
    }
    if (!EMAIL_PATTERN.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!USERNAME_PATTERN.test(username)) {
      setError("Username must be 3-20 characters (a-z, 0-9, _ or -)");
      return;
    }
    if (password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters`);
      return;
    }

    if (!turnstileToken) {
      setError("Please complete the bot verification.");
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
        fetchOptions: {
          body: {
            turnstileToken,
          },
        },
      });

      if (resError) {
        setError(resError.message || "Registration failed");
        setLoading(false);
        setTurnstileToken(null)
        if (typeof window !== 'undefined' && window.turnstile) {
          window.turnstile.reset()
        }
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
      setLoading(false);
    }
  };

  return (
    <AuthShell
      aside={{
        heading: "Create account",
        description:
          "Turn your JSON into a public API endpoint in seconds. Zero backend setup required.",
      }}
    >
      <div className="mb-6">
        <h1 className="font-heading text-xl font-bold text-foreground">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Get started for free.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Username" htmlFor="username">
          <TextInput
            id="username"
            icon={HiOutlineUser}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            placeholder="e.g. revan"
          />
        </Field>

        <Field label="Email" htmlFor="email">
          <TextInput
            id="email"
            icon={HiOutlineEnvelope}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="e.g. revan@example.com"
          />
        </Field>

        <Field
          label="Password"
          htmlFor="password"
          hint={`Minimum ${MIN_PASSWORD} characters.`}
        >
          <PasswordInput
            id="password"
            value={password}
            icon={HiLockClosed}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="Min. 6 characters"
          />
        </Field>

        {error && <Alert tone="danger">{error}</Alert>}

        <Turnstile
          onSuccess={(token) => setTurnstileToken(token)}
          onExpire={() => setTurnstileToken(null)}
          onError={() => setTurnstileToken(null)}
        />

        <Button
          type="submit"
          variant="primary"
          disabled={loading || loadingGoogle}
          className="mt-1 w-full cursor-pointer py-2.5 shadow-xs"
        >
          {loading ? "Creating account..." : "Create account"}
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
          disabled={loading || loadingGoogle || !turnstileToken}
          className="w-full flex items-center justify-center gap-2.5 cursor-pointer py-2.5 border-border/80 hover:bg-muted/80 transition-all font-medium"
        >
          <FcGoogle className="h-4 w-4 shrink-0 text-base" />
          <span>
            {loadingGoogle ? "Connecting to Google..." : "Continue with Google"}
          </span>
        </Button>
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
    </AuthShell>
  );
}
