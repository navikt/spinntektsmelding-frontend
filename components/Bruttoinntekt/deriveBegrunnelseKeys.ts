import begrunnelseEndringBruttoinntekt from './begrunnelseEndringBruttoinntekt';

/**
 * Representerer et valgt endringsårsak-objekt fra skjemaet. Vi bryr oss kun om `aarsak`.
 */
interface EndringAarsakLike {
  aarsak: string;
  // Tillat ekstra felter uten å bry oss om dem
  [key: string]: unknown;
}

interface DeriveBegrunnelseKeysParams {
  /** Alle valgte begrunnelser i andre felter (array fra RHF watch) */
  valgteBegrunnelser?: EndringAarsakLike[] | null;
  /** Nåværende (lokalt) valgt begrunnelse-verdi i dette select-feltet */
  currentBegrunnelse?: string | null;
  /** Om dette er en ny innsending (styrer fjerning av Tariffendring) */
  nyInnsending: boolean;
}

/**
 * Lager listen av tilgjengelige begrunnelse-nøkler:
 *  - Fjerner allerede valgte nøkler
 *  - Fjerner 'Tariffendring' dersom nyInnsending === true
 *  - Sørger for at nåværende valgt verdi alltid er med (for å vise den i select selv om den ellers ville blitt filtrert bort)
 *  - Fjerner duplikater og returnerer som array
 */
export function deriveBegrunnelseKeys({
  valgteBegrunnelser,
  currentBegrunnelse,
  nyInnsending
}: DeriveBegrunnelseKeysParams): string[] {
  if (!begrunnelseEndringBruttoinntekt) return [];
  if (typeof begrunnelseEndringBruttoinntekt !== 'object') return [];
  if (Array.isArray(valgteBegrunnelser) === false) valgteBegrunnelser = [];

  const alreadyChosen = (valgteBegrunnelser ?? []).map((b) => b.aarsak);

  const baseKeys = Object.keys(begrunnelseEndringBruttoinntekt).filter(
    (key) => !alreadyChosen.includes(key) && (nyInnsending ? key !== 'Tariffendring' : true)
  );

  return Array.from(
    new Set([...baseKeys, ...(currentBegrunnelse && currentBegrunnelse !== '' ? [currentBegrunnelse] : [])])
  );
}
