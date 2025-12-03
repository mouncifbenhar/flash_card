export const STORAGE_KEY_COLLECTIONS = "cards_collections";
export const STORAGE_KEY_BEST_SCORES = "best_scores";

export function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-");
}

export function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function normalizeTextAnswer(s) {
  return String(s).toLowerCase().trim().replace(/\s+/g, " ");
}

export const defaultCollectionsData = {
  collections: [
    {
      id: "html-basics",
      title: "HTML Basics",
      cards: [
        { id: "c1", question: "Quelle balise pour un paragraphe ?", answer: "<p>" },
        { id: "c2", question: "Balise pour image ?", answer: "<img>" }
      ]
    }
  ]
};

export function loadCollectionsData() {
  const raw = localStorage.getItem(STORAGE_KEY_COLLECTIONS);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY_COLLECTIONS, JSON.stringify(defaultCollectionsData));
    return structuredClone(defaultCollectionsData);
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.collections)) throw new Error("Bad data");
    return parsed;
  } catch {
    localStorage.setItem(STORAGE_KEY_COLLECTIONS, JSON.stringify(defaultCollectionsData));
    return structuredClone(defaultCollectionsData);
  }
}

export function saveCollectionsData(data) {
  localStorage.setItem(STORAGE_KEY_COLLECTIONS, JSON.stringify(data));
}

export function loadBestScores() {
  const raw = localStorage.getItem(STORAGE_KEY_BEST_SCORES);
  if (!raw) return {};
  try { return JSON.parse(raw) || {}; } catch { return {}; }
}

export function saveBestScores(scores) {
  localStorage.setItem(STORAGE_KEY_BEST_SCORES, JSON.stringify(scores));
}
