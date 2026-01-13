import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/AddEvent.module.css";


export default function AddEvent() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    category: "",
    price: 0,
    capacity: 0,
    imageUrl: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.message || "Eroare");
      return;
    }

    router.push("/exploreOrganizator");
  };

return (
  <div className={styles.wrapper}>
    <div className={styles.card}>
      <h1 className={styles.title}>Adaugă eveniment</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          className={styles.input}
          name="title"
          placeholder="Titlu"
          value={form.title}
          onChange={handleChange}
          required
        />

        <textarea
          className={styles.textarea}
          name="description"
          placeholder="Descriere"
          value={form.description}
          onChange={handleChange}
          required
        />

        <div className={styles.grid2}>
          <input
            className={styles.input}
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />

          <input
            className={styles.input}
            name="location"
            placeholder="Locație"
            value={form.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.grid2}>
          <input
            className={styles.input}
            name="category"
            placeholder="Categorie (ex: Nightlife)"
            value={form.category}
            onChange={handleChange}
          />

          <input
            className={styles.input}
            type="number"
            name="price"
            placeholder="Preț (RON)"
            value={form.price as any}
            onChange={handleChange}
          />
        </div>

        <div className={styles.grid2}>
          <input
            className={styles.input}
            type="number"
            name="capacity"
            placeholder="Capacitate"
            value={form.capacity as any}
            onChange={handleChange}
          />

          <input
            className={styles.input}
            name="imageUrl"
            placeholder="Image URL"
            value={form.imageUrl}
            onChange={handleChange}
          />
        </div>

        <div className={styles.actions}>
          <button className={styles.btnPrimary} type="submit">
            SALVEAZĂ
          </button>

          <button
            className={styles.btnGhost}
            type="button"
            onClick={() => router.push("/exploreOrganizator")}
          >
            ÎNAPOI
          </button>
        </div>
      </form>
    </div>
  </div>
);

}
