'use client';

import * as React from 'react';
import { downscale } from '@/utils/downscale';

export default function AddEntryToServerForm({ tripId }: { tripId: string }) {
  const [text, setText] = React.useState('');
  const [files, setFiles] = React.useState<FileList | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);

    try {
      // 1) อัปโหลดรูปไป Cloudinary ผ่าน API ของเรา
      let images: any[] = [];
      if (files && files.length) {
        const form = new FormData();
        for (const f of Array.from(files)) {
          const small = await downscale(f, 1600, 0.85);
          form.append('files', small);
        }
        const up = await fetch('/api/upload', { method: 'POST', body: form });
        if (!up.ok) throw new Error('Upload failed');
        const upJson = await up.json();
        images = upJson.images;
      }

      // 2) สร้าง entry ใน MongoDB
      const res = await fetch(`/api/trips/${tripId}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, images }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Create entry failed');
      }

      setText('');
      (e.target as HTMLFormElement).reset();
      setFiles(null);
      alert('บันทึกสำเร็จ');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <textarea value={text} onChange={(e) => setText(e.target.value)} required className="border rounded p-2" placeholder="เขียนบันทึก..." />
      <input type="file" accept="image/*" multiple onChange={(e) => setFiles(e.currentTarget.files)} />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button className="border rounded px-4 py-2" disabled={busy}>
        {busy ? 'กำลังบันทึก…' : 'เพิ่มบันทึก (ออนไลน์)'}
      </button>
    </form>
  );
}
