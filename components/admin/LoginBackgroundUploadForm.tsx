"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function LoginBackgroundUploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Choose an image first.");
      return;
    }
    setPending(true);
    setError(null);

    try {
      const ext = file.name.split(".").pop() || "jpg";
      setStatus("Uploading…");

      const signRes = await fetch("/api/admin/login-background/sign-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ext }),
      });
      const signed = await signRes.json();
      if (signed.error) throw new Error(signed.error);

      const supabase = getSupabase();
      const { error: uploadErr } = await supabase.storage
        .from("login-background")
        .uploadToSignedUrl(signed.path, signed.token, file);
      if (uploadErr) throw new Error(uploadErr.message);

      const { data } = supabase.storage.from("login-background").getPublicUrl(signed.path);

      setStatus("Saving…");
      const res = await fetch("/api/admin/login-background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: data.publicUrl }),
      });
      const result: { error?: string } = await res.json();
      if (result.error) throw new Error(result.error);

      setFile(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setPending(false);
      setStatus(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{error}</p>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="block text-sm px-4 py-2 bg-brass text-ink rounded hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {pending ? status ?? "Working…" : "Upload background"}
      </button>
    </form>
  );
}
