// Image upload + display helpers.
// Uploads go to Cloudinary when configured (full quality, smart cropping);
// otherwise they fall back to a compact in-DB data URL so the app still works.
import { CLOUDINARY } from "./config";
import { fileToDataURL } from "./util";

export const cloudinaryOn = () => !!(CLOUDINARY.cloudName && CLOUDINARY.uploadPreset);

export async function uploadImage(file) {
  if (cloudinaryOn()) {
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", CLOUDINARY.uploadPreset);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY.cloudName}/image/upload`, { method: "POST", body: form });
      if (res.ok) return (await res.json()).secure_url;
    } catch (e) { /* fall back below */ }
  }
  // fallback: compact in-DB data URL (keeps uploads working if Cloudinary is unset/unreachable)
  return fileToDataURL(file);
}

// Insert a transformation into a Cloudinary URL; pass through anything else
// (data URLs, external URLs) unchanged.
export function cldImg(url, transform) {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/${transform}/`);
}

// Named transform presets (Cloudinary delivers optimized format + quality)
export const IMG = {
  thumb: "c_fill,g_auto,w_600,h_600,f_auto,q_auto",   // square subject-centered thumbnail (hi-res for retina)
  hero: "c_fill,g_auto,ar_4:5,w_1200,f_auto,q_auto",  // tall portrait hero (no chopping)
  swatch: "c_fill,g_auto,w_220,h_220,f_auto,q_auto",  // small round color swatch
  review: "c_limit,w_1000,f_auto,q_auto",             // full screenshot, never cropped
  full: "c_limit,w_1600,f_auto,q_auto",               // lightbox / full-screen view
};
