interface Begrunnelser {
  [key: string]: string;
}

const begrunnelseIngenEllerRedusertUtbetalingListe: Begrunnelser = {
  LovligFravaer: 'Lovlig fravær uten lønn ',
  FravaerUtenGyldigGrunn: 'Ikke lovlig fravær',
  ArbeidOpphoert: 'Arbeidsforholdet er avsluttet',
  BeskjedGittForSent: 'Beskjed om fravær gitt for sent eller sykmeldingen er ikke sendt i tide',
  ManglerOpptjening: 'Det er ikke fire ukers opptjeningstid',
  IkkeLoenn: 'Det er ikke avtale om videre arbeid',
  BetvilerArbeidsufoerhet: 'Vi betviler at ansatt er ute av stand til å jobbe',
  IkkeFravaer: 'Ansatt har ikke hatt fravær fra jobb',
  StreikEllerLockout: 'Streikk eller lockout',
  Permittering: 'Ansatt er helt eller delvis permittert',
  FiskerMedHyre: 'Ansatt er fisker med hyre på blad B',
  Saerregler: 'Ansatt skal være donor eller skal til kontrollundersøkelse som varer i mer enn 24 timer',
  FerieEllerAvspasering:
    'Mindre enn 16 dager siden arbeidet ble gjenopptatt på grunn av lovpålagt ferie eller avspasering',
  IkkeFullStillingsandel: 'Ansatt har ikke gjenopptatt full stilling etter forrige arbeidsgiverperiode',
  TidligereVirksomhet: 'Arbeidsgiverperioden er helt eller delvis gjennomført hos tidligere virksomhet '
};

export default begrunnelseIngenEllerRedusertUtbetalingListe;
