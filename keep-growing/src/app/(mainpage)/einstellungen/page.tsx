import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function EinstellungenPage({
  searchParams,
}: {
  searchParams: Promise<{
    reset?: string;
    password?: string;
  }>;
}) {
  const { reset, password } = await searchParams;
  const supabase = await createClient();

  // AUTH-CHECK: Nur für eingeloggte User
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  /**
   * Server Action für den Logout
   */
  async function handleLogout() {
    'use server';

    const supabase = await createClient();

    await supabase.auth.signOut();

    redirect('/login');
  }

  /**
   * Server Action: Passwort ändern
   */
  async function handleChangePassword(formData: FormData) {
    'use server';

    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      redirect('/einstellungen?password=felder-fehlen');
    }

    if (newPassword !== confirmPassword) {
      redirect('/einstellungen?password=stimmen-nicht-ueberein');
    }

    if (!user.email) {
      redirect('/einstellungen?password=fehler');
    }

    // Altes Passwort überprüfen
    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

    if (loginError) {
      redirect('/einstellungen?password=altes-passwort-falsch');
    }

    // Neues Passwort speichern
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      redirect('/einstellungen?password=fehler');
    }

    redirect('/einstellungen?password=erfolgreich');
  }

  /**
   * Server Action: Blumenwiese zurücksetzen.
   * Die Blumen werden nicht gelöscht, sondern nur ausgeblendet – der
   * Blumengarten zeigt nur Blumen, die nach garden_settings.last_reset_at
   * gepflanzt wurden (Tabelle aus blumengarten/freunde/supabase-migration.sql).
   */
  async function handleGardenReset() {
    'use server';

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }

    const { error } = await supabase
      .from('garden_settings')
      .upsert({
        user_id: user.id,
        last_reset_at: new Date().toISOString(),
      });

    if (error) {
      redirect('/einstellungen?reset=fehler');
    }

    redirect('/blumengarten');
  }

  return (
    <main className="min-h-screen bg-white flex flex-col items-center p-6 font-sans">
      
      {/* Header mit Zurück-Pfeil */}
      <div className="w-full max-w-md flex justify-between items-center mb-12">
        <Link href="/dashboard" className="p-2 -ml-2 group">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9ca3af"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:stroke-gray-600 transition-colors"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>

        <h1 className="text-gray-800 font-bold text-lg">
          Einstellungen
        </h1>

        <div className="w-8" />
      </div>

      <div className="w-full max-w-md space-y-6">
        
        {/* Account Sektion */}
        <section className="bg-[#f2f2eb] rounded-[25px] p-6 shadow-sm">
          <h2 className="text-gray-400 uppercase text-[10px] tracking-[0.2em] font-bold mb-4">
            Account
          </h2>

          <div className="flex flex-col gap-1">
            <span className="text-gray-800 font-medium">
              {user.user_metadata.full_name || 'User'}
            </span>

            <span className="text-gray-400 text-sm">
              {user.email}
            </span>
          </div>
        </section>

        {/* Passwort ändern Sektion */}
        <section className="bg-[#f2f2eb] rounded-[25px] p-6 shadow-sm">
          <h2 className="text-gray-400 uppercase text-[10px] tracking-[0.2em] font-bold mb-4">
            Passwort
          </h2>

          {password === 'erfolgreich' && (
            <p className="mb-4 p-3 bg-green-50 border border-green-100 text-green-700 text-sm rounded-2xl text-center">
              Dein Passwort wurde erfolgreich geändert.
            </p>
          )}

          {password === 'altes-passwort-falsch' && (
            <p className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl text-center">
              Das aktuelle Passwort ist falsch.
            </p>
          )}

          {password === 'stimmen-nicht-ueberein' && (
            <p className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl text-center">
              Die neuen Passwörter stimmen nicht überein.
            </p>
          )}

          {password === 'felder-fehlen' && (
            <p className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl text-center">
              Bitte fülle alle Passwortfelder aus.
            </p>
          )}

          {password === 'fehler' && (
            <p className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl text-center">
              Das Passwort konnte nicht geändert werden.
            </p>
          )}

          <details className="group">
            <summary className="cursor-pointer list-none flex items-center justify-between text-gray-800 font-medium">
              Passwort ändern

              <span className="text-gray-400 transition-transform group-open:rotate-90">
                ›
              </span>
            </summary>

            <form
              action={handleChangePassword}
              className="mt-5 space-y-5"
            >
              <input
                name="currentPassword"
                type="password"
                required
                placeholder="Aktuelles Passwort"
                autoComplete="current-password"
                className="w-full bg-transparent border-b border-gray-400 py-3 outline-none focus:border-[#b57a84] transition-colors placeholder-gray-400 text-gray-600"
              />

              <input
                name="newPassword"
                type="password"
                required
                minLength={6}
                placeholder="Neues Passwort"
                autoComplete="new-password"
                className="w-full bg-transparent border-b border-gray-400 py-3 outline-none focus:border-[#b57a84] transition-colors placeholder-gray-400 text-gray-600"
              />

              <input
                name="confirmPassword"
                type="password"
                required
                minLength={6}
                placeholder="Neues Passwort bestätigen"
                autoComplete="new-password"
                className="w-full bg-transparent border-b border-gray-400 py-3 outline-none focus:border-[#b57a84] transition-colors placeholder-gray-400 text-gray-600"
              />

              <button
                type="submit"
                className="w-full bg-[#c08a95] text-white py-3 rounded-[20px] font-bold shadow hover:bg-[#b67f8a] active:scale-[0.98] transition-all"
              >
                Passwort ändern
              </button>
            </form>
          </details>
        </section>

        {/* Flower garden Sektion */}
        <section className="bg-[#f2f2eb] rounded-[25px] p-6 shadow-sm">
          <h2 className="text-gray-400 uppercase text-[10px] tracking-[0.2em] font-bold mb-4">
            Flower garden
          </h2>

          {reset === 'fehler' && (
            <p className="mb-4 text-sm text-[#9b5d68]">
              The reset did not work. Has the database migration
              (blumengarten/freunde/supabase-migration.sql) been run yet?
            </p>
          )}

          <details className="group">
            <summary className="cursor-pointer list-none flex items-center justify-between text-gray-800 font-medium">
              Reset your garden

              <span className="text-gray-400 transition-transform group-open:rotate-90">
                ›
              </span>
            </summary>

            <p className="mt-3 text-sm text-gray-400">
              Your current flowers will be archived and your garden starts
              fresh. This also happens automatically at the start of each
              month.
            </p>

            <form action={handleGardenReset} className="mt-4">
              <button
                type="submit"
                className="w-full bg-[#c08a95] text-white py-3 rounded-[20px] font-bold shadow hover:bg-[#b67f8a] active:scale-[0.98] transition-all"
              >
                Yes, reset my garden now
              </button>
            </form>
          </details>
        </section>

        {/* Logout Button */}
        <form action={handleLogout}>
          <button 
            type="submit"
            className="w-full bg-[#b57a84] text-white py-4 rounded-[20px] font-bold shadow-lg hover:bg-[#a36972] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>

            Abmelden
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="mt-auto py-12 text-center">
        <Link
          href="/impressum"
          className="text-[10px] text-gray-300 underline uppercase tracking-[0.3em] font-bold hover:text-gray-600 transition-colors"
        >
          About us
        </Link>
      </div>
    </main>
  );
}