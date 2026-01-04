import styles from "./Pagination.module.scss";

const Pagination = ({
  page,
  totalPagesLabel,
  isTotalLoading,
  onPrev,
  onNext,
  hasNext,
  isLoading,
}) => {
  const canPrev = page > 1 && !isLoading;
  const canNext = !!hasNext && !isLoading;

  return (
    <div className={styles.wrap}>
      <button
        className={styles.btn}
        type="button"
        onClick={onPrev}
        disabled={!canPrev}
      >
        {isLoading ? "Loading…" : "Prev"}
      </button>

      <div className={styles.mid}>
        <span className={styles.page}>{page}</span>
        <span className={styles.sep}>/</span>
        <span className={styles.total}>
          {isTotalLoading ? "Loading…" : totalPagesLabel}
        </span>
      </div>

      <button
        className={styles.btn}
        type="button"
        onClick={onNext}
        disabled={!canNext}
      >
        {isLoading ? "Loading…" : "Next"}
      </button>
    </div>
  );
};

export default Pagination;
