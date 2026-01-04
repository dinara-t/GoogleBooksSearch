import { useEffect } from "react";
import styles from "./BookModal.module.scss";

const BookModal = ({ book, onClose }) => {
  useEffect(() => {
    if (!book) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [book, onClose]);

  if (!book) return null;

  const authorsText = book.authors?.length
    ? book.authors.join(", ")
    : "Unknown author";
  const descriptionText = book.description?.trim()
    ? book.description
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
          <button className={styles.close} type="button" onClick={onClose}>
            X
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.left}>
            {book.thumbnail ? (
              <img
                className={styles.image}
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

            <p className={styles.desc}>{descriptionText}</p>

            <div className={styles.links}>
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
      </div>
    </div>
  );
};

export default BookModal;
