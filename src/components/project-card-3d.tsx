"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, type PointerEvent } from "react";
import type { Project } from "@/lib/projects";
import { getProjectImage } from "@/lib/projects";

const MAX_TILT = 8;
const SCALE = 1.02;

export function ProjectCard3D({ project }: { project: Project }) {
  const image = getProjectImage(project.slug);
  const ref = useRef<HTMLAnchorElement>(null);
  const rafRef = useRef<number | null>(null);

  const handlePointerMove = (e: PointerEvent<HTMLAnchorElement>) => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 2 * MAX_TILT;
    const rotateX = -(y - 0.5) * 2 * MAX_TILT;

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      node.style.setProperty("--rx", `${rotateX.toFixed(2)}deg`);
      node.style.setProperty("--ry", `${rotateY.toFixed(2)}deg`);
      node.style.setProperty("--mx", `${(x * 100).toFixed(2)}%`);
      node.style.setProperty("--my", `${(y * 100).toFixed(2)}%`);
      node.style.setProperty("--scale", `${SCALE}`);
    });
  };

  const handlePointerLeave = () => {
    const node = ref.current;
    if (!node) return;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    node.style.setProperty("--rx", "0deg");
    node.style.setProperty("--ry", "0deg");
    node.style.setProperty("--scale", "1");
  };

  return (
    <Link
      ref={ref}
      href={`/projets/${project.slug}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-surface-elevated transition-[border-color,box-shadow] hover:border-border-strong hover:shadow-lg [transform:perspective(900px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))_scale(var(--scale,1))] [transform-style:preserve-3d] [transition:transform_120ms_ease-out,border-color_200ms,box-shadow_200ms] motion-reduce:transform-none motion-reduce:transition-none"
      style={{ willChange: "transform" }}
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
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,0.18), transparent 45%)",
          }}
        />
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
