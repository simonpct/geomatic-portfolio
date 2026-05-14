import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Database,
  Cpu,
  Globe,
  Wrench,
  Layers,
  type LucideIcon,
} from "lucide-react";
import {
  getProject,
  getProjectAccent,
  getProjectImage,
  getStatusVisual,
  projects,
} from "@/lib/projects";
import { Pipeline } from "@/components/pipeline";
import { MicroMappingMap } from "@/components/micromapping-map-lazy";
import { AccessibiliteStanMap } from "@/components/accessibilite-stan-map-lazy";
import stanStats from "../../../../public/data/stan/stats.json";

function getStackIcon(label: string): LucideIcon {
  const l = label.toLowerCase();
  if (l.includes("don")) return Database;
  if (l.includes("acquis") || l.includes("hardware") || l.includes("terrain"))
    return Wrench;
  if (l.includes("trait") || l.includes("pipeline") || l.includes("bureau"))
    return Cpu;
  if (l.includes("publi") || l.includes("web")) return Globe;
  return Layers;
}

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: `${project.title} — Simon Picot`,
    description: project.summary,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const idx = projects.findIndex((p) => p.slug === slug);
  const prev = idx > 0 ? projects[idx - 1] : null;
  const next = idx < projects.length - 1 ? projects[idx + 1] : null;

  const accent = getProjectAccent(slug);

  return (
    <article>
      <BackLink />
      <Header project={project} accent={accent} />
      <HeroVisual slug={slug} title={project.title} />
      <Context project={project} index={idx} />
      <PipelineSection project={project} />
      <Sections project={project} />
      <IndoorMap slug={slug} />
      <LiveDemos project={project} slug={slug} />
      <Stack project={project} accent={accent} />
      <Pagination prev={prev} next={next} />
    </article>
  );
}

function BackLink() {
  return (
    <div className="mx-auto max-w-container px-6 pt-10">
      <Link
        href="/projets"
        className="label-caps text-text-subtle transition-colors hover:text-accent"
      >
        ← Tous les projets
      </Link>
    </div>
  );
}

