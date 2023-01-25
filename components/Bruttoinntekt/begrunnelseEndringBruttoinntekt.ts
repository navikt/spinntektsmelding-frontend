interface Begrunnelser {
  [key: string]: string;
}

const begrunnelseEndringBruttoinntekt: Begrunnelser = {
  FeilInntekt: 'Feil inntekt',
  Tariffendring: 'Tariffendring',
  FerieUtenLonn: 'Ferie uten lønn',
  Lonnsokning: 'Lønnsøkning'
};

export default begrunnelseEndringBruttoinntekt;
