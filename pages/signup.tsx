import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/Signup.module.css";

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "attendee", // default
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e: any) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // IMPORTANT: folosește ruta ta reală:
      // dacă fișierul e pages/api/auth/signup.ts -> endpoint = "/api/auth/signup"
      // dacă e pages/api/signup.ts -> endpoint = "/api/signup"
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || data.ok === false) {
        setError(data?.message || "Signup failed");
        return;
      }

      // la succes -> mergi la login
      router.push("/login");
    } catch (err: any) {
      setError(err?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.logo}>EVENTLY</div>
        <h2 className={styles.title}>SIGN UP</h2>

        <form onSubmit={onSubmit} className={styles.form}>
          <input
            name="name"
            placeholder="Nume complet"
            value={form.name}
            onChange={onChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={onChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Parolă (min 6 caractere)"
            value={form.password}
            onChange={onChange}
            required
          />

          <select name="role" value={form.role} onChange={onChange}>
            <option value="attendee">Participant</option>
            <option value="organizer">Organizer</option>
          </select>

          <button type="submit" disabled={loading}>
            {loading ? "Se creează..." : "CREEAZĂ CONT"}
          </button>
        </form>

        {error && <p className={styles.error}>{error}</p>}

        <p className={styles.footer}>
          Ai deja cont? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}
