import { NextResponse } from 'next/server';
import { setVapidDetails, sendNotification } from 'web-push';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  setVapidDetails(
    process.env.VAPID_EMAIL!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('user_id, subscription');

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toLocaleDateString('en-CA');

  const results = await Promise.allSettled(
    subscriptions.map(async (row) => {
      const [{ data: entries }, { count: trainings }] = await Promise.all([
        supabase
          .from('daily_entries')
          .select('score')
          .eq('user_id', row.user_id)
          .gte('created_at', sevenDaysAgoStr),
        supabase
          .from('trainings_log')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', row.user_id)
          .gte('completed_at', sevenDaysAgo.toISOString()),
      ]);

      const entryCount = entries?.length ?? 0;
      const trainingCount = trainings ?? 0;
      const scores = (entries ?? []).map((e: any) => e.score).filter((s: any) => s != null);
      const avgScore = scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : null;

      const moodEmoji = avgScore === null ? '' : avgScore >= 3.5 ? '🤩' : avgScore >= 2.5 ? '😊' : avgScore >= 1.5 ? '😢' : '😴';

      const body = avgScore !== null
        ? `${entryCount} Einträge · Ø Stimmung ${moodEmoji} · ${trainingCount} Trainings diese Woche`
        : `${entryCount} Einträge · ${trainingCount} Trainings – starte die neue Woche stark! 💪`;

      await sendNotification(
        JSON.parse(row.subscription),
        JSON.stringify({ title: 'Keep Growing – Dein Wochenrückblick 🌸', body })
      );
    })
  );

  const sent = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  return NextResponse.json({ sent, failed });
}
