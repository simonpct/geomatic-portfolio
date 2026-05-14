import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "À propos — Simon Picot",
  description:
    "Étudiant en géomatique à Nancy, candidat L3 pro. Mon parcours, ma vision du métier, et ce que je cherche en alternance.",
};

export default function AboutPage() {
  return (
    <article>
      <Header />
      <Sections />
      <CVBlock />
      <Looking />
    </article>
  );
}

function CVBlock() {
  return (
    <section className="border-b border-border bg-surface-elevated">
      <div className="mx-auto grid max-w-container grid-cols-1 gap-12 px-6 py-16 md:grid-cols-12 md:items-center md:py-20">
        <div className="md:col-span-3">
          <p className="label-caps text-text-subtle">03 · CV</p>
        </div>
        <div className="md:col-span-5">
          <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Mon CV en un coup d&apos;œil.
          </h2>
          <p className="mt-4 max-w-xl text-text-muted">
            Parcours, alternances, projets et stack technique sur une page,
            mise à jour pour la candidature L3 SIG. Disponible en PDF.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/cv.pdf"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover"
            >
              Télécharger le CV
              <span aria-hidden>↗</span>
            </a>
            <a
              href="/cv.pdf"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border-strong px-5 py-3 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent"
            >
              Ouvrir l&apos;aperçu
            </a>
          </div>
        </div>
        <div className="md:col-span-4">
          <a
            href="/cv.pdf"
            target="_blank"
            rel="noreferrer"
            className="group block"
            aria-label="Ouvrir le CV en PDF"
          >
            <div className="relative aspect-[1/1.414] overflow-hidden rounded-md border border-border bg-surface shadow-sm transition-all group-hover:border-border-strong group-hover:shadow-md">
              <Image
                src="/cv-preview.jpg"
                alt="Aperçu du CV de Simon Picot — page 1"
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover object-top"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-surface-elevated/95 px-3 py-2 backdrop-blur">
                <span className="label-caps text-text-subtle">CV.pdf</span>
                <span
                  className="label-caps text-accent transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                >
                  Ouvrir ↗
                </span>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

function Header() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto grid max-w-container grid-cols-1 gap-12 px-6 py-20 md:grid-cols-12 md:items-center md:py-24">
        <div className="md:col-span-8">
          <p className="label-caps text-accent">À propos</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
            Étudiant en géomatique, je code pour rendre la donnée
            spatiale utilisable.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-muted">
            Simon Picot — Nancy. Candidat L3 pro, alternance recherchée
            pour septembre 2026.
          </p>
        </div>

        <div className="md:col-span-4">
          <Portrait />
        </div>
      </div>
    </header>
  );
}

function Portrait() {
  return (
    <div className="relative aspect-4/5 overflow-hidden rounded-lg border border-border bg-surface-elevated">
      <Image
        src="/portrait.webp"
        alt="Portrait de Simon Picot"
        fill
        sizes="(min-width: 768px) 33vw, 100vw"
        className="object-cover"
        priority
      />
    </div>
  );
}

function Sections() {
  return (
    <>
      <Parcours />

      <Section number="02" label="Démarche" title="Géomatique + dev web">
        <p>
          Mon angle, c&apos;est de couvrir la chaîne complète :{" "}
          <span className="text-text">acquisition</span> sur le terrain,{" "}
          <span className="text-text">traitement</span> des données, puis{" "}
          <span className="text-text">publication</span> dans une
          application web utilisable. La même personne tient la pelle, le
          code et l&apos;interface — ça évite les pertes en route entre
          les étapes.
        </p>
        <p>
          Côté terrain, je conçois aussi du matériel quand c&apos;est
          pertinent : pour le projet du Palais, j&apos;ai assemblé un rig
          LiDAR sur Raspberry Pi sous ROS 2.
        </p>
        <p>
          Côté outils, je travaille en Python (geopandas, rasterio, PDAL)
          pour l&apos;analyse spatiale, et en TypeScript (Next.js, React,
          MapLibre) pour la diffusion web.
        </p>
      </Section>

    </>
  );
}

import type { LogoProps } from "@/components/logo";

type TimelineItem = {
  period: string;
  title: string;
  meta?: string;
  body?: string;
  badge?: string;
  logos: LogoProps[];
};

const formation: TimelineItem[] = [
  {
    period: "sept. 2026 — juil. 2027",
    title:
      "Université de Lorraine · Licence Pro SIG — Cartographie, Topographie & SIG",
    meta: "En alternance · sous réserve d'admission",
    body: "Formation visée pour la rentrée 2026.",
    badge: "À venir",
    logos: [
      {
        src: "/logos/ul.png",
        alt: "Université de Lorraine",
        fallback: "UL",
      },
    ],
  },
  {
    period: "2024 — août 2026",
    title: "CESI · Bachelor Développement Web",
    meta: "En alternance",
    badge: "En cours",
    logos: [{ src: "/logos/cesi.png", alt: "CESI", fallback: "CE" }],
  },
  {
    period: "2021 — 2024",
    title: "Lycée Henri Loritz · Nancy",
    meta: "Baccalauréat général, dominante scientifique",
    body: "Mention assez bien.",
    logos: [{ src: "/logos/loritz.png", alt: "Lycée Loritz", fallback: "LO" }],
  },
];

