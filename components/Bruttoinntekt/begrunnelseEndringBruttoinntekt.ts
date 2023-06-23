interface Begrunnelser {
  [key: string]: string;
}
const begrunnelseEndringBruttoinntekt: Begrunnelser = {
  // FeilInntekt: 'FeilInntekt',
  Tariffendring: 'Tariffendring',
  Ferie: 'Ferie',
  VarigLonnsendring: 'VarigLonnsendring',
  Permisjon: 'Permisjon',
  Permittering: 'Permittering',
  NyStilling: 'NyStilling',
  NyStillingsprosent: 'NyStillingsprosent',
  Bonus: 'Bonus',
  Nyansatt: 'Nyansatt',
  Sykefravaer: 'Sykefravaer',
  Feilregistrert: 'Feilregistrert'
};

export default begrunnelseEndringBruttoinntekt;
