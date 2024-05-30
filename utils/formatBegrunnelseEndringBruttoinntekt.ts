import begrunnelseEndringBruttoinntektTekster from '../components/Bruttoinntekt/begrunnelseEndringBruttoinntektTekster';

const formatBegrunnelseEndringBruttoinntekt = (aarsak: string) => {
  return begrunnelseEndringBruttoinntektTekster[aarsak];
};

export default formatBegrunnelseEndringBruttoinntekt;
