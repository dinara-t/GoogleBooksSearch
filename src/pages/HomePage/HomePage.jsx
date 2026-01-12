import { useRef, useState } from "react";
import Heading from "../../components/Heading/Heading.jsx";
import SearchForm from "../../components/SearchForm/SearchForm.jsx";
import BookGrid from "../../components/BookGrid/BookGrid.jsx";
import BookModal from "../../components/BookModal/BookModal.jsx";
import Pagination from "../../components/Pagination/Pagination.jsx";
import {
  searchBooks,
  computeFilteredTotal,
  resetSearchCache,
} from "../../services/googleBooks.js";
import styles from "./HomePage.module.scss";

const PAGE_SIZE = 12;

const capLabelsFromApi = (apiTotalItems) => {
  const titlesLabel =
    apiTotalItems > 1000 ? "1000+" : String(apiTotalItems || 0);
  const pages = Math.max(1, Math.ceil((apiTotalItems || 0) / PAGE_SIZE));
  const pagesLabel = pages > 50 ? "50+" : String(pages);
  return { titlesLabel, pagesLabel };
};

const pagesFromLabel = (pagesLabel) => {
  const s = String(pagesLabel || "1");
  if (s.endsWith("+")) return 50;
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : 1;
};

const HomePage = () => {
  const [state, setState] = useState({
    query: "",
    page: 1,
    books: [],
    apiTotalItems: 0,
    labels: { titlesLabel: "0", pagesLabel: "1" },
    totalStatus: "idle",
    loading: null,
    error: "",
    hasSearched: false,
    selected: null,
  });

  const runIdRef = useRef(0);

  const set = (patch) => setState((s) => ({ ...s, ...patch }));

  const runSearchPage = async ({ nextQuery, nextPage, mode }) => {
    const startIndex = (nextPage - 1) * PAGE_SIZE;
    set({ loading: mode, error: "" });

    try {
      const data = await searchBooks({
        query: nextQuery,
        startIndex,
        maxResults: PAGE_SIZE,
        reset: false,
      });

      const apiTotalItems = data.apiTotalItems || 0;
      const apiLabels = capLabelsFromApi(apiTotalItems);
      const items = Array.isArray(data.items) ? data.items : [];

      setState((s) => ({
        ...s,
        hasSearched: true,
        apiTotalItems,
        books: items,
        labels: s.totalStatus === "done" ? s.labels : apiLabels,
      }));
    } catch (e) {
      set({
        hasSearched: true,
        books: [],
        apiTotalItems: 0,
        labels: { titlesLabel: "0", pagesLabel: "1" },
        error: e?.message || "Something went wrong.",
      });
    } finally {
      set({ loading: null });
    }
  };

  const handleSearch = async (q) => {
    const raw = (q || "").trim();
    const runId = ++runIdRef.current;

    set({
      query: raw,
      page: 1,
      books: [],
      apiTotalItems: 0,
      labels: { titlesLabel: "0", pagesLabel: "1" },
      totalStatus: "idle",
      error: "",
    });

    if (!raw) {
      set({ hasSearched: false });
      return;
    }

    resetSearchCache(raw);

    await runSearchPage({ nextQuery: raw, nextPage: 1, mode: "search" });

    set({ totalStatus: "computing" });

    computeFilteredTotal(raw, {
      pageSize: PAGE_SIZE,
      maxPages: 50,
      maxTitles: 1000,
    })
      .then((res) => {
        if (runIdRef.current !== runId) return;
        set({
          labels: { titlesLabel: res.titlesLabel, pagesLabel: res.pagesLabel },
        });
      })
      .catch(() => {})
      .finally(() => {
        if (runIdRef.current !== runId) return;
        set({ totalStatus: "done" });
      });
  };

  const handlePrev = async () => {
    const nextPage = Math.max(1, state.page - 1);
    set({ page: nextPage });
    await runSearchPage({ nextQuery: state.query, nextPage, mode: "nav" });
  };

  const handleNext = async () => {
    const nextPage = state.page + 1;
    set({ page: nextPage });
    await runSearchPage({ nextQuery: state.query, nextPage, mode: "nav" });
  };

  const isSearchLoading = state.loading === "search";
  const isNavLoading = state.loading === "nav";
  const isTotalLoading = state.totalStatus === "computing";

  const showNoResults =
    state.hasSearched &&
    !isSearchLoading &&
    !state.error &&
    state.books.length === 0;

  const paginationVisible =
    state.hasSearched && !state.error && state.books.length > 0;

  const totalPagesNumber = pagesFromLabel(state.labels.pagesLabel);

  const hasNext = (() => {
    if (!state.hasSearched || state.error) return false;
    if (isSearchLoading || isNavLoading) return false;

    if (String(state.labels.pagesLabel).endsWith("+")) {
      return state.books.length === PAGE_SIZE;
    }

    return state.page < totalPagesNumber;
  })();

  const showingText = (() => {
    if (!state.hasSearched || state.error || isSearchLoading) return "";
    if (showNoResults || !state.books.length) return "";

    const from = (state.page - 1) * PAGE_SIZE + 1;
    const to = (state.page - 1) * PAGE_SIZE + state.books.length;

    if (isTotalLoading && state.totalStatus !== "done") {
      return `Showing ${from}–${to} of (Loading...) results `;
    }

    return `Showing ${from}–${to} of ${state.labels.titlesLabel} results.`;
  })();

  return (
    <div className={styles.page}>
      <Heading
        title="Search Google Books"
        subtitle="Type a title, author, or keyword. Click a book for more details."
      />

      <SearchForm
        initialValue={state.query}
        onSearch={handleSearch}
        isLoading={isSearchLoading}
      />

      <div className={styles.status}>
        {state.error ? <p className={styles.error}>{state.error}</p> : null}

        {isSearchLoading ? (
          <p className={styles.loading}>Loading results…</p>
        ) : null}

        {showingText ? <p className={styles.hint}>{showingText}</p> : null}

        {showNoResults ? (
          <p className={styles.empty}>
            No results found. Try a different query.
          </p>
        ) : null}

        {!state.hasSearched ? (
          <p className={styles.hint}>
            Try: “The Lord of the Rings”, “Pride and Prejudice”, “The Great
            Gatsby”.
          </p>
        ) : null}
      </div>

      {state.books.length ? (
        <BookGrid
          books={state.books}
          onSelect={(selected) => set({ selected })}
        />
      ) : null}

      {paginationVisible ? (
        <Pagination
          page={state.page}
          totalPagesLabel={state.labels.pagesLabel}
          isTotalLoading={isTotalLoading && state.totalStatus !== "done"}
          hasNext={hasNext}
          isLoading={isNavLoading}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      ) : null}

      <BookModal
        book={state.selected}
        onClose={() => set({ selected: null })}
      />
    </div>
  );
};

export default HomePage;
