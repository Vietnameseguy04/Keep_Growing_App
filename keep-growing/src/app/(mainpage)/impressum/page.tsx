import Link from 'next/link';

export default function ImpressumPage() {
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

          <section>
            <h2 className="text-[#c5c1aa] text-[10px] uppercase tracking-[0.3em] font-bold mb-4">Terms & Conditions</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Our Terms and Conditions govern the use of the app and participation in our wildflower sponsorships. We value transparency and mindful interactions.
            </p>
            <button className="text-[#b57a84] text-xs font-bold mt-2 hover:underline">Read full T&Cs</button>
          </section>

          <section>
            <h2 className="text-[#c5c1aa] text-[10px] uppercase tracking-[0.3em] font-bold mb-4">Privacy Policy</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Your mental progress is private. We encrypt all notes and do not share your data with third parties. The analysis of your insights is processed locally and securely.
            </p>
            <button className="text-[#b57a84] text-xs font-bold mt-2 hover:underline">Read Privacy Policy</button>
          </section>

        </div>
      </div>

      {/* Footer Bereich */}
      <div className="mt-auto pb-12">
         <p className="text-[10px] text-gray-300 uppercase tracking-[0.2em]">
           Flower your mind
         </p>
      </div>
    </main>
  );
}