const experience: TimelineItem[] = [
  {
    period: "sept. 2025 — auj.",
    title: "Skedl / Neodigit · Nancy",
    meta: "Développeur web — alternance",
    body: "Développement d'une plateforme de billetterie événementielle.",
    logos: [{ src: "/logos/skedl.png", alt: "Skedl", fallback: "SK" }],
  },
  {
    period: "juil. 2024 — juil. 2025",
    title: "TheGiftsClub · Paris",
    meta: "Développeur web — alternance",
    body: "React.js · AWS.",
    logos: [
      { src: "/logos/tgc.png", alt: "TheGiftsClub", fallback: "TG" },
    ],
  },
  {
    period: "juil. 2023",
    title: "Keolis Grand Nancy",
    meta: "Stage au Poste de Commandement Centralisé",
    body: "Découverte du SAE Ineo Systrans, exploitation du réseau de transport en commun.",
    logos: [{ src: "/logos/stan.png", alt: "STAN — Keolis Grand Nancy", fallback: "ST" }],
  },
];

function Parcours() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-container grid-cols-1 gap-10 px-6 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-3">
          <p className="label-caps text-text-subtle">01 · Parcours</p>
        </div>
        <div className="md:col-span-9 flex flex-col gap-12">
          <TimelineGroup label="Formation" items={formation} />
          <TimelineGroup label="Alternance & expérience pro" items={experience} />
          <CommunityBlock />
        </div>
      </div>
    </section>
  );
}

function TimelineGroup({
  label,
  items,
}: {
  label: string;
  items: TimelineItem[];
}) {
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
        {label}
      </h2>
      <ol className="mt-6 flex flex-col">
        {items.map((item, i) => (
          <li
            key={`${item.period}-${item.title}`}
            className={`relative grid grid-cols-1 gap-2 border-l border-border pl-6 pb-6 sm:grid-cols-12 sm:gap-6 ${
              i === items.length - 1 ? "pb-0" : ""
            }`}
          >
            <span
              className="absolute left-0 top-2 -translate-x-1/2 h-2 w-2 rounded-full bg-accent"
              aria-hidden
            />
            <div className="sm:col-span-3">
              <p className="label-caps text-text-subtle">{item.period}</p>
            </div>
            <div className="sm:col-span-9">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  {item.logos.map((logo) => (
                    <Logo key={logo.src} {...logo} />
                  ))}
                </div>
                <p className="font-display text-base font-semibold text-text">
                  {item.title}
                </p>
                {item.badge && (
                  <span className="label-caps rounded-full border border-accent/30 bg-accent-soft px-2 py-0.5 text-accent">
                    {item.badge}
                  </span>
                )}
              </div>
              {item.meta && (
                <p className="mt-1 text-sm text-text-muted">{item.meta}</p>
              )}
              {item.body && (
                <p className="mt-2 text-text-muted">{item.body}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function CommunityBlock() {
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
        Pratique communautaire
      </h2>
      <div className="mt-6 border-l border-border pl-6">
        <div className="flex flex-wrap items-center gap-3">
          <Logo
            src="/logos/osm.png"
            alt="OpenStreetMap"
            fallback="OS"
          />
          <p className="font-display text-base font-semibold text-text">
            Contributeur OpenStreetMap · secteur Nancy
          </p>
        </div>
        <p className="mt-2 text-text-muted">
          Bâti, voirie piétonne, adresses, points d&apos;intérêt. Une
          pratique qui m&apos;ancre dans la réalité du terrain et des
          données ouvertes.
        </p>
      </div>
    </div>
  );
}

function Section({
  number,
  label,
  title,
  children,
}: {
  number: string;
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-container grid-cols-1 gap-10 px-6 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-3">
          <p className="label-caps text-text-subtle">
            {number} · {label}
          </p>
        </div>
        <div className="md:col-span-9">
          <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            {title}
          </h2>
          <div className="mt-6 flex max-w-3xl flex-col gap-4 text-lg leading-relaxed text-text-muted">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function Looking() {
  return (
    <section id="recherche-alternance" className="scroll-mt-20">
      <div className="mx-auto max-w-container px-6 py-20">
        <div className="rounded-lg border border-border bg-surface-elevated p-10 md:p-14">
          <p className="label-caps text-accent">Ce que je cherche</p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Une alternance pour septembre 2026.
          </h2>
          <p className="mt-4 max-w-2xl text-text-muted">
            Candidat à la <span className="text-text">Licence Pro SIG</span> —
            Cartographie, Topographie et Systèmes d&apos;Information
            Géographique, Université de Lorraine. Sous réserve
            d&apos;admission.
          </p>

          <div className="mt-8 grid max-w-3xl grid-cols-1 gap-x-8 gap-y-5 border-t border-border pt-8 md:grid-cols-2">
            <Field label="Formation visée">
              Licence Pro SIG — Université de Lorraine
            </Field>
            <Field label="Rentrée prévue">7 septembre 2026</Field>
            <Field label="Fin de formation">2 juillet 2027</Field>
            <Field label="Rythme">
              Alternance université / entreprise{" "}
              <a
                href="/Calendrier_Alternance.pdf"
                className="text-accent underline-offset-2 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                · Calendrier détaillé ↗
              </a>
            </Field>
            <Field label="Domaines">
              Collectivité, bureau d&apos;études géomatique, structure de
              données ouvertes, transports.
            </Field>
            <Field label="Localisation">
              Nancy en priorité, Grand Est et télétravail partiel
              bienvenus.
            </Field>
            <Field label="Missions">
              Acquisition, analyse spatiale, applications web
              cartographiques, automatisation de pipelines.
            </Field>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover"
            >
              Échangeons
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
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="label-caps text-text-subtle">{label}</p>
      <p className="mt-2 text-text-muted">{children}</p>
    </div>
  );
}
