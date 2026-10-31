// Pinned subject: "Verrucci Maison" storefront. Hero, reference picker, craft story, bag.
// Plan: display serif with statement scale, gold as the only accent, the 3D watch as the constant.
import { useEffect, useRef, useState } from "react";
import WatchScene from "./Watch3D.jsx";
import { watches } from "./data.js";

const display = { fontFamily: "var(--font-display)" };

function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        transition: `opacity 900ms ${delay}ms, transform 900ms ${delay}ms`,
        opacity: on ? 1 : 0,
        transform: on ? "none" : "translateY(32px)",
      }}
    >
      {children}
    </div>
  );
}

export default function App() {
  const [index, setIndex] = useState(0);
  const [bag, setBag] = useState([]);
  const [flash, setFlash] = useState("");
  const watch = watches[index];

  const addToBag = () => {
    setBag((b) => [...b, watch.id]);
    setFlash(`${watch.name} is in your bag.`);
    setTimeout(() => setFlash(""), 2400);
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <WatchScene config={watch} />

      <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-6 md:px-16">
        <a href="#top" className="text-xl tracking-[0.4em]" style={display}>
          VERRUCCI
        </a>
        <nav className="hidden items-center gap-10 text-xs uppercase tracking-[0.25em] muted md:flex">
          <a href="#collection" className="transition-colors hover:text-gold">References</a>
          <a href="#craft" className="transition-colors hover:text-gold">The making</a>
          <a href="#footer" className="transition-colors hover:text-gold">Atelier</a>
        </nav>
        <div className="text-xs uppercase tracking-[0.25em] text-gold">Bag ({bag.length})</div>
      </header>

      <main className="relative z-10" id="top">
        <section className="flex min-h-screen items-end px-6 pb-24 pt-40 md:px-16">
          <div className="max-w-2xl">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.35em] text-gold">Maison Verrucci · Est. 1891</p>
            </Reveal>
            <Reveal delay={120}>
              <h1 className="mt-6 leading-[0.88] text-[clamp(4.5rem,11vw,10.5rem)]" style={display}>
                Time, <em className="text-gold">held</em>
                <br />
                still.
              </h1>
            </Reveal>
            <Reveal delay={240}>
              <p className="mt-8 max-w-md text-lg leading-relaxed muted">
                Four references, hand-finished in our Geneva atelier and built to outlast whoever buys them.
              </p>
            </Reveal>
            <Reveal delay={360}>
              <div className="mt-10 flex flex-wrap gap-4">
                <a href="#collection" className="bg-primary px-7 py-3 text-xs uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-85">
                  View references
                </a>
                <a href="#craft" className="border border-rule px-7 py-3 text-xs uppercase tracking-[0.25em] transition-colors hover:border-gold hover:text-gold">
                  The making
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="collection" className="flex min-h-screen items-center px-6 py-32 md:px-16">
          <div className="w-full max-w-xl bg-background/70 p-8 backdrop-blur-sm md:p-10">
            <p className="text-xs uppercase tracking-[0.35em] text-gold">The references</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {watches.map((w, i) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`border px-4 py-2 text-xs uppercase tracking-[0.2em] transition-all duration-500 ${
                    i === index ? "border-gold text-gold" : "border-rule muted hover:text-foreground"
                  }`}
                >
                  {w.name}
                </button>
              ))}
            </div>

            <div key={watch.id} className="mt-10" style={{ animation: "fadeUp 700ms cubic-bezier(0.22,1,0.36,1)" }}>
              <h2 className="text-6xl leading-none md:text-7xl" style={display}>{watch.name}</h2>
              <p className="mt-4 text-base italic muted" style={display}>{watch.tagline}</p>
              <div className="mt-6 flex items-baseline justify-between gap-6 border-t border-rule pt-6">
                <span className="text-3xl" style={display}>{watch.price}</span>
                <span className="text-xs uppercase tracking-[0.25em] muted">Ref. {watch.ref}</span>
              </div>
              <dl className="mt-6 grid gap-4 text-sm">
                {watch.specs.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[110px_1fr] gap-4 border-b border-rule pb-3">
                    <dt className="text-xs uppercase tracking-[0.2em] muted">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-8 flex flex-wrap items-center gap-6">
                <button type="button" onClick={addToBag} className="bg-primary px-8 py-3 text-xs uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-85">
                  Add to bag
                </button>
                <span className="text-sm text-gold transition-opacity duration-500" style={{ opacity: flash ? 1 : 0 }}>
                  {flash || " "}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section id="craft" className="flex min-h-screen items-center px-6 py-32 md:px-16">
          <div className="w-full max-w-xl space-y-20">
            <Reveal>
              <h2 className="text-6xl leading-[0.95] md:text-7xl" style={display}>
                Made slowly, <em className="text-gold">on purpose</em>.
              </h2>
            </Reveal>
            {[
              ["Cut the plates", "Each bridge is cut from a single block of German-silver, then hand-chamfered until the light breaks clean."],
              ["Finish by hand", "Perlage, Côtes de Genève and polished screws, done by people who have done them ten thousand times."],
              ["Regulate for 120 days", "Every movement is timed in five positions before it leaves the atelier. Nothing ships until it is right."],
            ].map(([title, body], i) => (
              <Reveal key={title} delay={i * 120}>
                <div className="grid grid-cols-[auto_1fr] gap-8 border-t border-rule pt-8">
                  <span className="text-5xl text-gold" style={display}>{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-3xl" style={display}>{title}</h3>
                    <p className="mt-3 max-w-md leading-relaxed muted">{body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <footer id="footer" className="border-t border-rule px-6 py-16 md:px-16">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="text-3xl tracking-[0.4em]" style={display}>VERRUCCI</p>
              <p className="mt-3 text-sm muted">Maison Verrucci · Atelier, Genève</p>
            </div>
            <p className="text-xs uppercase tracking-[0.25em] muted">Time, held still.</p>
          </div>
        </footer>
      </main>

      <style>{`.muted { color: oklch(0.8 0.015 262); } @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  );
}
