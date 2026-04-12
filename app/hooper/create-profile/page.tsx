'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useConvexAuth } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import UserSync from '@/components/UserSync';

export default function CreateProfilePage() {
  const router  = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const profile = useQuery(api.profiles.getMyProfile);

  // Redirect if profile already exists
  useEffect(() => {
    if (profile) router.replace('/hooper');
  }, [profile, router]);

  const createProfile    = useMutation(api.profiles.createProfile);
  const generateUploadUrl = useMutation(api.profiles.generateUploadUrl);

  const [form, setForm] = useState({
    name:         '',
    heightFeet:   '5',
    heightInches: '10',
    weight:       '',
    age:          '',
    dateOfBirth:  '',
    city:         '',
  });
  const [photoFile,    setPhotoFile]    = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading,    setUploading]    = useState(false);
  const [error,        setError]        = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function set(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      setError('Authentication is still loading. Please wait a moment and try again.');
      return;
    }

    if (!form.name || !form.weight || !form.age || !form.dateOfBirth || !form.city) {
      setError('Please fill in all required fields.');
      return;
    }

    setUploading(true);
    try {
      let storageId: Id<'_storage'> | undefined;

      if (photoFile) {
        const uploadUrl = await generateUploadUrl();
        const res = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': photoFile.type },
          body: photoFile,
        });
        if (!res.ok) throw new Error('Photo upload failed');
        const { storageId: sid } = await res.json() as { storageId: string };
        storageId = sid as Id<'_storage'>;
      }

      await createProfile({
        name:         form.name.trim(),
        heightFeet:   parseInt(form.heightFeet),
        heightInches: parseInt(form.heightInches),
        weight:       parseInt(form.weight),
        age:          parseInt(form.age),
        dateOfBirth:  form.dateOfBirth,
        city:         form.city.trim(),
        storageId,
      });

      router.push('/hooper');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  const feetOptions   = Array.from({ length: 5 }, (_, i) => i + 4);  // 4–8
  const inchesOptions = Array.from({ length: 12 }, (_, i) => i);      // 0–11

  if (authLoading) {
    return (
      <div className="min-h-screen bg-court-black flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-court-orange border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <>
    <UserSync />
    <div className="min-h-screen bg-court-black flex items-center justify-center px-4 py-16">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-court-orange/5 via-transparent to-transparent pointer-events-none" />

      <motion.div
        className="relative w-full max-w-lg"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #FF4500, #F0B52A)', boxShadow: '0 0 30px rgba(255,69,0,0.4)' }}
          >
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="font-bebas text-5xl text-white tracking-wide">Build Your Profile</h1>
          <p className="text-white/40 font-dm text-sm mt-2">Set up your Hooper identity to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-7 space-y-5">
          {/* Photo upload */}
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-dashed border-white/20 hover:border-court-orange/50 transition-colors flex items-center justify-center"
              style={photoPreview ? {} : { background: 'rgba(255,255,255,0.04)' }}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-white/25" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
              )}
            </button>
            <div>
              <p className="text-white/60 text-sm font-dm">Profile Photo</p>
              <p className="text-white/25 text-xs font-dm mt-0.5">Optional · JPG or PNG</p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-2 text-court-orange text-xs font-barlow tracking-widest uppercase hover:text-court-amber transition-colors"
              >
                {photoPreview ? 'Change Photo' : 'Upload Photo'}
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </div>

          <div className="court-line" />

          {/* Name */}
          <Field label="Full Name *">
            <input
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className="w-full input-court"
              required
            />
          </Field>

          {/* Height */}
          <Field label="Height *">
            <div className="flex gap-3">
              <select value={form.heightFeet} onChange={e => set('heightFeet', e.target.value)} className="flex-1 input-court">
                {feetOptions.map(f => (
                  <option key={f} value={f}>{f} ft</option>
                ))}
              </select>
              <select value={form.heightInches} onChange={e => set('heightInches', e.target.value)} className="flex-1 input-court">
                {inchesOptions.map(i => (
                  <option key={i} value={i}>{i} in</option>
                ))}
              </select>
            </div>
          </Field>

          {/* Weight + Age */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Weight (lbs) *">
              <input
                type="number"
                placeholder="160"
                min={50} max={400}
                value={form.weight}
                onChange={e => set('weight', e.target.value)}
                className="w-full input-court"
                required
              />
            </Field>
            <Field label="Age *">
              <input
                type="number"
                placeholder="18"
                min={5} max={100}
                value={form.age}
                onChange={e => set('age', e.target.value)}
                className="w-full input-court"
                required
              />
            </Field>
          </div>

          {/* Date of Birth */}
          <Field label="Date of Birth *">
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={e => set('dateOfBirth', e.target.value)}
              className="w-full input-court"
              required
            />
          </Field>

          {/* City */}
          <Field label="City *">
            <input
              type="text"
              placeholder="Los Angeles, CA"
              value={form.city}
              onChange={e => set('city', e.target.value)}
              className="w-full input-court"
              required
            />
          </Field>

          {error && (
            <p className="text-red-400 text-sm font-dm text-center bg-red-500/10 rounded-lg py-2.5 px-4">{error}</p>
          )}

          <motion.button
            type="submit"
            disabled={uploading}
            className="w-full btn-court bg-court-orange text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ boxShadow: '0 0 25px rgba(255,69,0,0.35)' }}
            whileHover={!uploading ? { scale: 1.02 } : {}}
            whileTap={!uploading ? { scale: 0.98 } : {}}
          >
            {uploading ? 'Setting up your profile…' : 'Create My Profile'}
          </motion.button>
        </form>
      </motion.div>

      {/* Input styles injected inline via a style tag */}
      <style jsx global>{`
        .input-court {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.75rem;
          color: #EDE8DD;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          padding: 0.65rem 0.9rem;
          outline: none;
          transition: border-color 0.2s;
          appearance: none;
        }
        .input-court:focus {
          border-color: rgba(255,69,0,0.5);
        }
        .input-court::placeholder {
          color: rgba(237,232,221,0.25);
        }
        .input-court option {
          background: #111;
          color: #EDE8DD;
        }
        .input-court[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1) opacity(0.3);
        }
      `}</style>
    </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-barlow text-white/50 text-xs tracking-[0.25em] uppercase mb-1.5">{label}</label>
      {children}
    </div>
  );
}
