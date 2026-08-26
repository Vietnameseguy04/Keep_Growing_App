'use client';

import { useState } from 'react';
import { handleResetPassword } from '@/app/actions';

export default function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError('');

    const result = await handleResetPassword(formData);

    // Da bei Erfolg jetzt automatisch über die Server Action umgeleitet wird, 
    // landen wir nur hier unten, wenn es einen Fehler gab.
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
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
  );
}