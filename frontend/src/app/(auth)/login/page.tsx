"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import type { User } from "@/types/auth";

type Step = "email" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: apiError } = await api.post<{
      message: string;
      expires_in: number;
      otp_code: string;
    }>("/auth/register", { email });

    setLoading(false);

    if (apiError) {
      setError(apiError.message);
      return;
    }

    if (data?.otp_code) {
      setDevOtp(data.otp_code);
    }
    setStep("otp");
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: apiError } = await api.post<{
      access_token: string;
      refresh_token: string;
      user: User;
    }>("/auth/verify", { email, code });

    setLoading(false);

    if (apiError) {
      setError(apiError.message);
      return;
    }

    if (data) {
      login(data.access_token, data.refresh_token, data.user);
      router.push("/projects");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-soft">
      <div className="w-full max-w-md rounded-card border border-white/60 bg-white/80 backdrop-blur-sm p-8 shadow-card">
        <h1 className="mb-2 text-2xl font-bold text-foreground">
          AI Business Constructor
        </h1>
        <p className="mb-6 text-sm text-foreground/60">
          Войдите или создайте аккаунт
        </p>

        {step === "email" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-btn border border-border px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-btn bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
            >
              {loading ? "Отправка..." : "Получить код"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-sm text-foreground/70">
              Код отправлен на <span className="font-medium">{email}</span>
            </p>

            {devOtp && (
              <div className="rounded-btn bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
                DEV-режим — ваш код: <span className="font-mono font-bold">{devOtp}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="code"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                Код подтверждения
              </label>
              <input
                id="code"
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full rounded-btn border border-border px-4 py-2.5 text-center font-mono text-lg tracking-widest outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-btn bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
            >
              {loading ? "Проверка..." : "Войти"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setError("");
                setDevOtp("");
              }}
              className="w-full text-sm text-foreground/50 hover:text-foreground"
            >
              Изменить email
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
