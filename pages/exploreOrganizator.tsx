import { useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import styles from "../styles/Explore.module.css";
import { useRouter } from "next/router";

type EventT = {
  _id: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  endTime?: string;
  location?: string;
  category?: string;
  imageUrl?: string;
  isCanceled?: boolean;

  price?: number;
  capacity?: number;
  attendeesCount?: number;
  soldOut?: boolean;
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toISOString().slice(0, 10);
}

export default function ExplorePage() {
  const router = useRouter();

  const { data: session } = useSession();
  const name = (session?.user as any)?.name || "User";

  const [events, setEvents] = useState<EventT[]>([]);
  const [error, setError] = useState("");

  const [tab, setTab] = useState<
    "TOATE" | "IN_DERULARE" | "VIITOR" | "SOLD_OUT" | "ANULAT"
  >("TOATE");

  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [showFavOnly, setShowFavOnly] = useState(false);

  const [dateFilter, setDateFilter] = useState<"VIITOARE" | "TOATE">("VIITOARE");
  const [priceFilter, setPriceFilter] = useState<
    "TOATE" | "0-50" | "50-200" | "200+"
  >("TOATE");
  const [categoryFilter, setCategoryFilter] = useState<string>("TOATE");

  useEffect(() => {
    (async () => {
      try {
        setError("");
        const res = await fetch("/api/events");
        const data = await res.json();

        if (!res.ok || data?.ok === false) {
          throw new Error(data?.message || "Failed to load events");
        }

        setEvents(data.events || []);
      } catch (e: any) {
        setError(e.message);
      }
    })();
  }, []);

  const toggleFav = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };
const isSoldOut = (ev: EventT) => {
  if (ev.isCanceled) return true;

  const cap = typeof ev.capacity === "number" ? ev.capacity : 0;
  const taken = typeof ev.attendeesCount === "number" ? ev.attendeesCount : 0;

  // dacă există capacity: sold out când taken >= cap
  if (cap > 0) return taken >= cap;

  // dacă capacity e 0 => consideră sold out (no seats)
  if (cap === 0) return true;

  // fallback
  return false;
};

const attendEvent = async (eventId: string) => {
  try {
    const res = await fetch(`/api/events/${eventId}/attend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok || data?.ok === false) {
      throw new Error(data?.message || "Nu s-a putut confirma participarea");
    }

    // update local: crește count pentru eventul respectiv (fără refetch)
    setEvents((prev) =>
      prev.map((e) =>
        e._id === eventId
          ? { ...e, attendeesCount: data.attendeesCount }
          : e
      )
    );
  } catch (e: any) {
    alert(e.message);
  }
};

  const favCount = useMemo(
    () => Object.values(favorites).filter(Boolean).length,
    [favorites]
  );

  const filtered = useMemo(() => {
    const now = new Date();
    let list = [...events];

    // ---------- TAB FILTERS ----------
    if (tab === "ANULAT") {
      list = list.filter((e) => e.isCanceled);
    } else if (tab === "VIITOR") {
      list = list.filter(
        (e) => e.date && new Date(e.date) > now && !e.isCanceled
      );
    } else if (tab === "IN_DERULARE") {
      // "în derulare" = azi (fallback dacă nu ai interval start-end)
      list = list.filter((e) => {
        if (!e.date || e.isCanceled) return false;
        const d = new Date(e.date);
        const sameDay =
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth() &&
          d.getDate() === now.getDate();
        return sameDay;
      });
    } else if (tab === "SOLD_OUT") {
        list = list.filter((e) => {
    if (e.isCanceled) return false;

    // dacă ai flag explicit
    if (e.soldOut === true) return true;

    // dacă ai capacitate (0 => sold out)
    if (typeof e.capacity === "number") {
      // fără attendeesCount: capacity 0 => sold out
      if (e.capacity === 0) return true;

      // cu attendeesCount: sold out când sunt pline
      if (typeof e.attendeesCount === "number") {
        return e.attendeesCount >= e.capacity;
      }
    }

    return false;
  });
    } else {
      // TOATE
      list = list.filter((e) => !e.isCanceled);
    }

    // ---------- DATE DROPDOWN ----------
    if (dateFilter === "VIITOARE") {
      list = list.filter((e) => e.date && new Date(e.date) >= now);
    }

    // ---------- PRICE DROPDOWN ----------
    if (priceFilter !== "TOATE") {
      list = list
        .filter((e) => typeof e.price === "number")
        .filter((e) => {
          const p = e.price as number;
          if (priceFilter === "0-50") return p >= 0 && p <= 50;
          if (priceFilter === "50-200") return p > 50 && p <= 200;
          if (priceFilter === "200+") return p > 200;
          return true;
        });
    }

    // ---------- CATEGORY DROPDOWN ----------
    if (categoryFilter !== "TOATE") {
      list = list.filter(
        (e) =>
          (e.category || "").toLowerCase() ===
          categoryFilter.toLowerCase()
      );
    }

    // ---------- FAVORITES ONLY ----------
    if (showFavOnly) {
      list = list.filter((e) => favorites[e._id]);
    }

    return list;
  }, [events, tab, dateFilter, priceFilter, categoryFilter, showFavOnly, favorites]);

const handleDelete = async (id: string) => {
  if (!confirm("Sigur vrei să ștergi evenimentul?")) return;

  const res = await fetch(`/api/events/${id}`, {
    method: "DELETE",
  });

  const data = await res.json();
  if (!res.ok) {
    alert(data.message || "Eroare la ștergere");
    return;
  }

  setEvents((prev) => prev.filter((e) => e._id !== id));
};

  return (
    <div className={styles.page}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>EVENTLY</div>

        <button className={styles.navButton}>🧭 EXPLOREAZĂ</button>

        <button
  className={styles.navItemButton}
  onClick={() => router.push("/add-event")}
>
  ➕ ADAUGĂ EVENIMENT
</button>




        <button
          className={styles.logout}
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          LOGOUT
        </button>
      </aside>

      {/* MAIN */}
      <main className={styles.main}>
        {/* HEADER */}
        <section className={styles.header}>
          <h1 className={styles.hi}>
            SALUT, <span>{String(name).toUpperCase()}</span>
          </h1>
          <p className={styles.sub}>DESCOPERĂ SUFLETUL ORAȘULUI TĂU!</p>

          <div className={styles.filters}>
            <select
              className={styles.select}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
            >
              <option value="VIITOARE">VIITOARE</option>
              <option value="TOATE">TOATE</option>
            </select>

            <select
              className={styles.select}
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value as any)}
            >
              <option value="TOATE">PREȚ</option>
              <option value="0-50">0 - 50</option>
              <option value="50-200">50 - 200</option>
              <option value="200+">200+</option>
            </select>

            <select
              className={styles.select}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="TOATE">CATEGORII</option>
              <option value="Nightlife">Nightlife</option>
              <option value="Culturale">Culturale</option>
              <option value="Teatru & Filme">Teatru & Filme</option>
            </select>
          </div>
        </section>

        {/* SECTION */}
        <section className={styles.section}>
          <div className={styles.sectionTitleRow}>
            <h2 className={styles.sectionTitle}>PULSUL IAȘIULUI</h2>

            <div className={styles.tabs}>
              {(["TOATE", "IN_DERULARE", "VIITOR", "SOLD_OUT", "ANULAT"] as const).map((t) => (
                <button
                  key={t}
                  className={`${styles.tab} ${tab === t ? styles.tabActive : ""}`}
                  onClick={() => setTab(t)}
                >
                  {t === "IN_DERULARE" ? "IN DERULARE" : t}
                </button>
              ))}
            </div>
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <div className={styles.grid}>
            {filtered.map((ev) => (
              <div key={ev._id} className={styles.card}>
                <div className={styles.imgWrap}>
                  <img
                    className={styles.img}
                    src={ev.imageUrl || "/placeholder.jpg"}
                    alt={ev.title}
                  />

                  <div className={styles.pill}>
                    {ev.isCanceled ? "ANULAT" : "VIITOR"}
                  </div>

                  <div
                    className={`${styles.fav} ${
                      favorites[ev._id] ? styles.favActive : ""
                    }`}
                    onClick={() => toggleFav(ev._id)}
                    title="Favorite"
                  >
                    {favorites[ev._id] ? "♥" : "♡"}
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.metaRow}>
                    <div>{(ev.category || "CATEGORIE").toUpperCase()}</div>
                    <div>📅 {formatDate(ev.date)}</div>
                  </div>

                  <h3 className={styles.title}>{ev.title}</h3>
<p className={styles.desc}>
  {ev.description ? `"${ev.description}"` : `"Vibe electric."`}
</p>

<div className={styles.bottomRow}>
  <div className={styles.price}>
    {typeof ev.price === "number" ? `${ev.price} RON` : "FREE"}
  </div>

 <div style={{ display: "flex", gap: 10 }}>
  <button
    className={styles.editBtn}
    onClick={() => router.push(`/edit-event/${ev._id}`)}
  >
    ✏️ EDIT
  </button>

  <button
    className={styles.deleteBtn}
    onClick={() => handleDelete(ev._id)}
  >
    🗑 DELETE
  </button>
</div>

</div>

{typeof ev.capacity === "number" && (
  <div className={styles.seats}>
    {(() => {
      const taken = typeof ev.attendeesCount === "number" ? ev.attendeesCount : 0;
      const cap = ev.capacity;
      const remaining = Math.max(0, cap - taken);
      return <>Locuri: {remaining}/{cap}</>;
    })()}
  </div>
)}


                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
