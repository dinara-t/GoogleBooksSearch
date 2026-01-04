import { Link } from "react-router-dom";
import styles from "./NotFoundPage.module.scss";

const NotFoundPage = () => {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Page not found</h1>
      <p className={styles.text}>The page you are looking for doesn’t exist.</p>
      <Link className={styles.link} to="/">
        Go back to search
      </Link>
    </div>
  );
};

export default NotFoundPage;
