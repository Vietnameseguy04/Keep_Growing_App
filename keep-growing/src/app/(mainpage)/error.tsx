'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 gap-4">
      <span className="text-5xl">🌱</span>
      <h2 className="text-gray-800 font-bold text-xl">Etwas ist schiefgelaufen</h2>
      <p className="text-gray-400 text-sm text-center max-w-xs">
        {error.message || 'Ein unbekannter Fehler ist aufgetreten.'}
      </p>
      <button
        onClick={reset}
        className="bg-[#b57a84] text-white py-3 px-8 rounded-[20px] font-bold shadow hover:bg-[#a36972] active:scale-[0.98] transition-all"
      >
        Erneut versuchen
      </button>
    </main>
  );
}
