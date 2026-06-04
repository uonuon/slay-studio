"use client";

export default function Lightbox({ src, onClose }) {
  if (!src) return null;
  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lb-close" onClick={onClose} aria-label="close">✕</button>
      <img src={src} alt="" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}
