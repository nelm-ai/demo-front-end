import React from "react";
import styles from "../styles/Home.module.css";
import TryFree from "./try-free";

const Home: React.FC = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <nav>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScDUUi878bC2WxMHkMmNm5_T-CZNuHK1zQeYoihjYlIlQhnBg/viewform?usp=sf_link"
            className={styles.subscribeBtn}
            target="_blank"
            rel="noopener noreferrer"
          >
            Subscribe to NELM Mailing List
          </a>
        </nav>
      </header>
      <main className={styles.main}>
        <h1 className={styles.title}>NELM</h1>
        <p className={styles.tagline}>Bring Dark Compute to Light</p>
        <a href="/try-free" className={styles.tryFreeBtn}>
          Try for Free
        </a>
      </main>
    </div>
  );
};

export default Home;
