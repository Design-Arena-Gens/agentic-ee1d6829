import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/auth/options';
import { listSelectionsForUser, saveMealToggle } from '@/lib/mockDb';
import type { MealType } from '@/types';

const selectionSchema = z.object({
  date: z.string(),
  mealType: z.enum(['breakfast', 'lunch', 'snack'] satisfies MealType[]),
  attending: z.boolean(),
  specialRequest: z
    .string()
    .max(140)
    .optional()
    .transform((value) => value?.trim() || undefined),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const selections = listSelectionsForUser(session.user.id);
  return NextResponse.json({ selections });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = selectionSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 });
  }

  const result = saveMealToggle(session.user.id, parsed.data.date, {
    mealType: parsed.data.mealType,
    attending: parsed.data.attending,
    specialRequest: parsed.data.specialRequest,
  });

  return NextResponse.json({ selection: result });
}
