import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  
  // Wir holen uns den neuen token_hash aus der URL
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  
  // (Fallback, falls doch noch ein alter Link mit 'code' aufgerufen wird)
  const code = searchParams.get('code'); 

  const supabase = await createClient();

  // --- NEUE METHODE: Mit Token Hash ---
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });

    if (!error) {
      // Erfolg! Ab zur neuen Passwort-Seite
      return NextResponse.redirect(`${origin}/reset-password`);
    }
    
    // Fehlerfall: Leitet zurück mit exakter Fehlermeldung in der URL
    return NextResponse.redirect(`${origin}/forgot-password?error=${encodeURIComponent(error.message)}`);
  }

  // --- ALTE METHODE: Mit Code ---
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return NextResponse.redirect(`${origin}/reset-password`);
    }
    
    return NextResponse.redirect(`${origin}/forgot-password?error=${encodeURIComponent(error.message)}`);
  }

  // Wenn gar nichts im Link steht
  return NextResponse.redirect(`${origin}/forgot-password?error=Link_ungueltig_oder_abgelaufen`);
}