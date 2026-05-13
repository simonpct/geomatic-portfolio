import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProject, getProjectImage, projects } from "@/lib/projects";
import { Pipeline } from "@/components/pipeline";
import { MicroMappingMap } from "@/components/micromapping-map-lazy";

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

  return (
    <article>
      <BackLink />
      <Header project={project} />
      <HeroVisual slug={slug} title={project.title} />
      <Context project={project} index={idx} />
      <PipelineSection project={project} />
      <Sections project={project} />
      <LiveDemos project={project} slug={slug} />
      <Stack project={project} />
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

function Header({ project }: { project: ReturnType<typeof getProject> & {} }) {
  return (
    <header className="mx-auto max-w-container px-6 pt-8 pb-12">
      <p className="label-caps text-accent">{project.category}</p>
      <h1 className="mt-4 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
        {project.title}
      </h1>
      <p className="mt-2 text-text-subtle">
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
  return (
    <div className="border-t border-border">
      {project.sections.map((s) => (
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
              <SectionVisualPlaceholder />
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

function SectionVisualPlaceholder() {
  return (
    <div className="relative mt-8 aspect-video overflow-hidden rounded border border-border bg-surface-muted">
      <div className="tech-grid absolute inset-0" />
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="label-caps text-text-subtle">Visuel à intégrer</p>
      </div>
    </div>
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
}: {
  project: ReturnType<typeof getProject> & {};
}) {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-container px-6 py-16 md:py-20">
        <p className="label-caps text-accent">Stack</p>
        <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight md:text-3xl">
          Outils mobilisés
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-3">
          {project.stack.map((group) => (
            <div key={group.label}>
              <p className="label-caps text-text-subtle">{group.label}</p>
              <ul className="mt-4 flex flex-col gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="font-display text-sm text-text"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
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
