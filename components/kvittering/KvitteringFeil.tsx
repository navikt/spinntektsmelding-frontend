import { useEffect, useEffectEvent } from 'react';
import environment from '../../config/environment';
import useBoundStore from '../../state/useBoundStore';
import HentingAvDataFeilet from '../HentingAvDataFeilet';

interface KvitteringFeilProps {
  kvitteringStatus?: number;
}

export default function KvitteringFeil({ kvitteringStatus }: Readonly<KvitteringFeilProps>) {
  const skjemaFeilet = useBoundStore((state) => state.skjemaFeilet);
  const setSkjemaFeilet = useBoundStore((state) => state.setSkjemaFeilet);
  const sykmeldingsperioder = useBoundStore((state) => state.sykmeldingsperioder);
  const hentingFeilet = kvitteringStatus !== undefined && kvitteringStatus >= 400;

  const onSetSkjemaFeilet = useEffectEvent(() => {
    setSkjemaFeilet();
  });

  useEffect(() => {
    if (hentingFeilet && !sykmeldingsperioder?.length) {
      onSetSkjemaFeilet();
    }
  }, [hentingFeilet, sykmeldingsperioder]);

  const lukkHentingFeiletModal = () => {
    if (globalThis.window === undefined || !environment.saksoversiktUrl) return;
    globalThis.window.location.href = environment.saksoversiktUrl;
  };

  return (
    <HentingAvDataFeilet
      open={skjemaFeilet || hentingFeilet}
      handleCloseModal={lukkHentingFeiletModal}
      title='Henting av kvitteringen feilet'
      ariaLabel='Henting av kvittering feilet'
    />
  );
}
