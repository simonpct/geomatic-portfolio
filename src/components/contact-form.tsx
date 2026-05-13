"use client";

import { useState } from "react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const subject = encodeURIComponent(`Contact portfolio — ${name}`);
    const body = encodeURIComponent(
      `${message}\n\n—\n${name}\n${email}`,
    );
    window.location.href = `mailto:pro@simonpct.fr?subject=${subject}&body=${body}`;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Field
        label="Nom"
        id="name"
        value={name}
        onChange={setName}
        required
      />
      <Field
        label="Email"
        id="email"
        type="email"
        value={email}
        onChange={setEmail}
        required
      />
      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="label-caps text-text-subtle">
          Message
        </label>
        <textarea
          id="message"
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="rounded-md border border-border bg-surface-elevated px-4 py-3 text-base text-text placeholder:text-text-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          placeholder="Quelques lignes sur votre besoin ou votre structure."
        />
      </div>
      <button
        type="submit"
        className="self-start inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover"
      >
        Envoyer
        <span aria-hidden>→</span>
      </button>
      <p className="text-xs text-text-subtle">
        Le bouton ouvre votre client mail avec le message pré-rempli.
      </p>
    </form>
  );
}

function Field({
  label,
  id,
  type = "text",
  value,
  onChange,
  required,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="label-caps text-text-subtle">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-border bg-surface-elevated px-4 py-3 text-base text-text placeholder:text-text-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
      />
    </div>
  );
}
