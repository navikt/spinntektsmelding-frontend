interface Begrunnelser {
  [key: string]: string;
}

const begrunnelseIngenEllerRedusertUtbetalingListe: Begrunnelser = {
  LovligFravaer: 'Lovlig fravær',
  FravaerUtenGyldigGrunn: 'Fravær uten gyldig grunn',
  ArbeidOpphoert: 'Arbeid opphørt',
  BeskjedGittForSent: 'Beskjed gitt for sent',
  ManglerOpptjening: 'Mangler opptjening',
  IkkeLoenn: 'Ikke lønn',
  BetvilerArbeidsufoerhet: 'Betviler arbeidsuførhet',
  IkkeFravaer: 'Ikke fravær',
  StreikEllerLockout: 'Streikk eller lockout',
  Permittering: 'Permitering',
  FiskerMedHyre: 'Fisker med hyre',
  Saerregler: 'Sær regler',
  FerieEllerAvspasering: 'Ferie eller avspassering',
  IkkeFullStillingsandel: 'Ikke full stillingsandel',
  TidligereVirksomhet: 'Tidligere virksomhet'
};

export default begrunnelseIngenEllerRedusertUtbetalingListe;
