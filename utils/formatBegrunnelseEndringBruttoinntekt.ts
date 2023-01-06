import begrunnelseEndringBruttoinntekt from '../components/Bruttoinntekt/begrunnelseEndringBruttoinntekt';

const formatBegrunnelseEndringBruttoinntekt = (endringsaarsak: string) => {
  return begrunnelseEndringBruttoinntekt[endringsaarsak];
};

export default formatBegrunnelseEndringBruttoinntekt;
