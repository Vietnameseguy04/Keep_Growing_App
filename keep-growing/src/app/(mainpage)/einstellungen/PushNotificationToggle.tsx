'use client';

import { useState, useEffect } from 'react';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

export default function PushNotificationToggle() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'on' | 'error'>('idle');
  const [justActivated, setJustActivated] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    navigator.serviceWorker.ready.then(reg => {
      reg.pushManager.getSubscription().then(sub => {
        if (sub) setStatus('on');
      });
    });
  }, []);

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
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      });

      const res = await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      });

      if (!res.ok) throw new Error('Failed to save subscription');
      setStatus('on');
      setJustActivated(true);
    } catch {
      setStatus('error');
    }
  }

  async function unsubscribe() {
    setStatus('loading');
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();

      await fetch('/api/push', { method: 'DELETE' });
      setStatus('idle');
      setJustActivated(false);
    } catch {
      setStatus('error');
    }
  }

  return (
    <div>
      {justActivated && (
        <p className="mb-3 p-3 bg-green-50 border border-green-100 text-green-700 text-sm rounded-2xl text-center">
          Reminders activated! You will be reminded every morning at 8:00. 🌸
        </p>
      )}
      {status === 'error' && (
        <p className="mb-3 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl text-center">
          Could not activate reminders. Please allow notifications in your browser.
        </p>
      )}
      {status === 'on' ? (
        <button
          onClick={unsubscribe}
          className="w-full bg-gray-200 text-gray-700 py-3 rounded-[20px] font-bold shadow hover:bg-gray-300 active:scale-[0.98] transition-all"
        >
          Deactivate daily reminders ✓
        </button>
      ) : (
        <button
          onClick={subscribe}
          disabled={status === 'loading'}
          className="w-full bg-[#c08a95] text-white py-3 rounded-[20px] font-bold shadow hover:bg-[#b67f8a] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {status === 'loading' ? 'Loading...' : 'Activate daily reminders'}
        </button>
      )}
    </div>
  );
}
