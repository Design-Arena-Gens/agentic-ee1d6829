import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/auth/options';
import { getAttendanceSummary, listAllSelections, listMenus } from '@/lib/mockDb';

const querySchema = z.object({
  days: z
    .string()
    .optional()
    .transform((value) => (value ? Number.parseInt(value, 10) : 7))
    .pipe(z.number().min(1).max(14))
    .catch(7),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const url = new URL(request.url);
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams));

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query', details: parsed.error.flatten() }, { status: 400 });
  }

  const { days } = parsed.data;
  const summary = getAttendanceSummary(days);

  const totals = summary.reduce(
    (acc, day) => {
      acc.breakfast += day.totals.breakfast;
      acc.lunch += day.totals.lunch;
      acc.snack += day.totals.snack;
      acc.dropOffRate += day.dropOffRate;
      return acc;
    },
    { breakfast: 0, lunch: 0, snack: 0, dropOffRate: 0 },
  );

  const averageDropOff = summary.length ? Number((totals.dropOffRate / summary.length).toFixed(2)) : 0;

  const selectionHeatmap = listMenus({ days }).map((menu) => {
    const commitments = listAllSelections()
      .filter((selection) => selection.date === menu.date)
      .flatMap((selection) => selection.meals.filter((meal) => meal.attending));

    return {
      date: menu.date,
      count: commitments.length,
    };
  });

  return NextResponse.json({
    summary,
    totals: {
      breakfast: totals.breakfast,
      lunch: totals.lunch,
      snack: totals.snack,
      averageDropOff,
    },
    selectionHeatmap,
  });
}
