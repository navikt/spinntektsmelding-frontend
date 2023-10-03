const oversettelse: Record<string, string> = {
  ARBEID_OPPHOERT: 'ArbeidOpphoert',
  BESKJED_GITT_FOR_SENT: 'BeskjedGittForSent',
  BETVILER_ARBEIDSUFOERHET: 'BetvilerArbeidsufoerhet',
  FERIE_ELLER_AVSPASERING: 'FerieEllerAvspasering',
  FISKER_MED_HYRE: 'FiskerMedHyre',
  FRAVAER_UTEN_GYLDIG_GRUNN: 'FravaerUtenGyldigGrunn',
  IKKE_FRAVAER: 'IkkeFravaer',
  IKKE_FULL_STILLINGSANDEL: 'IkkeFullStillingsandel',
  IKKE_LOENN: 'IkkeLoenn',
  LOVLIG_FRAVAER: 'LovligFravaer',
  MANGLER_OPPTJENING: 'ManglerOpptjening',
  PERMITTERING: 'Permittering',
  SAERREGLER: 'Saerregler',
  STREIK_ELLER_LOCKOUT: 'StreikEllerLockout',
  TIDLIGERE_VIRKSOMHET: 'TidligereVirksomhet'
};

export const konverterBegrunnelseFullLonnIArbeidsgiverperiode = (begrunnelse: string) => {
  return oversettelse[begrunnelse] ? oversettelse[begrunnelse] : begrunnelse;
};
