'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { format, parseISO } from 'date-fns';
import { CheckCircle2, ChefHat, ClipboardCheck, Flame, Moon, Sparkles, Sun, UtensilsCrossed } from 'lucide-react';
import clsx from 'classnames';

import type { MealSelection, MealType, MenuDay, UserPreference } from '@/types';

const fetcher = (url: string) =>
  fetch(url, { credentials: 'include' }).then(async (response) => {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.error ?? 'Unable to fetch data');
    }
    return response.json();
  });

interface DashboardShellProps {
  user: {
    id: string;
    name: string;
    role: 'employee' | 'admin';
    department: string;
  };
  initialMenu: MenuDay[];
  initialSelections: MealSelection[];
  initialPreference: UserPreference;
}

interface ToastState {
  message: string;
  tone: 'success' | 'error';
}

export function DashboardShell({ user, initialMenu, initialSelections, initialPreference }: DashboardShellProps) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const {
    data: menuData,
    isLoading: menuLoading,
  } = useSWR<{ menu: MenuDay[] }>('/api/menu?days=7', fetcher, {
    fallbackData: { menu: initialMenu },
    revalidateOnFocus: false,
  });

  const {
    data: selectionData,
    mutate: mutateSelections,
  } = useSWR<{ selections: MealSelection[] }>('/api/selections', fetcher, {
    fallbackData: { selections: initialSelections },
    revalidateOnFocus: false,
  });

  const {
    data: preferenceData,
    mutate: mutatePreference,
  } = useSWR<{ preference: UserPreference }>('/api/preferences', fetcher, {
    fallbackData: { preference: initialPreference },
    revalidateOnFocus: false,
  });

  const {
    data: adminOverview,
    mutate: mutateAdmin,
  } = useSWR<{ summary: unknown; totals: { breakfast: number; lunch: number; snack: number; averageDropOff: number }; selectionHeatmap: { date: string; count: number }[] }>(
    user.role === 'admin' ? '/api/admin/overview?days=7' : null,
    fetcher,
    {
      revalidateOnFocus: false,
    },
  );

  const selections = useMemo(() => selectionData?.selections ?? [], [selectionData]);
  const preference = useMemo(() => preferenceData?.preference ?? initialPreference, [preferenceData, initialPreference]);
  const activeMenu = useMemo(() => menuData?.menu ?? initialMenu, [menuData, initialMenu]);

  const upcomingMenu = useMemo(() => {
    return activeMenu.map((day) => {
      const commitment = selections.find((selection) => selection.date === day.date);
      return { day, commitment };
    });
  }, [activeMenu, selections]);

  const attendanceScore = useMemo(() => {
    if (!selections.length) {
      return 0;
    }
    const attendingMeals = selections.flatMap((selection) => selection.meals.filter((meal) => meal.attending));
    return Math.min(100, Math.round((attendingMeals.length / (selections.length * 3)) * 100));
  }, [selections]);

  async function handleCommitment(date: string, mealType: MealType, attending: boolean) {
    try {
      const response = await fetch('/api/selections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ date, mealType, attending }),
      });

      if (!response.ok) {
        throw new Error('Unable to save meal response.');
      }

      await mutateSelections();
      await mutateAdmin?.();
      setToast({ message: `Saved your ${mealType} plan for ${format(parseISO(date), 'EEE, dd MMM')}.`, tone: 'success' });
    } catch (error) {
      console.error(error);
      setToast({ message: 'Something went wrong while updating your meal plan.', tone: 'error' });
    }
  }

  async function handlePreferenceUpdate(payload: Partial<UserPreference>) {
    try {
      const response = await fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...preference, ...payload }),
      });

      if (!response.ok) {
        throw new Error('Unable to update preferences');
      }

      await mutatePreference();
      setToast({ message: 'Updated your dietary profile', tone: 'success' });
    } catch (error) {
      console.error(error);
      setToast({ message: 'We could not save your preference changes.', tone: 'error' });
    }
  }

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-6 rounded-3xl border border-slate-800/80 bg-slate-950/70 p-8 shadow-2xl shadow-black/40 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-3 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-200">
            <ChefHat className="h-4 w-4 text-indigo-300" />
            Karmic Canteen Command Center
          </div>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">
            Hi {user.name.split(' ')[0]}, let’s lock meals and cut waste.
          </h1>
          <p className="text-sm text-slate-300">
            {user.role === 'admin'
              ? 'Monitor demand signals, adjust procurement, and track how teams are engaging with tomorrow’s menu.'
              : 'Plan your plates for tomorrow. Confirm now so the kitchen can prep the right portions and pamper your taste buds.'}
          </p>
        </div>
        <div className="flex h-full flex-col justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-emerald-100">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-200" />
            <div>
              <p className="text-sm uppercase tracking-widest text-emerald-200/70">Attendance health</p>
              <p className="text-3xl font-bold text-white">{attendanceScore}%</p>
            </div>
          </div>
          <p className="text-xs text-emerald-100/80">
            Maintain confirmations above 75% to keep the waste footprint trending down for your department.
          </p>
        </div>
      </header>

      {toast ? (
        <div
          role="status"
          className={clsx(
            'fixed bottom-5 right-5 z-50 flex max-w-md items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg transition',
            toast.tone === 'success'
              ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-100'
              : 'border-rose-500/40 bg-rose-500/15 text-rose-100',
          )}
        >
          <Sparkles className="h-4 w-4 shrink-0" />
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-auto text-foreground/60 transition hover:text-white"
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ) : null}

      <main className="grid gap-8 lg:grid-cols-[1.65fr_1fr]">
        <section className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Tomorrow’s Menu Preview</h2>
              <p className="text-sm text-slate-400">Confirm what you’ll enjoy. Every toggle helps the kitchen plan precisely.</p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/50 px-3 py-1 text-xs text-slate-300">
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              Live demand tracker
            </div>
          </div>

          <div className="grid gap-4">
            {menuLoading ? (
              <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 text-slate-400">
                Loading menu…
              </div>
            ) : (
              upcomingMenu.map(({ day, commitment }) => (
                <article
                  key={day.date}
                  className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/40 transition hover:border-indigo-500/40 hover:shadow-indigo-900/30"
                >
                  <div className="absolute right-6 top-6 rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-medium uppercase tracking-widest text-indigo-200">
                    {format(parseISO(day.date), 'EEE dd MMM')}
                  </div>
                  <div className="space-y-6">
                    {day.items.map((item) => {
                      const isCommitted = commitment?.meals.some(
                        (meal) => meal.mealType === item.mealType && meal.attending,
                      );
                      return (
                        <div
                          key={item.id}
                          className={clsx(
                            'flex flex-col gap-4 rounded-xl border border-slate-800/70 bg-slate-900/60 p-5 md:flex-row md:items-center md:justify-between',
                            isCommitted && 'border-emerald-400/40 bg-emerald-500/10 shadow-inner',
                          )}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="inline-flex items-center rounded-lg bg-slate-800/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-300">
                                {item.mealType === 'breakfast' ? (
                                  <Sun className="mr-1 h-3 w-3 text-amber-300" />
                                ) : item.mealType === 'lunch' ? (
                                  <UtensilsCrossed className="mr-1 h-3 w-3 text-slate-200" />
                                ) : (
                                  <Moon className="mr-1 h-3 w-3 text-indigo-200" />
                                )}
                                {item.mealType}
                              </span>
                              <span className="text-xs text-slate-400">{item.calories} kcal</span>
                            </div>
                            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                            <p className="text-sm leading-6 text-slate-300">{item.description}</p>
                            <div className="flex flex-wrap gap-2 pt-1">
                              {item.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full border border-slate-700/60 bg-slate-800/50 px-3 py-1 text-[11px] uppercase tracking-widest text-slate-400"
                                >
                                  {tag}
                                </span>
                              ))}
                              <span
                                className={clsx(
                                  'rounded-full border px-3 py-1 text-[11px] uppercase tracking-widest',
                                  item.isVeg
                                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                                    : 'border-orange-500/40 bg-orange-500/10 text-orange-200',
                                )}
                              >
                                {item.isVeg ? 'veg' : 'non-veg'}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-shrink-0 flex-col items-stretch gap-3 text-sm">
                            <button
                              type="button"
                              onClick={() => handleCommitment(day.date, item.mealType, true)}
                              className={clsx(
                                'rounded-lg px-4 py-2 font-medium transition',
                                isCommitted
                                  ? 'bg-emerald-500 text-emerald-950 shadow-lg shadow-emerald-500/25 hover:bg-emerald-400'
                                  : 'border border-emerald-400/40 bg-transparent text-emerald-200 hover:border-emerald-300 hover:text-emerald-100',
                              )}
                            >
                              Count me in
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCommitment(day.date, item.mealType, false)}
                              className="rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2 font-medium text-slate-300 transition hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-rose-100"
                            >
                              I’ll skip
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl shadow-black/40">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold text-white">Dietary profile</h3>
                <p className="text-xs text-slate-400">Tune this so the kitchen can personalise your serving.</p>
              </div>
              <ClipboardCheck className="h-5 w-5 text-indigo-300" />
            </div>
            <div className="grid gap-3 text-sm">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Meal preference</span>
                <select
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  value={preference.dietaryPreference}
                  onChange={(event) => handlePreferenceUpdate({ dietaryPreference: event.target.value as UserPreference['dietaryPreference'] })}
                >
                  <option value="standard">Standard</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="jain">Jain</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Allergy flags</span>
                <input
                  type="text"
                  value={preference.allergyNotes.join(', ')}
                  onChange={(event) =>
                    handlePreferenceUpdate({
                      allergyNotes: event.target.value
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="e.g. peanuts, gluten"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Special notes</span>
                <textarea
                  rows={3}
                  value={preference.additionalNotes ?? ''}
                  placeholder="Optional handling instructions for the kitchen"
                  onChange={(event) => handlePreferenceUpdate({ additionalNotes: event.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-3 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={preference.autoOptIn}
                  onChange={(event) => handlePreferenceUpdate({ autoOptIn: event.target.checked })}
                  className="h-4 w-4 rounded border border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
                />
                Auto confirm meals that match my dietary profile
              </label>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl shadow-black/30">
            <div className="mb-3 flex items-center justify-between text-sm text-slate-300">
              <span>Engagement streak</span>
              <span className="font-semibold text-indigo-300">Last 7 days</span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {activeMenu.map((day) => {
                const commitment = selections
                  .find((selection) => selection.date === day.date)
                  ?.meals.some((meal) => meal.attending);
                return (
                  <div
                    key={day.date}
                    className={clsx(
                      'flex h-12 flex-col items-center justify-center rounded-lg border text-[11px] uppercase tracking-widest',
                      commitment
                        ? 'border-indigo-500/40 bg-indigo-500/15 text-indigo-200'
                        : 'border-slate-800 bg-slate-900/50 text-slate-500',
                    )}
                  >
                    <span>{format(parseISO(day.date), 'EEE')}</span>
                    <span className="text-xs font-semibold">{format(parseISO(day.date), 'dd')}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {user.role === 'admin' && adminOverview ? (
            <section className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6 text-amber-50 shadow-xl shadow-amber-500/20">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Canteen demand radar</h3>
                <Sparkles className="h-5 w-5 text-amber-200" />
              </div>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                  <dt className="text-xs uppercase tracking-widest text-amber-200/70">Breakfast aligns</dt>
                  <dd className="mt-1 text-2xl font-semibold text-white">{adminOverview.totals.breakfast}</dd>
                </div>
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                  <dt className="text-xs uppercase tracking-widest text-amber-200/70">Lunch aligns</dt>
                  <dd className="mt-1 text-2xl font-semibold text-white">{adminOverview.totals.lunch}</dd>
                </div>
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                  <dt className="text-xs uppercase tracking-widest text-amber-200/70">Snacks aligns</dt>
                  <dd className="mt-1 text-2xl font-semibold text-white">{adminOverview.totals.snack}</dd>
                </div>
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                  <dt className="text-xs uppercase tracking-widest text-amber-200/70">Avg drop-off</dt>
                  <dd className="mt-1 text-2xl font-semibold text-white">{(adminOverview.totals.averageDropOff * 100).toFixed(0)}%</dd>
                </div>
              </dl>
              <div className="mt-6">
                <p className="mb-2 text-xs uppercase tracking-widest text-amber-200/70">Week of commitments</p>
                <div className="grid grid-cols-7 gap-1">
                  {adminOverview.selectionHeatmap.map((day) => (
                    <div
                      key={day.date}
                      className={clsx(
                        'flex h-12 flex-col items-center justify-center rounded-lg border text-[11px] uppercase tracking-widest',
                        day.count > 4
                          ? 'border-amber-400/60 bg-amber-400/30 text-amber-950'
                          : day.count > 1
                            ? 'border-amber-400/30 bg-amber-400/20 text-amber-50'
                            : 'border-amber-400/20 bg-transparent text-amber-200/70',
                      )}
                    >
                      <span>{format(parseISO(day.date), 'EEE')}</span>
                      <span className="text-xs font-semibold">{day.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}
        </aside>
      </main>
    </div>
  );
}
