'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../Modal';

interface Props { onClose: () => void }

// Show every 3rd frame for a varied gallery (33 photos)
const galleryFrames = Array.from({ length: 100 }, (_, i) => i + 1)
  .filter(n => n !== 45 && n % 3 === 0)
  .map(n => ({
    src:   `/assets/frame_${String(n).padStart(4, '0')}.jpg`,
    alt:   `Basketball action frame ${n}`,
    label: `Frame ${n}`,
  }));

export default function GalleryModal({ onClose }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const prev = () => setLightbox(v => (v === null ? null : (v - 1 + galleryFrames.length) % galleryFrames.length));
  const next = () => setLightbox(v => (v === null ? null : (v + 1) % galleryFrames.length));

  return (
    <Modal onClose={onClose} title="Gallery" maxWidth="max-w-4xl">
      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {galleryFrames.map(({ src, alt }, idx) => (
          <motion.button
            key={src}
            className="relative aspect-video overflow-hidden rounded-lg bg-white/[0.04] group"
            onClick={() => setLightbox(idx)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.015, duration: 0.3 }}
          >
            <Image
              src={src}
              alt={alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
            />
            <div className="absolute inset-0 bg-court-orange/0 group-hover:bg-court-orange/10 transition-colors duration-200" />
          </motion.button>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/95 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <motion.div
              className="relative w-full max-w-4xl mx-4 aspect-video"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1,   opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
            >
              <Image
                src={galleryFrames[lightbox].src}
                alt={galleryFrames[lightbox].alt}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </motion.div>

            {/* Prev / Next */}
            {[
              { fn: prev, icon: '←', pos: 'left-4' },
              { fn: next, icon: '→', pos: 'right-4' },
            ].map(({ fn, icon, pos }) => (
              <button
                key={icon}
                onClick={e => { e.stopPropagation(); fn(); }}
                className={`absolute ${pos} top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors font-bebas text-lg`}
              >
                {icon}
              </button>
            ))}

            {/* Close */}
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full glass flex items-center justify-center text-white/60 hover:text-white transition-colors"
              aria-label="Close lightbox"
            >
              ✕
            </button>

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-barlow text-white/30 text-xs tracking-widest">
              {lightbox + 1} / {galleryFrames.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
