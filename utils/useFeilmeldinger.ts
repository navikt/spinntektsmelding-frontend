import React, { useState } from 'react';

// Her må det gjøres noe... Tanken er å ha state global. Kanskje det blir en store i stedet....

interface UseFeilmeldinger {
  visFeilmeldingsTekst: (feilmelding: string | undefined) => React.ReactNode;
  setVisFeilmelding: (harSubmittet: boolean) => void;
  visFeilmelding: (feilmelding: string | undefined) => boolean;
}

export default function useFeilmeldinger(): UseFeilmeldinger {
  const [skalViseFeilmeldinger, setSkalViseFeilmeldinger] = useState<boolean>(true);

  return {
    visFeilmeldingsTekst: (feilmelding) => {
      return skalViseFeilmeldinger && !!feilmelding ? feilmelding : '';
    },
    setVisFeilmelding: (harSubmittet: boolean) => {
      setSkalViseFeilmeldinger(harSubmittet);
    },
    visFeilmelding: (feilmelding) => {
      return skalViseFeilmeldinger && !!feilmelding ? true : false;
    }
  };
}
