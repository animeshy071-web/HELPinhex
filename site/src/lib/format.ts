// HELPINhex format helpers — HTML escaping + build-time jargon linking.

import type { Term } from './types';

// Built from char codes so the source never contains raw entities.
const AMP = String.fromCharCode(38); // "&"

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, AMP + 'amp;')
    .replace(/</g, AMP + 'lt;')
    .replace(/>/g, AMP + 'gt;')
    .replace(/"/g, AMP + 'quot;')
    .replace(/'/g, AMP + '#39;');
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface Match { s: number; e: number; id: string }

/**
 * Links the first occurrence of each known term inside a plain-text string,
 * wrapping it in a hover-decodable <span class="term" data-term="...">.
 * Text is escaped first — content is trusted, output is safe.
 */
export function linkTerms(plain: string, terms: Term[]): string {
  const matches: Match[] = [];
  for (const t of terms) {
    const re = new RegExp(`\\b${escapeRegExp(t.word)}\\b`, 'i');
    const m = plain.match(re);
    if (m && m.index !== undefined) matches.push({ s: m.index, e: m.index + m[0].length, id: t.id });
  }
  // Prefer the longest matches, then earliest; never overlap.
  matches.sort((a, b) => (b.e - b.s) - (a.e - a.s) || a.s - b.s);
  const chosen: Match[] = [];
  for (const m of matches) {
    if (chosen.every((c) => m.e <= c.s || m.s >= c.e)) chosen.push(m);
  }
  chosen.sort((a, b) => a.s - b.s);

  let out = '';
  let pos = 0;
  for (const m of chosen) {
    out += escapeHtml(plain.slice(pos, m.s));
    const raw = plain.slice(m.s, m.e);
    out += `<span class="term" data-term="${m.id}">${escapeHtml(raw)}</span>`;
    pos = m.e;
  }
  out += escapeHtml(plain.slice(pos));
  return out;
}
