'use client';

import { useState } from 'react';

export default function PushNotificationToggle() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'on' | 'error'>('idle');

  async function subscribe() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('error');
      return;
    }

    setStatus('loading');
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      });

      setStatus('on');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div>
      {status === 'on' && (
        <p className="mb-3 p-3 bg-green-50 border border-green-100 text-green-700 text-sm rounded-2xl text-center">
          Reminders activated! 🌸
        </p>
      )}
      {status === 'error' && (
        <p className="mb-3 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl text-center">
          Could not activate reminders. Please allow notifications in your browser.
        </p>
      )}
      <button
        onClick={subscribe}
        disabled={status === 'loading' || status === 'on'}
        className="w-full bg-[#c08a95] text-white py-3 rounded-[20px] font-bold shadow hover:bg-[#b67f8a] active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {status === 'loading' ? 'Activating...' : status === 'on' ? 'Reminders active ✓' : 'Activate daily reminders'}
      </button>
    </div>
  );
}
