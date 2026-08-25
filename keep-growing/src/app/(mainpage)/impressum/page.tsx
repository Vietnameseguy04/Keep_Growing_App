"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function ImpressumPage() {
  // States für die Accordions (zugeklappt als Standard)
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-start font-[family-name:var(--font-geist-sans)]">
      
      {/* Header Bereich mit Home-Icon */}
      <div className="w-full max-w-md p-8 pt-12 flex justify-end">
        <Link href="/dashboard" className="text-[#b57a84] hover:scale-110 transition-transform">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>

      <div className="w-full max-w-md px-10">
        {/* Titel mit Cursive Font */}
        <div className="mb-12 text-center">
          <h1 className="font-[family-name:var(--font-cursive)] text-[#b57a84] text-5xl opacity-90">
            About us
          </h1>
          <div className="h-1 w-12 bg-[#f2f2eb] mx-auto mt-4 rounded-full" />
        </div>

        {/* Content-Bereich */}
        <div className="space-y-12">
          
          <section>
            <h2 className="text-[#c5c1aa] text-[10px] uppercase tracking-[0.3em] font-bold mb-4">Imprint</h2>
            <div className="text-gray-500 text-sm leading-relaxed space-y-1">
              <p className="font-bold text-gray-700">Keep Growing GbR</p>
              <p>Oberamteigasse 4</p>
              <p>88214 Ravensburg, Germany</p>
              <p className="pt-2">Represented by: Johanna Beckmann, Victoria Stein</p>
              <p>Email: kontakt@keepgrowing.app</p>
              <p>Phone: +49 176 12345678</p>
              <p className="pt-2 italic text-xs">Developed by: Florian Trapp, Elias Huber, Marlon Brunner</p>
            </div>
          </section>

          {/* Accordion: Terms & Conditions */}
          <section>
            <h2 className="text-[#c5c1aa] text-[10px] uppercase tracking-[0.3em] font-bold mb-4">Terms & Conditions</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-2">
              Our Terms and Conditions govern the use of the app and participation in our wildflower sponsorships. We value transparency and mindful interactions.
            </p>
            
            <button 
              onClick={() => setShowTerms(!showTerms)}
              className="text-[#b57a84] text-xs font-bold flex items-center gap-1 hover:underline outline-none"
            >
              {showTerms ? 'Hide full T&Cs' : 'Read full T&Cs'}
              <svg 
                width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className={`transition-transform duration-300 ${showTerms ? 'rotate-180' : ''}`}
              >
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Ausklappbarer Text */}
            {showTerms && (
              <div className="mt-4 text-gray-500 text-xs leading-relaxed space-y-3 bg-[#f2f2eb] bg-opacity-30 p-4 rounded-2xl">
                <p><strong>1. Scope of Application:</strong> These terms govern your use of the Keep Growing app and any related services provided by Keep Growing GbR.</p>
                <p><strong>2. Services:</strong> The app provides mental wellness tracking and facilitates wildflower sponsorships. We reserve the right to modify or discontinue features at any time.</p>
                <p><strong>3. User Obligations:</strong> Users agree to provide accurate information and to not use the platform for any unlawful activities.</p>
                <p><strong>4. Liability:</strong> Keep Growing GbR is not liable for any indirect damages arising from the use of our services. The app does not replace professional medical or psychological advice.</p>
                <p><strong>5. Changes to Terms:</strong> We may update these terms periodically. Continued use of the app constitutes acceptance of any changes.</p>
              </div>
            )}
          </section>

          {/* Accordion: Privacy Policy */}
          <section>
            <h2 className="text-[#c5c1aa] text-[10px] uppercase tracking-[0.3em] font-bold mb-4">Privacy Policy</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-2">
              Your mental progress is private. We encrypt all notes and do not share your data with third parties. The analysis of your insights is processed locally and securely.
            </p>
            
            <button 
              onClick={() => setShowPrivacy(!showPrivacy)}
              className="text-[#b57a84] text-xs font-bold flex items-center gap-1 hover:underline outline-none"
            >
              {showPrivacy ? 'Hide Privacy Policy' : 'Read Privacy Policy'}
              <svg 
                width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className={`transition-transform duration-300 ${showPrivacy ? 'rotate-180' : ''}`}
              >
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Ausklappbarer Text */}
            {showPrivacy && (
              <div className="mt-4 text-gray-500 text-xs leading-relaxed space-y-3 bg-[#f2f2eb] bg-opacity-30 p-4 rounded-2xl">
                <p><strong>1. Data Collection:</strong> We collect personal data such as your name, email address, and daily mood entries only when provided voluntarily through the creation of an account.</p>
                <p><strong>2. Data Usage:</strong> Your data is used exclusively to provide core app features, such as your personal dashboard, training logs, and insights. We do not sell your data.</p>
                <p><strong>3. Data Security:</strong> We implement strict technical measures (e.g., Supabase authentication and encrypted storage) to protect your entries against unauthorized access.</p>
                <p><strong>4. Third Parties:</strong> Your data remains confidential. We do not share your personal information with external advertisers or third parties.</p>
                <p><strong>5. Your Rights:</strong> You have the right to request access to, correction of, or deletion of your personal data at any time by contacting us at kontakt@keepgrowing.app.</p>
              </div>
            )}
          </section>

        </div>
      </div>

      {/* Footer Bereich */}
      <div className="mt-auto pt-16 pb-12">
         <p className="text-[10px] text-gray-300 uppercase tracking-[0.2em] text-center">
           Flower your mind
         </p>
      </div>
    </main>
  );
}