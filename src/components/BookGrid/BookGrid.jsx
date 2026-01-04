import BookCard from "../BookCard/BookCard.jsx";
import styles from "./BookGrid.module.scss";

const BookGrid = ({ books, onSelect }) => {
  return (
    <section className={styles.grid}>
      {books.map((b) => (
        <BookCard key={b.id} book={b} onClick={() => onSelect(b)} />
      ))}
    </section>
  );
};

export default BookGrid;
