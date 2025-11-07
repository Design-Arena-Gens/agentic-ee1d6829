import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { authOptions } from '@/auth/options';
import { getUserPreference, upsertUserPreference } from '@/lib/mockDb';

const preferenceSchema = z.object({
  dietaryPreference: z.enum(['standard', 'vegetarian', 'vegan', 'jain']),
  allergyNotes: z.array(z.string().min(1).max(40)).max(8).default([]),
  additionalNotes: z
    .string()
    .max(160)
    .optional()
    .transform((value) => value?.trim() || undefined),
  autoOptIn: z.boolean(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const preference =
    getUserPreference(session.user.id) ??
    upsertUserPreference(session.user.id, {
      dietaryPreference: 'standard',
      allergyNotes: [],
      additionalNotes: undefined,
      autoOptIn: true,
    });

  return NextResponse.json({ preference });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = preferenceSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid preference payload', details: parsed.error.flatten() }, { status: 400 });
  }

  const preference = upsertUserPreference(session.user.id, parsed.data);
  return NextResponse.json({ preference });
}
