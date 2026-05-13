import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact — Simon Picot",
  description:
    "Pour discuter d'une alternance ou d'un projet en géomatique appliquée.",
};

export default function ContactPage() {
  return (
    <article>
      <header className="border-b border-border">
        <div className="mx-auto max-w-container px-6 py-20 md:py-24">
          <p className="label-caps text-accent">Contact</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
            Échangeons.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-muted">
            Pour une alternance, un projet en géomatique appliquée, ou
            simplement échanger sur un sujet commun. Je réponds sous
            48 h.
          </p>
        </div>
      </header>

      <section>
        <div className="mx-auto grid max-w-container grid-cols-1 gap-12 px-6 py-16 md:grid-cols-12 md:py-20">
          <div className="md:col-span-4">
            <p className="label-caps text-text-subtle">Direct</p>
            <ul className="mt-6 flex flex-col gap-4">
              <ContactItem
                label="Email"
                href="mailto:pro@simonpct.fr"
                value="pro@simonpct.fr"
              />
              <ContactItem
                label="LinkedIn"
                href="https://linkedin.com/in/simon-picot"
                value="simon-picot"
              />
              <ContactItem
                label="GitHub"
                href="https://github.com/simonpct"
                value="simonpct"
              />
              <ContactItem
                label="OpenStreetMap"
                href="https://openstreetmap.org/user/simonpct"
                value="simonpct"
              />
              <ContactItem
                label="CV"
                href="/cv.pdf"
                value="cv.pdf"
              />
              <ContactItem
                label="Calendrier alternance"
                href="/Calendrier_Alternance.pdf"
                value="2026 — 2027 (PDF)"
              />
            </ul>
          </div>

          <div className="md:col-span-8">
            <p className="label-caps text-text-subtle">Formulaire</p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}

function ContactItem({
  label,
  href,
  value,
}: {
  label: string;
  href: string;
  value: string;
}) {
  const isExternal = href.startsWith("http") || href.endsWith(".pdf");
  return (
    <li>
      <p className="label-caps text-text-subtle">{label}</p>
      <a
        href={href}
        className="mt-1 inline-block font-display text-base text-text transition-colors hover:text-accent"
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noreferrer" : undefined}
      >
        {value}
      </a>
    </li>
  );
}
