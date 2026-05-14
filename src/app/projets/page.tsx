import Link from "next/link";
import Image from "next/image";
import {
  getProjectAccent,
  getProjectImage,
  getStatusVisual,
  projects,
} from "@/lib/projects";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projets — Simon Picot",
  description:
    "Trois projets en géomatique appliquée : acquisition LiDAR, analyse spatiale et croisement de données ouvertes.",
};

export default function ProjectsPage() {
  return (
    <section className="mx-auto max-w-container px-6 py-20 md:py-24">
      <header className="max-w-3xl">
        <p className="label-caps text-accent">Projets</p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Trois projets, une chaîne complète.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-text-muted">
          De l&apos;acquisition terrain à la publication web, chaque projet
          explore un maillon différent de la chaîne géomatique : relevé 3D
          patrimonial, analyse de mobilité, croisement de données
          réglementaires.
        </p>
      </header>

      <div className="mt-16 flex flex-col gap-6">
        {projects.map((p, i) => {
          const image = getProjectImage(p.slug);
          const accent = getProjectAccent(p.slug);
          const status = getStatusVisual(p.status);
          return (
          <Link
            key={p.slug}
            href={`/projets/${p.slug}`}
            className="group relative grid grid-cols-1 gap-6 overflow-hidden rounded-lg border border-border bg-surface-elevated p-6 transition-all hover:border-border-strong hover:shadow-sm md:grid-cols-12 md:p-8"
          >
            <span
              className="absolute left-0 top-0 h-full w-1 origin-top scale-y-0 transition-transform duration-300 group-hover:scale-y-100"
              style={{ backgroundColor: accent }}
              aria-hidden
            />
            <div className="md:col-span-4">
              <div className="relative aspect-4/3 overflow-hidden rounded border border-border bg-surface-muted">
                {image ? (
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="tech-grid absolute inset-0" />
                )}
                <div className="absolute left-3 top-3">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 backdrop-blur"
                    style={{
                      color: status.text,
                      backgroundColor: `${status.bg}e6`,
                      borderColor: status.border,
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: status.dot }}
                      aria-hidden
                    />
                    <span className="label-caps">{status.label}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between md:col-span-8">
              <div>
                <div className="flex items-center gap-3">
                  <span className="label-caps text-text-subtle">
                    0{i + 1}
                  </span>
                  <span className="label-caps" style={{ color: accent }}>
                    {p.category}
                  </span>
                </div>
                <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight md:text-3xl">
                  {p.title}
                </h2>
                <p className="mt-1 text-sm text-text-subtle">
                  {p.location} · {p.year}
                </p>
                <p className="mt-4 text-base leading-relaxed text-text-muted">
                  {p.summary}
                </p>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-sm border border-border bg-surface-muted px-2 py-1 text-[11px] font-medium text-text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span
                  className="text-sm transition-transform group-hover:translate-x-1"
                  style={{ color: accent }}
                >
                  Voir le projet →
                </span>
              </div>
            </div>
          </Link>
          );
        })}
      </div>
    </section>
  );
}
