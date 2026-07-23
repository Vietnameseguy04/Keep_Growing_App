import Link from 'next/link';
import ResetPasswordForm from './reset-password-form';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ResetPasswordPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Ohne gültigen Reset-Link gibt es keine Recovery-Session
  if (!user) {
    redirect('/forgot-password');
  }

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-start font-[family-name:var(--font-geist-sans)]">
      
      <div className="w-full max-w-md p-8 pt-12 flex justify-start">
        <Link
          href="/login"
          className="bg-[#b57a84] w-12 h-10 rounded-xl flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
          >
            <path
              d="M19 12H5M12 19l-7-7 7-7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>

      <div className="w-full max-w-md px-10 pb-10">
        
        {/* Header */}
        <div className="mb-10 text-left">
          <h1 className="font-[family-name:var(--font-cursive)] text-[#b57a84] text-5xl opacity-90 leading-tight">
            New Password
          </h1>

          <p className="text-gray-500 mt-5 leading-relaxed">
            Enter your new password.
          </p>
        </div>

        <ResetPasswordForm />
      </div>

      {/* Blumen-Illustration am unteren Rand */}
      <div className="mt-auto w-full flex justify-center items-end p-0 overflow-hidden">
        <div className="relative w-full h-32 flex justify-center items-end opacity-60">
          <span className="text-6xl mb-[-10px] tracking-widest">
            🌸🪻🌼🌷🌸
          </span>
        </div>
      </div>

      {/* Footer Link */}
      <div className="pb-8">
        <Link
          href="/impressum"
          className="text-[10px] text-gray-400 underline uppercase tracking-[0.3em] font-bold hover:text-gray-600 transition-colors"
        >
          About us
        </Link>
      </div>
    </main>
  );
}