function Header({
  project,
  accent,
}: {
  project: ReturnType<typeof getProject> & {};
  accent: string;
}) {
  const status = getStatusVisual(project.status);
  return (
    <header className="mx-auto max-w-container px-6 pt-8 pb-12">
      <div className="flex flex-wrap items-center gap-3">
        <p className="label-caps" style={{ color: accent }}>
          {project.category}
        </p>
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5"
          style={{
            color: status.text,
            backgroundColor: status.bg,
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
      <h1 className="mt-4 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
        {project.title}
      </h1>
      <span
        className="mt-4 block h-0.75 w-16 rounded-full"
        style={{ backgroundColor: accent }}
        aria-hidden
      />
      <p className="mt-4 text-text-subtle">
        {project.location} · {project.year}
      </p>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-muted">
        {project.summary}
      </p>
      <div className="mt-8 grid grid-cols-1 gap-6 border-t border-border pt-6 sm:grid-cols-2">
        <div>
          <p className="label-caps text-text-subtle">Rôle</p>
          <p className="mt-2 text-sm text-text">{project.meta.role}</p>
        </div>
        <div>
          <p className="label-caps text-text-subtle">Statut</p>
          <p className="mt-2 text-sm text-text">{project.meta.statusLabel}</p>
        </div>
      </div>
    </header>
  );
}

function HeroVisual({ slug, title }: { slug: string; title: string }) {
  const image = getProjectImage(slug);

  // Pour le projet micromapping, le hero EST la démo interactive
  if (slug === "micromapping-osm") {
    return (
      <div className="mx-auto max-w-container px-6">
        <MicroMappingMap />
        <p className="mt-3 text-sm text-text-subtle">
          Glissez le curseur pour comparer l&apos;orthophoto Grand Nancy 2024
          (5 cm) au rendu OSM custom à partir des contributions micromapping.
        </p>
      </div>
    );
  }

  if (slug === "accessibilite-stan") {
    return (
      <div className="mx-auto max-w-container px-6">
        <StanStatsBanner />
        <div className="mt-6">
          <AccessibiliteStanMap />
        </div>
        <p className="mt-3 text-sm text-text-subtle">
          Basculez entre les seuils 5 / 10 / 15 min pour voir l&apos;emprise de
          la couverture. Cliquez sur un arrêt pour son nom. La couleur des
          carreaux INSEE indique le niveau de couverture du carreau de
          population (200 m).
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-container px-6">
      <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-surface-elevated">
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1200px) 1200px, 100vw"
            className="object-cover"
            priority
          />
        ) : (
          <>
            <div className="tech-grid absolute inset-0" />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="label-caps text-text-subtle">
                Visuel principal — {title}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Context({
  project,
}: {
  project: ReturnType<typeof getProject> & {};
  index: number;
}) {
  return (
    <section className="mx-auto max-w-container px-6 py-16 md:py-20">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
        <div className="md:col-span-3">
          <p className="label-caps text-text-subtle">01 · Contexte</p>
        </div>
        <div className="md:col-span-9">
          <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Pourquoi ce projet
          </h2>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-text-muted">
            {project.context}
          </p>
        </div>
      </div>
    </section>
  );
}

function PipelineSection({
  project,
}: {
  project: ReturnType<typeof getProject> & {};
}) {
  if (!project.pipeline || project.pipeline.length === 0) return null;
  return (
    <section className="border-t border-border bg-surface-elevated">
      <div className="mx-auto max-w-container px-6 py-16 md:py-20">
        <p className="label-caps text-accent">Pipeline</p>
        <h2 className="mt-4 max-w-2xl font-display text-2xl font-semibold tracking-tight md:text-3xl">
          De l&apos;atelier au web, en quatre étapes.
        </h2>
        <div className="mt-12">
          <Pipeline steps={project.pipeline} />
        </div>
      </div>
    </section>
  );
}

function Sections({
  project,
}: {
  project: ReturnType<typeof getProject> & {};
}) {
  const coverImage = getProjectImage(project.slug);
  return (
    <div className="border-t border-border">
      {project.sections.map((s) => {
        const showCover =
          project.slug === "micromapping-osm" &&
          s.title === "Sources et collecte" &&
          coverImage;
        return (
          <section
            key={s.number}
            className="border-b border-border last:border-b-0"
          >
            <div className="mx-auto grid max-w-container grid-cols-1 gap-10 px-6 py-16 md:grid-cols-12 md:py-20">
              <div className="md:col-span-3">
                <p className="label-caps text-text-subtle">
                  {s.number} · {s.title}
                </p>
              </div>
              <div className="md:col-span-9">
                <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
                  {s.title}
                </h2>
                <p className="mt-4 max-w-3xl text-lg leading-relaxed text-text-muted">
                  {s.body}
                </p>
                {showCover ? (
                  <SectionImage
                    src={coverImage.src}
                    alt={coverImage.alt}
                  />
                ) : null}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function SectionImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative mt-8 aspect-video overflow-hidden rounded border border-border bg-surface-muted">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 800px, 100vw"
        className="object-cover"
      />
    </div>
  );
}

function IndoorMap({ slug }: { slug: string }) {
  if (slug !== "micromapping-osm") return null;
  return (
    <section className="border-t border-border bg-surface-elevated">
      <div className="mx-auto max-w-container px-6 py-16 md:py-20">
        <p className="label-caps text-accent">Indoor</p>
        <h2 className="mt-4 max-w-2xl font-display text-2xl font-semibold tracking-tight md:text-3xl">
          Cartographie multi-niveaux — Centre commercial Saint-Sébastien
        </h2>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-text-muted">
          Au-delà du carrefour, j&apos;ai étendu la démarche micromapping
          à l&apos;intérieur d&apos;un bâtiment : relevé des
          niveaux, boutiques, circulations verticales et équipements du
          centre commercial Saint-Sébastien à Nancy. Le rendu ci-dessous
          utilise le style indoor d&apos;
          <a
            href="https://indoorequal.org/"
            target="_blank"
            rel="noreferrer"
            className="text-accent underline-offset-2 hover:underline"
          >
            indoorequal
          </a>
          {" "}sur les contributions OSM. Utilisez le sélecteur de niveau à
          droite de la carte pour basculer entre les étages.
        </p>
        <div className="mt-10 overflow-hidden rounded-lg border border-border bg-surface">
          <div className="relative aspect-4/3 md:aspect-video">
            <iframe
              src="https://indoorequal.org/#map=17.54/48.68821/6.180976"
              title="Cartographie indoor du centre commercial Saint-Sébastien, Nancy — indoorequal.org"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>
        <p className="mt-3 text-sm text-text-subtle">
          Source des données :{" "}
          <a
            href="https://osmcha.org/changesets/174469017?filters=%7B%22uids%22%3A%5B%7B%22label%22%3A%2212876655%22%2C%22value%22%3A%2212876655%22%7D%5D%2C%22date__gte%22%3A%5B%7B%22label%22%3A%22%22%2C%22value%22%3A%22%22%7D%5D%7D"
            target="_blank"
            rel="noreferrer"
            className="text-accent underline-offset-2 hover:underline"
          >
            contributions OpenStreetMap personnelles
          </a>
          {" "}· Rendu : indoorequal.org
        </p>
      </div>
    </section>
  );
}

function LiveDemos({
  project,
  slug,
}: {
  project: ReturnType<typeof getProject> & {};
  slug: string;
}) {
  // Pour le micromapping, la démo interactive est déjà dans le hero principal —
  // pas besoin d'un deuxième bloc Livrables.
  if (slug === "micromapping-osm") return null;

  // Pour accessibilite-stan, la carte est dans le hero — on remplace le bloc
  // Livrables par un simple lien GitHub.
  if (slug === "accessibilite-stan") {
    return (
      <section className="border-t border-border bg-surface-elevated">
        <div className="mx-auto max-w-container px-6 py-16 md:py-20">
          <p className="label-caps text-accent">Code source</p>
          <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Pipeline reproductible
          </h2>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-text-muted">
            Le repo public contient les trois scripts qui régénèrent
            l&apos;analyse depuis zéro : download des sources, calcul des
            isochrones r5py, agrégation INSEE et publication des GeoJSON
            servis par cette page. Reproductible en quelques minutes via
            <code className="mx-1 rounded bg-surface-muted px-1.5 py-0.5 text-sm">
              uv sync
            </code>
            .
          </p>
          <a
            href="https://github.com/simonpct/accessibilite-stan"
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3 font-medium text-white transition-opacity hover:opacity-90"
          >
            Code source sur GitHub →
          </a>
        </div>
      </section>
    );
  }

  if (!project.liveDemo || project.liveDemo.length === 0) return null;
  return (
    <section className="border-t border-border bg-surface-elevated">
      <div className="mx-auto max-w-container px-6 py-16 md:py-20">
        <p className="label-caps text-accent">Livrables</p>
        <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight md:text-3xl">
          Explorer en direct
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {project.liveDemo.map((demo) => (
            <div
              key={demo.label}
              className="flex flex-col rounded-lg border border-border bg-surface p-6"
            >
              <p className="label-caps text-text-subtle">À venir</p>
              <h3 className="mt-3 font-display text-xl font-semibold tracking-tight">
                {demo.label}
              </h3>
              <p className="mt-2 text-sm text-text-muted">
                {demo.description}
              </p>
              <div className="mt-6 aspect-video rounded border border-border bg-surface-muted">
                <div className="tech-grid h-full w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stack({
  project,
  accent,
}: {
  project: ReturnType<typeof getProject> & {};
  accent: string;
}) {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-container px-6 py-16 md:py-20">
        <p className="label-caps" style={{ color: accent }}>
          Stack
        </p>
        <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight md:text-3xl">
          Outils mobilisés
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {project.stack.map((group) => {
            const Icon = getStackIcon(group.label);
            return (
              <div
                key={group.label}
                className="flex flex-col rounded-lg border border-border bg-surface-elevated p-6 transition-colors hover:border-border-strong"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md"
                    style={{
                      backgroundColor: `${accent}1a`,
                      color: accent,
                    }}
                  >
                    <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                  </span>
                  <p className="label-caps text-text-subtle">{group.label}</p>
                </div>
                <ul className="mt-5 flex flex-col gap-2">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 font-display text-sm text-text"
                    >
                      <span
                        className="h-1 w-1 rounded-full"
                        style={{ backgroundColor: accent }}
                        aria-hidden
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Pagination({
  prev,
  next,
}: {
  prev: (typeof projects)[number] | null;
  next: (typeof projects)[number] | null;
}) {
  return (
    <nav className="border-t border-border">
      <div className="mx-auto grid max-w-container grid-cols-1 gap-6 px-6 py-12 md:grid-cols-2">
        {prev ? (
          <Link
            href={`/projets/${prev.slug}`}
            className="group rounded-lg border border-border bg-surface-elevated p-6 transition-all hover:border-border-strong"
          >
            <p className="label-caps text-text-subtle">← Projet précédent</p>
            <p className="mt-2 font-display text-lg font-semibold text-text group-hover:text-accent">
              {prev.title}
            </p>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={`/projets/${next.slug}`}
            className="group rounded-lg border border-border bg-surface-elevated p-6 text-right transition-all hover:border-border-strong"
          >
            <p className="label-caps text-text-subtle">Projet suivant →</p>
            <p className="mt-2 font-display text-lg font-semibold text-text group-hover:text-accent">
              {next.title}
            </p>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </nav>
  );
}

function StanStatsBanner() {
  const stats = stanStats as {
    global: {
      population_totale: number;
      seuils: Record<
        string,
        { population_couverte: number; pourcentage: number }
      >;
    };
  };
  const items = [
    { t: 5, label: "à ≤ 5 min" },
    { t: 10, label: "à ≤ 10 min" },
    { t: 15, label: "à ≤ 15 min" },
  ] as const;
  const pop = stats.global.population_totale;
  return (
    <div className="rounded-lg border border-border bg-surface-elevated p-6">
      <p className="label-caps text-text-subtle">Résultats</p>
      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
        {items.map(({ t, label }) => {
          const s = stats.global.seuils[String(t)];
          return (
            <div key={t}>
              <p className="font-display text-4xl font-bold tracking-tight text-text md:text-5xl">
                {s.pourcentage.toFixed(1)}{" "}
                <span className="text-2xl text-text-muted">%</span>
              </p>
              <p className="mt-2 text-sm text-text-muted">
                de la population {label}
              </p>
              <p className="mt-1 text-xs text-text-subtle">
                {Math.round(s.population_couverte).toLocaleString("fr-FR")} hab.
              </p>
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-xs text-text-subtle">
        Sur {Math.round(pop).toLocaleString("fr-FR")} habitants recensés au
        carroyage INSEE Filosofi 2017 dans les 20 communes du Grand Nancy.
      </p>
    </div>
  );
}
