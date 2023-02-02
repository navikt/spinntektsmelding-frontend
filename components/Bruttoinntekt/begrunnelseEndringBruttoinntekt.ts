interface Begrunnelser {
  [key: string]: string;
}
const begrunnelseEndringBruttoinntekt: Begrunnelser = {
  FeilInntekt: 'FeilInntekt',
  Tariffendring: 'Tariffendring',
  Ferie: 'Ferie',
  VarigLonnsendring: 'VarigLonnsendring',
  Permisjon: 'Permisjon',
  Permitering: 'Permitering',
  NyStilling: 'NyStilling',
  NyStillingsprosent: 'NyStillingsprosent',
  Bonus: 'Bonus'
};

export default begrunnelseEndringBruttoinntekt;
