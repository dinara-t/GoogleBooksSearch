const BASE_URL = "https://www.googleapis.com/books/v1/volumes";

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
  const authors = Array.isArray(v.authors) ? v.authors : [];

  return {
    id: item?.id || "",
    title: v.title || "",
    authorsText: authors.join(", "),
    thumbnail: pickThumb(v.imageLinks),
    previewLink: v.previewLink || "",
    infoLink: v.infoLink || "",
  };
};

export const fetchFeaturedBooks = async ({
  q = "award winning fiction",
  maxResults = 12,
} = {}) => {
  const u = new URL(BASE_URL);
  u.searchParams.set("q", q);
  u.searchParams.set("maxResults", String(maxResults));
  u.searchParams.set("printType", "books");
  u.searchParams.set("orderBy", "relevance");
  u.searchParams.set("projection", "lite");

  const r = await fetch(u.toString());
  if (!r.ok) {
    const msg = await r.text().catch(() => "");
    throw new Error(msg || `API ${r.status}`);
  }

  const data = await r.json();
  const items = Array.isArray(data?.items) ? data.items : [];
  return items.map(normalise).filter((b) => b.id && b.title);
};
