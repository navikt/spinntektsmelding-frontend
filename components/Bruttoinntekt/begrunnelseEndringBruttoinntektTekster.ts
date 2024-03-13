interface BegrunnelserTekster {
  [key: string]: string;
}

const begrunnelseEndringBruttoinntektTekster: BegrunnelserTekster = {
  FeilInntekt: 'Feil inntekt',
  Tariffendring: 'Tariffendring',
  Ferie: 'Ferie',
  VarigLoennsendring: 'Varig lønnsendring',
  Permisjon: 'Permisjon',
  Permittering: 'Permittering',
  NyStilling: 'Ny stilling',
  NyStillingsprosent: 'Ny stillingsprosent',
  Bonus: 'Bonus',
  Nyansatt: 'Nyansatt',
  Sykefravaer: 'Sykefravær',
  Ferietrekk: 'Ferietrekk/Utbetaling av feriepenger',
  Feilregistrert: 'Mangelfull eller uriktig rapportering til a-ordningen'
};

export default begrunnelseEndringBruttoinntektTekster;
