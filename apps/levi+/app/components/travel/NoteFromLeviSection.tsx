// apps/web/components/travel/NoteFromLeviSection.tsx
'use client';

import type { NoteFromLevi } from '@houselevi/travel-api';
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, Key } from 'react';

interface NoteFromLeviSectionProps {
  note: NoteFromLevi | null;
  loading: boolean;
}

// Default copy — admin can override via web+ panel
const DEFAULT_NOTE = `Travel, Curated.

My work is shaped by wilderness, light, and the art of arrival.

From the private conservancies of Kenya and the volcanic highlands of Rwanda to the deserts of Namibia, the waterways of Botswana, and the quiet islands of the Indian Ocean — Seychelles, Mauritius, Zanzibar, Madagascar — each journey begins long before departure.

I do not lead tours.
I curate movement across Africa and beyond — with precision, discretion, and a deep understanding of place.

This is House Levi.`;

export function NoteFromLeviSection({ note, loading }: NoteFromLeviSectionProps) {
  if (loading) {
    return (
      <section className="note-from-levi note-from-levi--loading">
        <div className="note-from-levi__inner">
          <div className="note-from-levi__skeleton" />
        </div>
      </section>
    );
  }

  const bodyText = note?.bodyText ?? DEFAULT_NOTE;

  return (
    <section className="note-from-levi">
      <div className="note-from-levi__inner">
        <h2 className="note-from-levi__heading">A Note From Levi</h2>

        <div className="note-from-levi__body">
          {bodyText.split('\n\n').map((para: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined, i: Key | null | undefined) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        {note?.signatureImageUrl ? (
          <img
            src={note.signatureImageUrl}
            alt="Levi's signature"
            className="note-from-levi__signature"
          />
        ) : (
          <p className="note-from-levi__signature-text">— Levi</p>
        )}
      </div>
    </section>
  );
}