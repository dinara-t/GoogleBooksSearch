import { useEffect, useState } from "react";
import styles from "./AboutPage.module.scss";
import BookCarousel from "../../components/BookCarousel/BookCarousel.jsx";
import { fetchFeaturedBooks } from "../../services/featuredBooks.js";

const AboutPage = () => {
  const [featured, setFeatured] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    fetchFeaturedBooks({ q: "award winning fiction", maxResults: 14 })
      .then((books) => {
        if (!alive) return;
        setFeatured(books);
      })
      .catch((e) => {
        if (!alive) return;
        setErr(e?.message || "Couldn’t load featured books.");
      });

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>About</h1>

      <p className={styles.text}>
        This app lets you search Google Books by title, author, or keywords and
        explore results with quick previews.
      </p>

      <p className={styles.text}>
        To keep results relevant, we filter the API response so the query
        appears in key metadata (such as title, authors, or categories). This
        helps reduce unrelated matches and makes browsing faster.
      </p>

      <p className={styles.text}>
        Tips: try specific phrases (e.g. <em>“The Great Gatsby”</em>), combine
        terms (<em>“tolkien fantasy”</em>), or use an author name to narrow
        results.
      </p>

      <p className={styles.text}>
        Data is provided by the Google Books API. Availability of covers,
        descriptions, and preview links depends on the publisher’s metadata.
      </p>

      {err ? <p className={styles.error}>{err}</p> : null}

      <BookCarousel title="Top picks right now" books={featured} />
    </div>
  );
};

export default AboutPage;
