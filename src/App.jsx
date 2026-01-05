import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar/NavBar.jsx";
import HomePage from "./pages/HomePage/HomePage.jsx";
import AboutPage from "./pages/AboutPage/AboutPage.jsx";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage.jsx";
import styles from "./App.module.scss";

const App = () => {
  return (
    <div className={styles.app}>
      <NavBar />
      <main className={`container ${styles.main}`}>
        <Routes>
          <Route path="/GoogleBooksSearch" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
