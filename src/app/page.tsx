import Link from "next/link";
import Image from "next/image";
import { getProjectImage, projects } from "@/lib/projects";
import { HeroVisual } from "@/components/hero-visual";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedProjects />
      <AboutTeaser />
    </>
  );
}

function Hero() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-container grid-cols-1 gap-12 px-6 py-20 md:grid-cols-2 md:items-center md:py-28">
        <div>
          <Link
            href="/a-propos#recherche-alternance"
            className="group inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-3 py-1.5 transition-colors hover:border-accent/60 hover:bg-accent-soft"
          >
            <span className="label-caps text-accent">
              Recherche d&apos;alternance · Septembre 2026
            </span>
            <span
              className="label-caps text-accent transition-transform group-hover:translate-x-0.5"
              aria-hidden
            >
              →
            </span>
          </Link>
          <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            Géomatique <span className="text-accent">+</span> dev web
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-text-muted">
            Étudiant en géomatique à Nancy, candidat L3 pro. Je conçois
            des chaînes complètes du relevé terrain à la publication
            web : acquisition LiDAR, analyse spatiale, applications
            cartographiques.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/projets"
              className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover"
            >
              Voir mes projets
              <span aria-hidden>→</span>
            </Link>
            <a
              href="/cv.pdf"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border-strong px-5 py-3 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent"
            >
              Télécharger mon CV
              <span aria-hidden>↗</span>
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-medium text-text-muted transition-colors hover:text-accent"
            >
              M&apos;écrire
            </Link>
          </div>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

function FeaturedProjects() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-container px-6 py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="label-caps text-accent">Projets sélectionnés</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Trois projets, une chaîne complète.
            </h2>
          </div>
          <Link
            href="/projets"
            className="hidden text-sm text-text-muted transition-colors hover:text-accent md:inline"
          >
            Tous les projets →
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>

        <div className="mt-8 md:hidden">
          <Link
            href="/projets"
            className="text-sm text-text-muted hover:text-accent"
          >
            Tous les projets →
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: (typeof projects)[number] }) {
  const image = getProjectImage(project.slug);
  return (
    <Link
      href={`/projets/${project.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface-elevated transition-all hover:border-border-strong hover:shadow-sm"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-surface-muted">
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
        <div className="absolute left-4 top-4">
          <span className="label-caps rounded-sm bg-surface-elevated/90 px-2 py-1 text-text-subtle backdrop-blur">
            {project.status}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <p className="label-caps text-text-subtle">{project.category}</p>
          <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">
            {project.title}
          </h3>
        </div>
        <p className="text-sm leading-relaxed text-text-muted">
          {project.summary}
        </p>
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-sm border border-border bg-surface-muted px-2 py-1 text-[11px] font-medium text-text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

function AboutTeaser() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-container grid-cols-1 gap-10 px-6 py-20 md:grid-cols-3">
        <div>
          <p className="label-caps text-accent">Profil</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight">
            À propos
          </h2>
        </div>
        <div className="md:col-span-2">
          <p className="text-lg leading-relaxed text-text-muted">
            Étudiant en géomatique passionné par la rencontre entre
            acquisition de données spatiales et développement web.
            Contributeur OpenStreetMap, je code en Python et TypeScript
            pour transformer la donnée brute en outils utilisables.
          </p>
          <Link
            href="/a-propos"
            className="mt-6 inline-flex items-center gap-2 text-sm text-accent hover:underline"
          >
            En savoir plus →
          </Link>
        </div>
      </div>
    </section>
  );
}

