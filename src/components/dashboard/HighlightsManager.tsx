"use client";

import { useState } from "react";
import { FilmFrame } from "@/components/players/FilmFrame";
import { useApp } from "@/components/providers/AppProviders";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";
import { isHudlUrl, youtubeId } from "@/lib/media";

export function HighlightsManager() {
  const { board, addHighlight, removeHighlight } = useApp();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  return (
    <section id="highlights" className="rounded-2xl border border-line bg-panel p-5" aria-labelledby="film-manage">
      <h2 id="film-manage" className="font-display text-4xl uppercase text-paper">
        Highlight videos
      </h2>
      <p className="mt-2 text-sm text-mist">
        YouTube links embed here. Hudl and other https links stay as safe outbound links. Nothing is uploaded.
      </p>
      <form
        className="mt-4 grid gap-4 md:grid-cols-[1fr_1.4fr_auto] md:items-end"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const result = addHighlight(title, url);
          if (result) {
            setErrors(result);
            setMessage("");
            return;
          }
          setTitle("");
          setUrl("");
          setErrors({});
          setMessage("Film link saved.");
        }}
      >
        <Field label="Title" id="film-title" error={errors.title}>
          <input
            id="film-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={inputClass}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "film-title-error" : undefined}
          />
        </Field>
        <Field label="https link" id="film-url" error={errors.url}>
          <input
            id="film-url"
            type="url"
            inputMode="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className={inputClass}
            placeholder="https://www.youtube.com/watch?v="
            aria-invalid={Boolean(errors.url)}
            aria-describedby={errors.url ? "film-url-error" : undefined}
          />
        </Field>
        <Button type="submit">Add film</Button>
      </form>
      {message ? (
        <p role="status" className="mt-3 text-sm text-lime">
          {message}
        </p>
      ) : null}
      {board.profile.highlights.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-line px-4 py-6 text-sm text-mist">
          No film links yet. Add a YouTube or Hudl URL you want on your profile.
        </p>
      ) : (
        <ul className="mt-4 grid gap-4 lg:grid-cols-2">
          {board.profile.highlights.map((highlight) => (
            <li key={highlight.id} className="space-y-3">
              <FilmFrame
                title={highlight.title}
                url={highlight.url}
                note={
                  youtubeId(highlight.url)
                    ? "Embedded from YouTube."
                    : isHudlUrl(highlight.url)
                      ? "Hudl link. Opens in a new tab."
                      : "Saved as a link."
                }
              />
              <Button variant="danger" size="sm" onClick={() => removeHighlight(highlight.id)}>
                Remove {highlight.title}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
