// Unified event tracking → Google Analytics 4 + Meta Pixel + TikTok Pixel.
// A single track() call maps one semantic event to each platform's own name,
// so the booking funnel is reported consistently everywhere.
import { ANALYTICS } from "./config";

export const ANALYTICS_ON = !!(ANALYTICS.ga4 || ANALYTICS.metaPixel || ANALYTICS.tiktokPixel);

// semantic event -> { ga4, meta, tiktok } native event names
const MAP = {
  view_style:    { ga: "view_item",     fb: "ViewContent",      tt: "ViewContent" },
  begin_booking: { ga: "begin_checkout", fb: "InitiateCheckout", tt: "InitiateCheckout" },
  book:          { ga: "generate_lead",  fb: "Lead",             tt: "SubmitForm" },
  whatsapp:      { ga: "contact",        fb: "Contact",          tt: "Contact" },
};

export function track(event, params = {}) {
  if (typeof window === "undefined") return;
  const m = MAP[event] || { ga: event, fb: event, tt: event };
  const { value, currency = "EGP", name } = params;
  const payload = {};
  if (value != null) payload.value = value;
  if (value != null) payload.currency = currency;
  if (name) { payload.content_name = name; payload.items = [{ item_name: name, price: value }]; }
  try { window.gtag && window.gtag("event", m.ga, payload); } catch (e) {}
  try { window.fbq && window.fbq("track", m.fb, payload); } catch (e) {}
  try { window.ttq && window.ttq.track && window.ttq.track(m.tt, payload); } catch (e) {}
}
