// Delte konstanter og typer for selvbestemt innsending.
// Laget for å unngå sirkulær avhengighet mellom schema og state.

export const SelvbestemtTypeConst = {
  MedArbeidsforhold: 'MedArbeidsforhold',
  UtenArbeidsforhold: 'UtenArbeidsforhold',
  Fisker: 'Fisker',
  Behandlingsdager: 'Behandlingsdager'
} as const;

export type SelvbestemtType = (typeof SelvbestemtTypeConst)[keyof typeof SelvbestemtTypeConst];
