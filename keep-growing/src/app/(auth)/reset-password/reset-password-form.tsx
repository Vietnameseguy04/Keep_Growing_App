'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleResetPassword } from '@/app/actions';

export default function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError('');

    const result = await handleResetPassword(formData);

    if (result?.success) {
      setShowSuccessModal(true);
    } else {
      setIsLoading(false);

      if (result?.error) {
        setError(result.error);
      }
    }
  }

  return (
    <>
      <form action={handleSubmit} className="space-y-6">
        
        <input
          name="password"
          type="password"
          placeholder="New Password"
          required
          className="w-full bg-transparent border-b border-gray-400 py-2 outline-none focus:border-[#b57a84] transition-colors placeholder-gray-400 text-gray-600"
        />

        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm New Password"
          required
          className="w-full bg-transparent border-b border-gray-400 py-2 outline-none focus:border-[#b57a84] transition-colors placeholder-gray-400 text-gray-600"
        />

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#b57a84] text-white py-4 rounded-3xl text-xl font-bold hover:bg-[#a36972] active:scale-[0.98] transition-all shadow-md mt-4 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Password'}
        </button>
      </form>

      {/* Bestätigungs-Fenster */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-[35px] p-8 max-w-sm w-full text-center shadow-2xl scale-in-center">
            
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Password Updated!
            </h3>

            <p className="text-gray-500 mb-6 leading-relaxed">
              Dein Passwort wurde erfolgreich geändert. Du kannst dich jetzt mit deinem neuen Passwort anmelden.
            </p>

            <button
              onClick={() => router.push('/login')}
              className="w-full bg-[#b57a84] text-white py-3 rounded-2xl font-bold hover:bg-[#a36972] transition-colors shadow-lg"
            >
              Okay, zum Login
            </button>
          </div>
        </div>
      )}
    </>
  );
}