import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function Home() {
  return (
    <div className="min-h-screen quiet-app-shell">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16 sm:px-10">
        <div className="flex flex-col gap-12">
          <Logo size="lg" />

          <div className="max-w-3xl space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] quiet-text-secondary">
              Calm, night and morning
            </p>
            <h1 className="text-5xl font-semibold tracking-tight quiet-text-primary sm:text-6xl">
              Clear your head in the morning. Quiet it at night.
            </h1>
            <p className="max-w-2xl text-base leading-8 quiet-text-secondary sm:text-lg">
              Designed for young men with overactive minds and restless sleep, Quiet Mode gives you a calm space to build gentle routines and reclaim better rest.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full quiet-primary-cta px-6 py-3 text-sm font-semibold transition"
            >
              Get started
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full quiet-secondary-btn px-6 py-3 text-sm font-semibold transition"
            >
              Log in
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl quiet-panel p-6 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.3em] quiet-text-secondary">
                Quiet mornings
              </p>
              <p className="mt-3 text-lg font-medium quiet-text-primary">
                Start your day without the rush and keep your mind centered before the world takes over.
              </p>
            </div>
            <div className="rounded-3xl quiet-panel p-6 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.3em] quiet-text-secondary">
                Nightly reset
              </p>
              <p className="mt-3 text-lg font-medium quiet-text-primary">
                Wind down with a calm interface built to help your thoughts settle and your sleep deepen.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
