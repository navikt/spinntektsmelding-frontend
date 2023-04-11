import begrunnelseEndringBruttoinntektTekster from '../components/Bruttoinntekt/begrunnelseEndringBruttoinntektTekster';

const formatBegrunnelseEndringBruttoinntekt = (endringsaarsak: string) => {
  return begrunnelseEndringBruttoinntektTekster[endringsaarsak];
};

export default formatBegrunnelseEndringBruttoinntekt;
