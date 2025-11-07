import { NextResponse } from 'next/server';
import { z } from 'zod';

import { listMenus } from '@/lib/mockDb';

const menuQuerySchema = z.object({
  days: z
    .string()
    .optional()
    .transform((value) => (value ? Number.parseInt(value, 10) : 5))
    .pipe(z.number().min(1).max(14))
    .catch(5),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parseResult = menuQuerySchema.safeParse(Object.fromEntries(url.searchParams));

  if (!parseResult.success) {
    return NextResponse.json({ error: 'Invalid date range' }, { status: 400 });
  }

  const { days } = parseResult.data;
  const menu = listMenus({ days });

  return NextResponse.json({ menu });
}
