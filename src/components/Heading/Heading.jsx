import styles from "./Heading.module.scss";

const Heading = ({ title, subtitle }) => {
  return (
    <section className={styles.wrap}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>{subtitle}</p>
    </section>
  );
};

export default Heading;
