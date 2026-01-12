const BASE_URL = "https://www.googleapis.com/books/v1/volumes";
const cache = new Map();

const key = (q) =>
  String(q || "")
    .trim()
    .toLowerCase();

const getEntry = (q) => {
  const k = key(q);
  if (!k) return null;
  let e = cache.get(k);
  if (!e) {
    e = {
      apiTotalItems: 0,
      scanned: 0,
      nextIndex: 0,
      done: false,
      filtered: [],
    };
    cache.set(k, e);
  }
  return e;
};

export const resetSearchCache = (q) => {
  cache.delete(key(q));
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

  const authors = Array.isArray(v.authors) ? v.authors : [];
  const categories = Array.isArray(v.categories) ? v.categories : [];

  return {
    id: item?.id || "",
    title: v.title || "",
    subtitle: v.subtitle || "",
    authors,
    authorsText: authors.join(", "),
    publishedDate: v.publishedDate || "",
    publisher: v.publisher || "",
    description: v.description || "",
    language: v.language || "",
    country: s?.country || "",
    pageCount: typeof v.pageCount === "number" ? v.pageCount : null,
    categories,
    thumbnail: pickThumb(v.imageLinks),
    previewLink: v.previewLink || "",
    infoLink: v.infoLink || "",
    webReaderLink: a?.webReaderLink || "",
  };
};

const joinLower = (arr) =>
  (Array.isArray(arr) ? arr.join(" ") : "").toLowerCase();

const matches = (apiItem, phrase) => {
  const p = key(phrase);
  const v = apiItem?.volumeInfo || {};
  return (
    String(v.title || "")
      .toLowerCase()
      .includes(p) ||
    joinLower(v.authors).includes(p) ||
    joinLower(v.categories).includes(p)
  );
};

const fetchPage = async (q, startIndex, maxResults) => {
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

const scanMore = async (raw) => {
  const q = String(raw || "").trim();
  const entry = getEntry(q);
  if (!entry || entry.done) return;

  const PAGE = 40;
  const data = await fetchPage(q, entry.nextIndex, PAGE);

  entry.apiTotalItems = Number(data?.totalItems || 0);

  const items = Array.isArray(data?.items) ? data.items : [];
  entry.scanned += items.length;

  for (const it of items) {
    if (matches(it, q)) entry.filtered.push(normalise(it));
  }

  entry.nextIndex += PAGE;

  entry.done =
    items.length === 0 ||
    (entry.apiTotalItems > 0 && entry.nextIndex >= entry.apiTotalItems) ||
    (entry.apiTotalItems === 0 && entry.scanned >= 200);
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

  const entry = getEntry(raw);
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
  const entry = getEntry(raw);

  const pageCapItems = maxPages * pageSize;

  const build = (count, cappedPages, cappedTitles) => {
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
    if (count >= maxTitles) return build(count, true, true);
    if (count > pageCapItems) return build(count, true, false);
    await scanMore(raw);
  }

  return build(entry.filtered.length, false, false);
};
