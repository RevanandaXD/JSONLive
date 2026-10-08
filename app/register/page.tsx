"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HiOutlineCheckBadge,
  HiOutlineEnvelope,
  HiOutlineUser,
  HiLockClosed
} from "react-icons/hi2";
import { AuthShell } from "@/components/layout/AuthShell";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field, PasswordInput, TextInput } from "@/components/ui/Input";
import { signUp } from "@/src/lib/auth-client";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-z0-9_-]{3,20}$/;
const MIN_PASSWORD = 6;

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        setLoading(false);
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
        <p className="mt-1 text-sm text-muted-foreground">Get started for free.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

        <Field label="Confirm password" htmlFor="confirm">
          <PasswordInput
            id="confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            placeholder="Repeat your password"
            icon={HiOutlineCheckBadge}
          />
        </Field>

        {error && <Alert tone="danger">{error}</Alert>}

        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="mt-1 w-full"
        >
          {loading ? "Creating account..." : "Create account"}
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
