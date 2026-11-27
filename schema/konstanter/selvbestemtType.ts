// Delte konstanter og typer for selvbestemt innsending.
// Laget for å unngå sirkulær avhengighet mellom schema og state.

export const SelvbestemtTypeConst = {
  MedArbeidsforhold: 'MedArbeidsforhold',
  UtenArbeidsforhold: 'UtenArbeidsforhold',
  Fisker: 'Fisker',
  Behandlingsdager: 'Behandlingsdager',
  BehandlingsdagerMedAnnetSykefravaer: 'BehandlingsdagerMedAnnetSykefravaer',
  Under16DagerUtenOpptjeningstid: 'Under16DagerUtenOpptjeningstid',
  Over16DagerMedEgenmeldingsdager: 'Over16DagerMedEgenmeldingsdager',
  PapirSoeknad: 'PapirSoeknad',
  Reisetilskudd: 'Reisetilskudd',
  UtmeldtAaRegisteret: 'UtmeldtAaRegisteret',
  Annet: 'Annet',
  ArbeidIHelg: 'ArbeidIHelg',
  Kontrollundersoekelse: 'Kontrollundersoekelse',
  TilbakeEtterPermitering: 'TilbakeEtterPermitering'
} as const;

export type SelvbestemtType = (typeof SelvbestemtTypeConst)[keyof typeof SelvbestemtTypeConst];
