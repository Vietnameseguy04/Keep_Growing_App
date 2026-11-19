import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { users }, error } = await supabase.auth.admin.listUsers();

  if (error || !users || users.length === 0) {
    return NextResponse.json({ sent: 0, error: error?.message });
  }

  const results = await Promise.allSettled(
    users
      .filter(u => !!u.email)
      .map(user =>
        resend.emails.send({
          from: 'Keep Growing <onboarding@resend.dev>',
          to: user.email!,
          subject: 'Keep Growing – Dein täglicher Check-in 🌸',
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#fff;border-radius:16px;">
              <h2 style="color:#b57a84;margin-bottom:8px;">Keep Growing 🌸</h2>
              <p style="color:#555;">Hallo ${user.user_metadata?.full_name || 'dort'},</p>
              <p style="color:#555;">Wie geht es dir heute? Nimm dir einen Moment für dein Wohlbefinden.</p>
              <a href="https://keep-growing-app.vercel.app/dashboard"
                style="display:inline-block;margin-top:16px;padding:12px 28px;background:#b57a84;color:#fff;border-radius:12px;text-decoration:none;font-weight:bold;">
                Zum Dashboard
              </a>
              <p style="color:#aaa;font-size:12px;margin-top:24px;">Keep Growing · DHBW Ravensburg</p>
            </div>
          `,
        })
      )
  );

  const sent = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  return NextResponse.json({ sent, failed });
}
