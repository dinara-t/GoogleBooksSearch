import styles from "./BookCard.module.scss";

const BookCard = ({ book, onClick }) => {
  const authorsText = book.authors?.length
    ? book.authors.join(", ")
    : "Unknown author";
  const descriptionText = book.description?.trim()
    ? book.description
    : "No description available.";

  return (
    <button type="button" className={styles.card} onClick={onClick}>
      <div className={styles.cover}>
        {book.thumbnail ? (
          <img className={styles.image} src={book.thumbnail} alt={book.title} />
        ) : (
          <div className={styles.noCover}>No cover</div>
        )}
      </div>

      <div className={styles.meta}>
        <h3 className={styles.title}>{book.title}</h3>
        <p className={styles.authors}>{authorsText}</p>
        <p className={styles.desc}>{descriptionText}</p>
      </div>
    </button>
  );
};

export default BookCard;
