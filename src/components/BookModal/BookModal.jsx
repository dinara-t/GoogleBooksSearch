import { useEffect, useRef, useState } from "react";
import styles from "./BookModal.module.scss";

const BookModal = ({ book, onClose }) => {
  const [expanded, setExpanded] = useState(false);
  const [canToggle, setCanToggle] = useState(false);
  const descRef = useRef(null);

  useEffect(() => {
    if (!book) return;

    setExpanded(false);

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [book, onClose]);

  useEffect(() => {
    if (!book) return;

    const el = descRef.current;
    if (!el) return;

    let raf1 = 0;
    let raf2 = 0;

    const check = () => {
      if (!el) return;

      const isOverflowing = el.scrollHeight > el.clientHeight + 1;

      const text = String(book.description || "").trim();
      const fallback = text.length > 600;

      setCanToggle(isOverflowing || fallback);
    };

    const schedule = () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(check);
      });
    };

    schedule();
    window.addEventListener("resize", schedule);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.removeEventListener("resize", schedule);
    };
  }, [book, expanded]);

  if (!book) return null;

  const authorsText = book.authors?.length
    ? book.authors.join(", ")
    : "Unknown author";
  const descriptionText = book.description?.trim()
    ? book.description.trim()
    : "No description available.";

  return (
    <div className={styles.backdrop} onMouseDown={onClose} role="presentation">
      <div
        className={styles.modal}
        onMouseDown={(e) => e.stopPropagation()}
        role="presentation"
      >
        <div className={styles.header}>
          <h2 className={styles.title}>{book.title}</h2>
          <button
            className={styles.close}
            type="button"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.content}>
            <div className={styles.left}>
              {book.thumbnail ? (
                <img
                  className={styles.cover}
                  src={book.thumbnail}
                  alt={book.title}
                />
              ) : (
                <div className={styles.noCover}>No cover</div>
              )}
            </div>

            <div className={styles.right}>
              <p className={styles.line}>
                <strong>Author:</strong> {authorsText}
              </p>
              <p className={styles.line}>
                <strong>Published:</strong> {book.publishedDate || "Unknown"}
              </p>
              <p className={styles.line}>
                <strong>Publisher:</strong> {book.publisher || "Unknown"}
              </p>
              <p className={styles.line}>
                <strong>Language:</strong> {book.language || "Unknown"}
              </p>
              <p className={styles.line}>
                <strong>Country:</strong> {book.country || "Unknown"}
              </p>
              <p className={styles.line}>
                <strong>Pages:</strong> {book.pageCount ?? "Unknown"}
              </p>

              <p
                ref={descRef}
                className={`${styles.desc} ${
                  !expanded ? styles.descClamp : ""
                }`}
              >
                {descriptionText}
              </p>

              {canToggle ? (
                <button
                  type="button"
                  className={styles.descToggle}
                  onClick={() => setExpanded((v) => !v)}
                >
                  {expanded ? "Show less" : "Show all"}
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          {book.previewLink ? (
            <a
              className={styles.link}
              href={book.previewLink}
              target="_blank"
              rel="noreferrer"
            >
              Preview
            </a>
          ) : null}
          {book.infoLink ? (
            <a
              className={styles.link}
              href={book.infoLink}
              target="_blank"
              rel="noreferrer"
            >
              More info
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default BookModal;
