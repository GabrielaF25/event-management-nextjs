import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/Login.module.css";
import { getSession } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession(); // "authenticated" | "unauthenticated" | "loading"

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Dacă ești deja logată, trimite direct la dashboard
  useEffect(() => {
    if (status === "authenticated") router.replace("/explore");
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      // callbackUrl: "/explore" // opțional
    });

    setLoading(false);

    if (res?.error) {
      setError("Email sau parolă greșite.");
      return;
    }

   const s = await getSession();
const role = (s?.user as any)?.role;

if (role === "organizer") router.push("/exploreOrganizator");
else router.push("/explore");

  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.logo}>EVENTLY</div>
        <h2 className={styles.title}>LOGIN</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <input
            type="password"
            placeholder="Parolă"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <button type="submit" disabled={loading}>
            {loading ? "Se conectează..." : "CONTINUĂ"}
          </button>
        </form>

        {error && <p className={styles.error}>{error}</p>}

        <p className={styles.footer}>
          Nu ai cont? <a href="/signup">Creează unul</a>
        </p>
      </div>
    </div>
  );
}
