import { useMemo, useRef, useState } from "react";
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

const HomePage = () => {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [apiTotalItems, setApiTotalItems] = useState(0);

  const [titlesLabel, setTitlesLabel] = useState("0");
  const [pagesLabel, setPagesLabel] = useState("1");

  const [strictDone, setStrictDone] = useState(false);
  const [isComputingTotal, setIsComputingTotal] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [pageNavLoading, setPageNavLoading] = useState(false);

  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);

  const runIdRef = useRef(0);

  const totalPagesNumber = useMemo(() => {
    const pages = Math.max(1, Math.ceil((apiTotalItems || 0) / PAGE_SIZE));
    return Math.min(pages, 50);
  }, [apiTotalItems]);

  const hasNext = useMemo(() => {
    if (!hasSearched || !!error) return false;
    if (isLoading || pageNavLoading) return false;

    if (pagesLabel === "50+") {
      return books.length === PAGE_SIZE;
    }

    return page < totalPagesNumber;
  }, [
    hasSearched,
    error,
    isLoading,
    pageNavLoading,
    pagesLabel,
    books.length,
    page,
    totalPagesNumber,
  ]);

  const runSearchPage = async ({ nextQuery, nextPage, mode }) => {
    const startIndex = (nextPage - 1) * PAGE_SIZE;

    if (mode === "nav") setPageNavLoading(true);
    else setIsLoading(true);

    setError("");

    try {
      const data = await searchBooks({
        query: nextQuery,
        startIndex,
        maxResults: PAGE_SIZE,
        reset: false,
      });

      setHasSearched(true);

      const ati = data.apiTotalItems || 0;
      setApiTotalItems(ati);

      const apiLabels = capLabelsFromApi(ati);
      setTitlesLabel(apiLabels.titlesLabel);
      setPagesLabel(apiLabels.pagesLabel);

      if (!Array.isArray(data.items) || data.items.length === 0) {
        setBooks([]);
        return;
      }

      setBooks(data.items);
    } catch (e) {
      setBooks([]);
      setApiTotalItems(0);
      setTitlesLabel("0");
      setPagesLabel("1");
      setError(e?.message || "Something went wrong.");
      setHasSearched(true);
    } finally {
      if (mode === "nav") setPageNavLoading(false);
      else setIsLoading(false);
    }
  };

  const handleSearch = async (q) => {
    const raw = (q || "").trim();
    const runId = runIdRef.current + 1;
    runIdRef.current = runId;

    setQuery(raw);
    setPage(1);
    setBooks([]);
    setApiTotalItems(0);
    setTitlesLabel("0");
    setPagesLabel("1");
    setStrictDone(false);
    setIsComputingTotal(false);

    if (!raw) {
      setHasSearched(false);
      return;
    }

    resetSearchCache(raw);

    await runSearchPage({ nextQuery: raw, nextPage: 1, mode: "search" });

    setIsComputingTotal(true);

    computeFilteredTotal(raw, {
      pageSize: PAGE_SIZE,
      maxPages: 50,
      maxTitles: 1000,
    })
      .then((res) => {
        if (runIdRef.current !== runId) return;
        setTitlesLabel(res.titlesLabel);
        setPagesLabel(res.pagesLabel);
        setStrictDone(true);
      })
      .catch(() => {
        if (runIdRef.current !== runId) return;
        setStrictDone(true);
      })
      .finally(() => {
        if (runIdRef.current !== runId) return;
        setIsComputingTotal(false);
      });
  };

  const handlePrev = async () => {
    const nextPage = Math.max(1, page - 1);
    setPage(nextPage);
    await runSearchPage({ nextQuery: query, nextPage, mode: "nav" });
  };

  const handleNext = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    await runSearchPage({ nextQuery: query, nextPage, mode: "nav" });
  };

  const showNoResults =
    hasSearched && !isLoading && !error && books.length === 0;

  const showingText = useMemo(() => {
    if (!hasSearched || error || isLoading) return "";
    if (showNoResults) return "";
    if (!books.length) return "";

    const from = (page - 1) * PAGE_SIZE + 1;
    const to = (page - 1) * PAGE_SIZE + books.length;

    if (!strictDone && isComputingTotal) {
      return `Showing ${from}–${to} of (Loading...) results `;
    }

    return `Showing ${from}–${to} of ${titlesLabel} results.`;
  }, [
    hasSearched,
    error,
    isLoading,
    showNoResults,
    books.length,
    page,
    titlesLabel,
    strictDone,
    isComputingTotal,
  ]);

  const paginationVisible = useMemo(() => {
    if (!hasSearched) return false;
    if (error) return false;
    if (!books.length) return false;
    return true;
  }, [hasSearched, error, books.length]);

  return (
    <div className={styles.page}>
      <Heading
        title="Search Google Books"
        subtitle="Type a title, author, or keyword. Click a book for more details."
      />

      <SearchForm
        initialValue={query}
        onSearch={handleSearch}
        isLoading={isLoading}
      />

      <div className={styles.status}>
        {error ? <p className={styles.error}>{error}</p> : null}
        {isLoading ? <p className={styles.loading}>Loading results…</p> : null}
        {showingText ? <p className={styles.hint}>{showingText}</p> : null}
        {showNoResults ? (
          <p className={styles.empty}>
            No results found. Try a different query.
          </p>
        ) : null}
        {!hasSearched ? (
          <p className={styles.hint}>
            Try: “The Lord of the Rings”, “Pride and Prejudice”, “The Great
            Gatsby”.
          </p>
        ) : null}
      </div>

      {books.length ? <BookGrid books={books} onSelect={setSelected} /> : null}

      {paginationVisible ? (
        <Pagination
          page={page}
          totalPagesLabel={pagesLabel}
          isTotalLoading={isComputingTotal && !strictDone}
          hasNext={hasNext}
          isLoading={pageNavLoading}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      ) : null}

      <BookModal book={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default HomePage;
