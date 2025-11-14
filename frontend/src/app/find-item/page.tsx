"use client";

import React, { useEffect, useMemo, useState } from "react";

type Item = {
  id: number;
  title: string;
  description: string;
  category: string;
  foundLocation: string;
  filename?: string | null; // URL path to image, e.g. /uploads/uuid.jpg
  addedAt: string; // ISO timestamp
};

const BACKEND_BASE = "http://127.0.0.1:8000";

function formatRelativeDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return d.toLocaleDateString();
}

export default function ReportedItemList() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("All");
  const [timeRange, setTimeRange] = useState<"All" | "24h" | "7d" | "30d">("All");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // load all reported items
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${BACKEND_BASE}/lost-items`); // backend must expose this
        if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
        const data: Item[] = await res.json();
        setItems(data);
      } catch (e: any) {
        console.error(e);
        setError("Failed to load reported items");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // derive categories from items
  const categories = useMemo(() => {
    const set = new Set<string>();
    set.add("All");
    items.forEach((it) => set.add(it.category || "Other"));
    return Array.from(set);
  }, [items]);

  function passesTimeFilter(item: Item) {
    if (timeRange === "All") return true;
    const added = new Date(item.addedAt).getTime();
    const now = Date.now();
    const diffMs = now - added;
    if (timeRange === "24h") return diffMs <= 24 * 60 * 60 * 1000;
    if (timeRange === "7d") return diffMs <= 7 * 24 * 60 * 60 * 1000;
    if (timeRange === "30d") return diffMs <= 30 * 24 * 60 * 60 * 1000;
    return true;
  }

  const filtered = items.filter((it) => {
    if (category !== "All" && it.category !== category) return false;
    return passesTimeFilter(it);
  });


    return(
        <main className="min-h-screen bg-white py-12 px-6">
            <div className="max-w-6xl mx-auto">
                {/* header */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Reported Item List</h2>
                </div>

                {/* filters */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch">

                    <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                    >
                    {categories.map((c) => (
                        <option key={c} value={c}>
                        {c}
                        </option>
                    ))}
                    </select>

                    <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as any)}
                    className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                    >
                    <option value="All">All time</option>
                    <option value="24h">Last 24h</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    </select>
                </div>
                </div>

                {/* grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filtered.map((it) => (
                    <div key={it.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="w-full h-44 overflow-hidden bg-slate-50">
                        {/* if image missing, browser will show broken icon — consider using fallback */}
                        <img
                        src={`${BACKEND_BASE}/uploads/${it.filename}`}
                        alt={it.title}
                        className="w-full h-full object-cover block"
                        onError={(e) => {
                            // fallback to placeholder if image not found
                            (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
                        }}
                        />
                    </div>

                    <div className="p-4">
                        <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-slate-900">{it.title}</h3>
                        <span className="text-xs text-slate-500">{formatRelativeDate(it.addedAt)}</span>
                        </div>

                        <p className="mt-2 text-sm text-slate-600 line-clamp-3">{it.description}</p>

                        <div className="mt-3 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                            <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                            {it.category}
                            </span>
                            <span className="text-slate-500">— {it.foundLocation}</span>
                        </div>
                        <button
                            className="text-xs text-indigo-600 font-medium hover:underline"
                            onClick={() => {
                            // you could open a detail modal or navigate to a detail page
                            alert(`Open details for ${it.title} (id ${it.id})`);
                            }}
                        >
                            Claim
                        </button>
                        </div>
                    </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-500">
                    No reported items match your filters.
                    </div>
                )}
                </div>
            </div>
        </main>
    );
}