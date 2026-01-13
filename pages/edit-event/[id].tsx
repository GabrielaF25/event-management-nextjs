import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "/styles/AddEvent.module.css";

export default function EditEvent() {
  const router = useRouter();
  const { id } = router.query;

  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/events/${id}`)
      .then((r) => r.json())
      .then((d) => setForm(d.event));
  }, [id]);

  if (!form) return null;

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const res = await fetch(`/api/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      alert("Eroare la salvare");
      return;
    }

    router.push("/exploreOrganizator");
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Editează eveniment</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input className={styles.input} name="title" value={form.title} onChange={handleChange} />
          <textarea className={styles.textarea} name="description" value={form.description} onChange={handleChange} />
          <input className={styles.input} type="date" name="date" value={form.date?.slice(0,10)} onChange={handleChange} />
          <input className={styles.input} name="location" value={form.location} onChange={handleChange} />
          <input className={styles.input} name="category" value={form.category} onChange={handleChange} />
          <input className={styles.input} type="number" name="price" value={form.price} onChange={handleChange} />
          <input className={styles.input} type="number" name="capacity" value={form.capacity} onChange={handleChange} />

          <button className={styles.btnPrimary}>SALVEAZĂ</button>
        </form>
      </div>
    </div>
  );
}
