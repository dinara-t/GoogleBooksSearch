import { useMemo, useState } from "react";
import styles from "./SearchForm.module.scss";

const SearchForm = ({ initialValue = "", onSearch, isLoading }) => {
  const [value, setValue] = useState(initialValue);

  const isValid = useMemo(() => value.trim().length > 0, [value]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid || isLoading) return;
    onSearch(value.trim());
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by title or author"
        type="text"
      />
      <button
        className={styles.button}
        type="submit"
        disabled={!isValid || isLoading}
      >
        {isLoading ? "Searching…" : "Search"}
      </button>
    </form>
  );
};

export default SearchForm;
