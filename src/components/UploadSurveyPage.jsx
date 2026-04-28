import { useState, useRef, useCallback } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { model, fetchImageAsGenerativePart } from "../gemini";
import {
  CloudUpload,
  FileImage,
  X,
  CheckCircle2,
  Sparkles,
  UploadCloud,
  ImagePlus,
  AlertCircle
} from "lucide-react";

function FileChip({ file, onRemove }) {
  return (
    <div className="flex items-center gap-3 bg-sky-50 dark:bg-teal-900/30 border border-sky-200 dark:border-teal-800 rounded-xl px-4 py-3 group">
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-sky-100 dark:bg-teal-800 text-sky-600 dark:text-teal-300 shrink-0">
        <FileImage size={18} strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-stone-700 dark:text-stone-200 truncate">
          {file.name}
        </p>
        <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{file.size}</p>
      </div>
      <CheckCircle2 size={16} className="text-teal-500 dark:text-teal-400 shrink-0" />
      <button
        onClick={onRemove}
        className="ml-1 p-1 rounded-full text-stone-300 dark:text-stone-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
        aria-label="Remove file"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function UploadSurveyPage() {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (dropped.length === 0) return;

    const mapped = dropped.map((f) => ({
      name: f.name,
      size: (f.size / (1024 * 1024)).toFixed(1) + " MB",
      type: f.type,
      originalFile: f
    }));
    setFiles((prev) => [...prev, ...mapped]);
    setSubmitted(false);
  }, []);

  const handleInputChange = (e) => {
    const picked = Array.from(e.target.files).filter((f) =>
      f.type.startsWith("image/")
    );
    const mapped = picked.map((f) => ({
      name: f.name,
      size: (f.size / (1024 * 1024)).toFixed(1) + " MB",
      type: f.type,
      originalFile: f
    }));
    setFiles((prev) => [...prev, ...mapped]);
    setSubmitted(false);
    e.target.value = "";
  };

  const removeFile = (index) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));


  const handleUpload = async () => {
    if (files.length === 0) return;
    setIsSubmitting(true);
    setError("");
    setSubmitted(false);

    try {
      for (const item of files) {

        // 1. Upload to Cloudinary
        const formData = new FormData();
        formData.append("file", item.originalFile);
        formData.append("upload_preset", "Community_Connect___surveys");

        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/do6hn4q3u/image/upload`,
          { method: "POST", body: formData }
        );

        if (!cloudinaryResponse.ok) throw new Error(`Failed to upload ${item.name}`);

        const cloudinaryData = await cloudinaryResponse.json();
        const secureImageUrl = cloudinaryData.secure_url;


        let aiData = {
          category: "Uncategorized",
          location: "Unknown Location",
          urgency: "Pending",
          summary: "AI could not read the handwriting clearly."
        };

        try {

          const imagePart = await fetchImageAsGenerativePart(secureImageUrl);

          // This is the prompt we provide to gemini
          const promptText = `
            You are an expert data extraction assistant for an NGO. 
            Analyze this handwritten field survey image. 
            Extract the data and return ONLY a raw JSON object. Do not use markdown formatting like \`\`\`json.
            
            Strictly use these exact JSON keys:
            - "category": Choose the best fit from: "Healthcare", "Education", "Water & Sanitation", "Infrastructure", "Other".
            - "location": Extract the village, district, city, or address mentioned. If none, write "Not Specified".
            - "urgency": Based on the tone and need, classify as "Critical", "High", "Medium", or "Low".
            - "summary": Write a clear, 1-sentence summary of what the person is asking for or reporting.
          `;


          const result = await model.generateContent([promptText, imagePart]);
          const responseText = result.response.text();


          const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
          aiData = JSON.parse(cleanJson);

        } catch (aiError) {
          console.error("Gemini failed to process image:", aiError);
        }

        await addDoc(collection(db, "surveys"), {
          imageUrl: secureImageUrl,
          fileName: item.name,
          uploadedAt: serverTimestamp(),
          status: "In Progress",
          category: aiData.category,
          location: aiData.location,
          urgency: aiData.urgency,
          summary: aiData.summary,
          ngoId:"mumbai_relief_02",
          uploaderEmail: auth.currentUser?.email
        });
      }

      setSubmitted(true);
      setFiles([]);
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Failed to upload surveys. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 tracking-tight">
          Upload Survey
        </h2>
        <p className="text-sm text-stone-400 dark:text-stone-500 mt-1">
          Upload photos of handwritten paper surveys for AI extraction and processing.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="flex items-start gap-3 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800/30 rounded-xl px-4 py-3.5">
        <Sparkles size={16} className="text-sky-500 dark:text-sky-400 mt-0.5 shrink-0" />
        <p className="text-xs text-sky-700 dark:text-sky-300 leading-relaxed">
          <span className="font-semibold">AI-powered extraction.</span> Our
          model reads handwritten survey responses and populates the database
          automatically. Supported formats:{" "}
          <span className="font-mono font-semibold">.jpg, .jpeg, .png, .webp</span>
        </p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-8 py-14 cursor-pointer select-none transition-all duration-200
          ${isDragging
            ? "border-sky-400 dark:border-teal-400 bg-sky-50 dark:bg-teal-900/20 scale-[1.01]"
            : "border-sky-200 dark:border-stone-700 bg-white dark:bg-stone-800/50 hover:border-sky-300 dark:hover:border-teal-500 hover:bg-sky-50/40 dark:hover:bg-teal-900/10"
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleInputChange}
        />

        <div
          className={`flex items-center justify-center w-16 h-16 rounded-2xl transition-colors duration-200 ${isDragging ? "bg-sky-100 dark:bg-teal-800 text-sky-600 dark:text-teal-300" : "bg-sky-50 dark:bg-stone-800 text-sky-400 dark:text-stone-500 border border-sky-100 dark:border-stone-700"
            }`}
        >
          <CloudUpload size={32} strokeWidth={1.5} />
        </div>

        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-stone-600 dark:text-stone-300">
            {isDragging
              ? "Release to attach files"
              : "Drag & drop survey images here"}
          </p>
          <p className="text-xs text-stone-400 dark:text-stone-500">
            or{" "}
            <span className="text-sky-600 dark:text-teal-400 font-semibold underline underline-offset-2 decoration-dashed">
              click to browse
            </span>{" "}
            from your device
          </p>
        </div>

        <div className="flex items-center gap-2 mt-1">
          {["JPG", "PNG", "WEBP"].map((ext) => (
            <span
              key={ext}
              className="px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-stone-400 dark:text-stone-500 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-full uppercase"
            >
              {ext}
            </span>
          ))}
        </div>

        {isDragging && (
          <div className="absolute inset-0 rounded-2xl bg-teal-400/5 dark:bg-teal-400/10 pointer-events-none" />
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-widest">
              Attached Files ({files.length})
            </p>
            <button
              onClick={() => setFiles([])}
              className="text-xs text-stone-400 dark:text-stone-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors font-medium"
            >
              Remove all
            </button>
          </div>
          <div className="space-y-2">
            {files.map((file, i) => (
              <FileChip key={`${file.name}-${i}`} file={file} onRemove={() => removeFile(i)} />
            ))}
          </div>
        </div>
      )}

      {submitted && (
        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl px-5 py-4">
          <CheckCircle2 size={18} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              Submitted for AI processing!
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400/80 mt-0.5">
              Results will appear in your Dashboard within a few minutes.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-sm font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
        >
          <ImagePlus size={15} />
          Add More
        </button>

        <button
          onClick={handleUpload}
          disabled={files.length === 0 || isSubmitting}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm transition-all duration-150
            ${files.length === 0
              ? "bg-slate-200 dark:bg-stone-200 text-slate-400 dark:text-stone-400 cursor-not-allowed shadow-none"
              : isSubmitting
                ? "bg-sky-400 dark:bg-teal-400 cursor-wait"
                : "bg-sky-600 hover:bg-sky-700 dark:bg-teal-600 dark:hover:bg-teal-700 active:scale-95 shadow-[0_0_20px_rgba(2,132,199,0.25)] dark:shadow-[0_0_20px_rgba(45,212,191,0.25)]"
            }`}
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin w-4 h-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              Processing…
            </>
          ) : (
            <>
              <UploadCloud size={16} />
              Submit to AI
            </>
          )}
        </button>
      </div>
    </div>
  );
}