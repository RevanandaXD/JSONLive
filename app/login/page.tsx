"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiOutlineUser, HiLockClosed } from "react-icons/hi2";
import { AuthShell } from "@/components/layout/AuthShell";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field, PasswordInput, TextInput } from "@/components/ui/Input";
import { signIn, useSession } from "@/src/lib/auth-client";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailValid = EMAIL_PATTERN.test(email);

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
      const { data } = useSession();
      let callbackURL =
        new URLSearchParams(window.location.search).get("callbackURL") ||
        "/dashboard";
      
      if (data?.user.role === 'admin') {
        callbackURL = "/admin"
      }

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
      setError(
        err instanceof Error ? err.message : "Login failed",
      );
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
          disabled={loading}
          className="mt-1 w-full"
        >
          {loading ? "Logging in..." : "Log in"}
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
