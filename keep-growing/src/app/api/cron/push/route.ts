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

  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('subscription');

  if (error || !subscriptions) {
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }

  const payload = JSON.stringify({
    title: 'Keep Growing 🌸',
    body: 'Wie war dein Tag? Trag deinen täglichen Eintrag ein!',
  });

  const results = await Promise.allSettled(
    subscriptions.map(row => sendNotification(JSON.parse(row.subscription), payload))
  );

  const sent = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return NextResponse.json({ sent, failed });
}
