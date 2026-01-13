import { useRouter } from "next/router";
import styles from "../styles/Landing.module.css";

export default function Landing() {
  const router = useRouter();

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.logo}>EVENTLY</div>

        <h1 className={styles.title}>IAȘIUL TE AȘTEAPTĂ!</h1>

        <p className={styles.subtitle}>
          Fii parte din pulsul orașului. Descoperă, participă și creează amintiri memorabile.
        </p>

        <button className={styles.button} onClick={() => router.push("/signup")}>
          ÎNCEPE ACUM
        </button>
      </div>
    </div>
  );
}
