import styles from "./AboutPage.module.scss";

const AboutPage = () => {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>About</h1>
      <p className={styles.text}>
        This app uses the Google Books API to search for books. Results are
        filtered so only books where the query appears in the title or author
        are displayed.
      </p>
    </div>
  );
};

export default AboutPage;
