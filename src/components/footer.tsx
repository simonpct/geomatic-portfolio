const socials = [
  { href: "/cv.pdf", label: "CV PDF" },
  { href: "https://linkedin.com/in/simon-picot", label: "LinkedIn" },
  { href: "mailto:pro@simonpct.fr", label: "Email" },
  { href: "https://github.com/simonpct", label: "GitHub" },
  { href: "https://openstreetmap.org/user/simonpct", label: "OSM" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-elevated">
      <div className="mx-auto flex max-w-container flex-col items-start justify-between gap-6 px-6 py-10 md:flex-row md:items-center">
        <div className="font-display text-sm font-semibold text-text">
          Simon Picot
        </div>
        <ul className="flex flex-wrap gap-6">
          {socials.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                className="label-caps text-text-subtle transition-colors hover:text-accent"
                target="_blank"
                rel="noreferrer"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="label-caps text-text-subtle">© 2026</div>
      </div>
    </footer>
  );
}
