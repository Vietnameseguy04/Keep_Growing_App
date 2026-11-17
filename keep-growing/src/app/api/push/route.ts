import { NextRequest, NextResponse } from 'next/server';
import { setVapidDetails, sendNotification } from 'web-push';
import { createClient } from '@/lib/supabase/server';

setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Subscription speichern
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const subscription = await req.json();

  await supabase.from('push_subscriptions').upsert({
    user_id: user.id,
    subscription: JSON.stringify(subscription),
  }, { onConflict: 'user_id' });

  return NextResponse.json({ success: true });
}

// Test-Notification senden
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data } = await supabase
    .from('push_subscriptions')
    .select('subscription')
    .eq('user_id', user.id)
    .single();

  if (!data) return NextResponse.json({ error: 'No subscription' }, { status: 404 });

  await sendNotification(
    JSON.parse(data.subscription),
    JSON.stringify({
      title: 'Keep Growing 🌸',
      body: 'Zeit für dein tägliches Training!',
    })
  );

  return NextResponse.json({ success: true });
}
