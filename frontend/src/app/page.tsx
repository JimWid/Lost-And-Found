"use client";

import Link from "next/link"

export default function MainPage() {
  // Replace `/hero.png` with the name of your image in public/ (e.g. /Screenshot.png)
  const heroImageSrc = "/mainpage_pic.jpg";

  return (
    <main className="min-h-screen flex items-start justify-center bg-white">
      <div className="w-full max-w-6xl px-6 py-16">

        {/* Title & subtitle + buttons */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
            Lost and Found Official Website!
          </h1>

          <p className="text-slate-600 text-base md:text-lg mb-8">
            Automate the report of lost items! Find your lost items easily and securly. For university use!
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
                href="/report-item"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold shadow-md bg-slate-900 text-white hover:opacity-95 transition">
                Report an item
            </Link>
            <Link 
                href="/find-item"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 transition">
                Find Item
            </Link>
          </div>
        </div>

        {/* Big rounded image / card */}
        <div className="mt-12">
          <div className="rounded-2xl border border-slate-200 p-1 shadow-sm overflow-hidden">
            <div className="bg-white rounded-xl overflow-hidden">
              <img
                src={heroImageSrc}
                className="w-full h-56 md:h-72 lg:h-96 object-cover block rounded-xl"
                // If you want a subtle inner padding like the screenshot:
                style={{ display: "block" }}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}