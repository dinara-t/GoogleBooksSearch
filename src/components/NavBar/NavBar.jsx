import { NavLink } from "react-router-dom";
import styles from "./NavBar.module.scss";

const NavBar = () => {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <span className={styles.dot} />
          <span className={styles.name}>GoogleBookFinder</span>
        </div>

        <nav className={styles.nav}>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? styles.active : styles.link
            }
          >
            Search
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? styles.active : styles.link
            }
          >
            About
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
