const BASE_URL = "https://www.googleapis.com/books/v1/volumes";

const cache = new Map();

const norm = (s) => String(s || "").toLowerCase();
const keyOf = (q) => norm(q).trim();

const makeEntry = () => ({
  apiTotalItems: 0,
  scanned: 0,
  nextIndex: 0,
  done: false,
  filtered: [],
});

const ensure = (q) => {
  const k = keyOf(q);
  if (!cache.has(k)) cache.set(k, makeEntry());
  return cache.get(k);
};

export const resetSearchCache = (q) => {
  cache.delete(keyOf(q || ""));
};

const pickThumb = (l) =>
  l?.thumbnail ||
  l?.smallThumbnail ||
  l?.small ||
  l?.medium ||
  l?.large ||
  l?.extraLarge ||
  "";

const normalise = (item) => {
  const v = item?.volumeInfo || {};
  const s = item?.saleInfo || {};
  const a = item?.accessInfo || {};

  const authorsArr = Array.isArray(v.authors) ? v.authors : [];
  const categoriesArr = Array.isArray(v.categories) ? v.categories : [];

  return {
    id: item?.id || "",
    title: v.title || "",
    subtitle: v.subtitle || "",
    authors: authorsArr,
    authorsText: authorsArr.join(", "),
    publishedDate: v.publishedDate || "",
    publisher: v.publisher || "",
    description: v.description || "",
    language: v.language || "",
    country: s?.country || "",
    pageCount: typeof v.pageCount === "number" ? v.pageCount : null,
    categories: categoriesArr,
    thumbnail: pickThumb(v.imageLinks),
    previewLink: v.previewLink || "",
    infoLink: v.infoLink || "",
    webReaderLink: a?.webReaderLink || "",
  };
};

const matches = (apiItem, phraseRaw) => {
  const p = norm(phraseRaw);
  const v = apiItem?.volumeInfo || {};

  const title = norm(v.title);
  const authors = norm((Array.isArray(v.authors) ? v.authors : []).join(" "));
  const categories = norm(
    (Array.isArray(v.categories) ? v.categories : []).join(" ")
  );

  return title.includes(p) || authors.includes(p) || categories.includes(p);
};

const fetchPage = async ({ q, startIndex, maxResults }) => {
  const u = new URL(BASE_URL);
  u.searchParams.set("q", q);
  u.searchParams.set("startIndex", String(startIndex));
  u.searchParams.set("maxResults", String(maxResults));
  u.searchParams.set("printType", "books");
  u.searchParams.set("orderBy", "relevance");
  u.searchParams.set("projection", "full");

  const r = await fetch(u.toString());
  if (!r.ok) {
    const msg = await r.text().catch(() => "");
    throw new Error(msg || `API ${r.status}`);
  }
  return r.json();
};

const scanMore = async (query) => {
  const q = String(query || "").trim();
  if (!q) return;

  const entry = ensure(q);
  if (entry.done) return;

  const PAGE = 40;

  const data = await fetchPage({
    q,
    startIndex: entry.nextIndex,
    maxResults: PAGE,
  });

  entry.apiTotalItems = Number(data?.totalItems || 0);

  const items = Array.isArray(data?.items) ? data.items : [];
  entry.scanned += items.length;

  for (const it of items) {
    if (matches(it, q)) entry.filtered.push(normalise(it));
  }

  entry.nextIndex += PAGE;

  if (!items.length) entry.done = true;
  if (entry.apiTotalItems > 0 && entry.nextIndex >= entry.apiTotalItems)
    entry.done = true;

  if (entry.apiTotalItems === 0 && entry.scanned >= 200) entry.done = true;
};

export const searchBooks = async ({
  query,
  startIndex = 0,
  maxResults = 12,
  reset = false,
}) => {
  const raw = String(query || "").trim();
  if (!raw) return { items: [], apiTotalItems: 0 };

  if (reset) resetSearchCache(raw);

  const entry = ensure(raw);
  const need = Math.max(0, startIndex + maxResults);

  while (!entry.done && entry.filtered.length < need) {
    await scanMore(raw);
  }

  return {
    items: entry.filtered.slice(startIndex, startIndex + maxResults),
    apiTotalItems: entry.apiTotalItems || 0,
  };
};

export const computeFilteredTotal = async (query, opts = {}) => {
  const raw = String(query || "").trim();
  if (!raw) {
    return {
      filteredTotal: 0,
      apiTotalItems: 0,
      titlesLabel: "0",
      pagesLabel: "1",
      cappedTitles: false,
      cappedPages: false,
    };
  }

  const { pageSize = 12, maxPages = 50, maxTitles = 1000 } = opts;

  const entry = ensure(raw);

  const pageCapItems = maxPages * pageSize;

  const make = (count, cappedPages, cappedTitles) => {
    const titlesLabel = cappedTitles
      ? `${maxTitles}+`
      : cappedPages
      ? `${pageCapItems}+`
      : String(count);

    const pages = Math.max(1, Math.ceil(count / pageSize));
    const pagesLabel = cappedPages ? `${maxPages}+` : String(pages);

    return {
      filteredTotal: count,
      apiTotalItems: entry.apiTotalItems || 0,
      titlesLabel,
      pagesLabel,
      cappedTitles: !!cappedTitles,
      cappedPages: !!cappedPages,
    };
  };

  while (!entry.done) {
    const count = entry.filtered.length;

    if (count >= maxTitles) return make(count, true, true);
    if (count > pageCapItems) return make(count, true, false);

    await scanMore(raw);
  }

  return make(entry.filtered.length, false, false);
};
