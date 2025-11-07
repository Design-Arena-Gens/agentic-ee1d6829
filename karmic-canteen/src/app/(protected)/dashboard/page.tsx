import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/auth/options';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { getAttendanceSummary, getUserPreference, listMenus, listSelectionsForUser, upsertUserPreference } from '@/lib/mockDb';

export const metadata = {
  title: 'Dashboard | Karmic Canteen',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const initialMenu = listMenus({ days: 7 });
  const initialSelections = listSelectionsForUser(session.user.id);
  const preference =
    getUserPreference(session.user.id) ??
    upsertUserPreference(session.user.id, {
      dietaryPreference: 'standard',
      allergyNotes: [],
      additionalNotes: undefined,
      autoOptIn: true,
    });

  // Pre-compute admin metrics on the server for a fast first paint.
  if (session.user.role === 'admin') {
    getAttendanceSummary(7);
  }

  return (
    <DashboardShell
      user={{
        id: session.user.id,
        name: session.user.name ?? 'Karmic Champion',
        role: session.user.role,
        department: session.user.department ?? 'Operations',
      }}
      initialMenu={initialMenu}
      initialSelections={initialSelections}
      initialPreference={preference}
    />
  );
}
