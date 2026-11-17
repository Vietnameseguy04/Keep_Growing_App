import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [entries, flowers, gardenSettings] = await Promise.all([
    supabase.from('daily_entries').select('*').eq('user_id', user.id),
    supabase.from('flowers').select('*').eq('user_id', user.id),
    supabase.from('garden_settings').select('*').eq('user_id', user.id),
  ]);

  const exportData = {
    account: { email: user.email, name: user.user_metadata?.full_name, created_at: user.created_at },
    daily_entries: entries.data ?? [],
    flowers: flowers.data ?? [],
    garden_settings: gardenSettings.data ?? [],
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="keep-growing-data.json"',
    },
  });
}
