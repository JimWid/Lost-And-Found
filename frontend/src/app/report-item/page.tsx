"use client"

import React , { useState } from "react";

type AnalysisResult = {
    title: string;
    description: string;
    category?: string;
    objectName?: string | null;
    confidence?: number | null;
};

export default function ReportItem() {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Other");
    const [foundLocation, setFoundLocation] = useState("");
    const [loadingAnalyze, setLoadingAnalyze] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [filename, setFilename] = useState<string | null>(null);

    const BACKEND_BASE = "http://127.0.0.1:8000"; // change for prod

    async function uploadFileToServer(f: File) {

        const fd = new FormData();
        fd.append("file", f);
        const res = await fetch(`${BACKEND_BASE}/upload`, {
            method: "POST",
            body: fd,
        });
        if (!res.ok) throw new Error("Upload failed");
        const json = await res.json();
        return json.filename as string;
    }

    async function analyzeByFilename(fn: string) {
        const res = await fetch(`${BACKEND_BASE}/analyze-image`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ filename: fn }),
        });
        if (!res.ok) throw new Error("Analyze failed");
        const json: AnalysisResult & { filename?: string } = await res.json();
        setTitle(json.title ?? "");
        setDescription(json.description ?? "");
        setCategory(json.category ?? "Other");
        if (json.filename) setFilename(json.filename);
    }

    async function analyzeFile(f: File) {
            setLoadingAnalyze(true);
        try {
            // 1) upload file to server -> get filename
            const fn = await uploadFileToServer(f);
            setFilename(fn);
            // 2) ask server to analyze the saved file by filename
            await analyzeByFilename(fn);
        } catch (err) {
            console.error(err);
            alert("Failed to upload/analyze image.");
        } finally {
            setLoadingAnalyze(false);
        }
    }

    function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        setFile(f);
        analyzeFile(f);
    }

    async function handleSubmit() {
        // user can edit title/description before sending
        if (!title || !description) {
        alert("Please provide a title and description.");
        return;
        }

        setSubmitting(true);
        try {
            // Creating lost item
            const payload = {
                title,
                description,
                category,
                foundLocation,
                filename,
            };

        const createRes = await fetch(`${BACKEND_BASE}/create-lost-item`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(payload),
        });

        if (!createRes.ok) {
            const text = await createRes.text();
            throw new Error(text || "Create failed");
        }

        const data = await createRes.json();
        // success UI — maybe redirect, clear form, or show a success message
        alert(`Item reported (id: ${data.id})`);
        setFile(null);
        setTitle("");
        setDescription("");
        setCategory("Other");
        setFoundLocation("")
        // optionally reset file input DOM element by key/hard reset
        } catch (err) {
        console.error(err);
        alert("Failed to create lost item.");
        } finally {
        setSubmitting(false);
        }
    }
    
return (
  <div className="w-full grid lg:grid-cols-2 gap-8 items-stretch">
    {/* LEFT SIDE */}
    <div className="flex flex-col items-center justify-center gap-5 w-full py-5 h-full">
      {!file ? (
        <div className="flex-1 w-full h-full bg-gray-50 rounded-2xl border border-gray-300 border-dashed flex flex-col items-center justify-center p-8">
            <img
                src={"/upload_image.jpg"}
                className="mx-auto"
                width="40"
                height="40"
            />

          <h2 className="text-gray-400 text-sm mt-3">
            PNG, JPG, or PDF (max 15MB)
          </h2>

          <label className="mt-4">
            <input type="file" accept="image/*" hidden onChange={onFileChange} />
            <div className="flex w-28 h-9 bg-indigo-600 rounded-full shadow text-white text-xs font-semibold items-center justify-center cursor-pointer">
              Choose File
            </div>
          </label>
        </div>
      ) : (
        <div className="relative w-full h-full border border-gray-300 rounded-2xl overflow-hidden shadow-sm bg-white flex-1">
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => setFile(null)}
            className="absolute top-2 right-2 bg-white text-gray-600 rounded-full shadow px-3 py-1 text-xs font-medium hover:bg-gray-100"
          >
            Remove
          </button>
        </div>
      )}
    </div>

    {/* RIGHT SIDE */}
    <div className="flex flex-col w-full py-5 h-full">
      <div className="flex-1 border border-gray-200 rounded-2xl p-6 flex flex-col justify-between">
        <div>
          <h4 className="text-base font-semibold text-gray-900 mb-2">Title</h4>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="block w-full px-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none"
            placeholder="Enter Title..."
          />

          <h4 className="text-base font-semibold text-gray-900 mt-4 mb-2">Location</h4>
          <input
            type="text"
            value={foundLocation}
            onChange={(e) => setFoundLocation(e.target.value)}
            className="block w-full px-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none"
            placeholder="Enter Location..."
          />

          <h4 className="text-base font-semibold text-gray-900 mt-4 mb-2">Description</h4>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full h-40 px-4 py-2 text-sm border border-gray-300 rounded-2xl focus:outline-none resize-none"
            placeholder="Enter Description..."
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-indigo-600 rounded-full py-2 px-5 text-xs text-white font-semibold mt-4 self-start"
        >
          {submitting ? "Reporting..." : "Report Item"}
        </button>
      </div>
    </div>
  </div>
);
}