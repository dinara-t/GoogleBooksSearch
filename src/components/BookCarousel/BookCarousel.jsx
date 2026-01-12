import styles from "./BookCarousel.module.scss";

const BookCarousel = ({ title, books }) => {
  if (!books?.length) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>{title}</h2>

      <div className={styles.row}>
        {books.map((b) => (
          <a
            key={b.id}
            className={styles.card}
            href={b.previewLink || b.infoLink}
            target="_blank"
            rel="noreferrer"
            title={b.title}
          >
            <div className={styles.coverWrap}>
              {b.thumbnail ? (
                <img className={styles.cover} src={b.thumbnail} alt={b.title} />
              ) : (
                <div className={styles.noCover}>No cover</div>
              )}
            </div>
            <div className={styles.meta}>
              <div className={styles.bookTitle}>{b.title}</div>
              {b.authorsText ? (
                <div className={styles.authors}>{b.authorsText}</div>
              ) : null}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default BookCarousel;
