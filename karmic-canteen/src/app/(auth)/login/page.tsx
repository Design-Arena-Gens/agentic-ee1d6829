import { Suspense } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { LoginForm } from '@/components/auth/login-form';

export const metadata = {
  title: 'Sign in | Karmic Canteen',
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-slate-950 py-12 sm:px-6 lg:px-8">
      <div className="absolute inset-0">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.25),_transparent_65%)]" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-indigo-500/30 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl rounded-2xl border border-slate-800 bg-slate-950/80 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="grid gap-0 lg:grid-cols-[1.35fr_1fr]">
          <div className="relative hidden min-h-full flex-col justify-between border-r border-slate-800 bg-gradient-to-br from-indigo-600/40 via-indigo-500/20 to-transparent p-12 lg:flex">
            <div className="flex items-center gap-3 text-slate-100">
              <div className="rounded-full bg-indigo-500/60 p-3 shadow-lg shadow-indigo-700/40">
                <span className="text-xl font-semibold tracking-widest text-white">KC</span>
              </div>
              <div>
                <p className="text-sm font-medium uppercase text-indigo-200/80">Karmic Solutions</p>
                <p className="text-lg font-semibold text-white">Canteen Experience Platform</p>
              </div>
            </div>

            <div className="space-y-6 text-slate-100/90">
              <h1 className="text-3xl font-semibold leading-tight text-white">
                Smarter meal planning for a zero-waste canteen
              </h1>
              <p className="max-w-xl text-base text-slate-200/80">
                Plan ahead, delight employees, and align procurement with actual demand. Karmic Canteen brings together
                menu visibility, meal commitments, and actionable analytics so every serving counts.
              </p>
              <ul className="space-y-3 text-sm text-slate-100">
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/30 text-emerald-200">
                    ✓
                  </span>
                  Live commitment tracking by meal slot
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/30 text-emerald-200">
                    ✓
                  </span>
                  Personalized dietary profiles and reminders
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/30 text-emerald-200">
                    ✓
                  </span>
                  Procurement-ready forecasts that shrink food waste
                </li>
              </ul>
            </div>

            <div className="text-sm text-indigo-100/70">
              Looking for the operations console?{' '}
              <Link href="/login?admin=true" className="font-medium text-white underline underline-offset-4">
                Use your admin credentials
              </Link>
            </div>
          </div>

          <div className="relative p-8 sm:p-12">
            <div className="flex h-full flex-col gap-8">
              <div className="space-y-3 text-center lg:text-left">
                <p className="text-sm font-semibold uppercase tracking-wider text-indigo-300">Welcome to Karmic Canteen</p>
                <h2 className="text-3xl font-semibold text-white">Sign in to continue</h2>
                <p className="text-sm text-slate-300">
                  Use your Karmic Solutions credentials to access meal planning tools.
                </p>
              </div>

              <div className="flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-xs text-slate-300 lg:justify-start">
                <Image alt="Meal illustration" src="/canteen-welcome.svg" width={48} height={48} className="mr-3 hidden lg:block" />
                <div>
                  Demo accounts available: <span className="font-medium text-indigo-300">asha.menon@karmicsolutions.com</span>{' '}
                  with password <span className="font-medium text-indigo-300">password123</span>. Admin:{' '}
                  <span className="font-medium text-indigo-300">karan.patel@karmicsolutions.com</span> /{' '}
                  <span className="font-medium text-indigo-300">admin123</span>
                </div>
              </div>

              <Suspense
                fallback={
                  <div className="relative rounded-xl border border-slate-800 bg-slate-950/70 p-16 text-center text-slate-400 shadow-xl shadow-black/30">
                    Preparing secure sign-in…
                  </div>
                }
              >
                <div className="relative rounded-xl border border-slate-800 bg-slate-950/70 p-8 shadow-xl shadow-black/30">
                  <LoginForm />
                </div>
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
