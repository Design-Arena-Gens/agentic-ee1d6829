'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';

  const [email, setEmail] = useState('asha.menon@karmicsolutions.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const response = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl,
    });

    if (response?.error) {
      setError('Invalid credentials. Please try again or contact the operations team.');
      setIsSubmitting(false);
      return;
    }

    router.push(callbackUrl);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-slate-200">
          Corporate Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          placeholder="you@karmicsolutions.com"
          autoComplete="email"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-slate-200">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          placeholder="Enter your password"
          autoComplete="current-password"
          required
        />
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Sign in to Karmic Canteen
      </button>
    </form>
  );
}
