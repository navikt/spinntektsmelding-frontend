import { describe, it, expect } from 'vitest';

import { konverterBegrunnelseFullLonnIArbeidsgiverperiode } from '../../utils/konverterBegrunnelseFullLonnIArbeidsgiverperiode';

describe.concurrent('konverterBegrunnelseFullLonnIArbeidsgiverperiode', () => {
  it('should return the correct value for valid input', () => {
    expect(konverterBegrunnelseFullLonnIArbeidsgiverperiode('ARBEID_OPPHOERT')).toEqual('ArbeidOpphoert');
    expect(konverterBegrunnelseFullLonnIArbeidsgiverperiode('BESKJED_GITT_FOR_SENT')).toEqual('BeskjedGittForSent');
    expect(konverterBegrunnelseFullLonnIArbeidsgiverperiode('FERIE_ELLER_AVSPASERING')).toEqual(
      'FerieEllerAvspasering'
    );
    expect(konverterBegrunnelseFullLonnIArbeidsgiverperiode('IKKE_FULL_STILLINGSANDEL')).toEqual(
      'IkkeFullStillingsandel'
    );
    expect(konverterBegrunnelseFullLonnIArbeidsgiverperiode('LOVLIG_FRAVAER')).toEqual('LovligFravaer');
  });

  it('should return the input value for invalid input', () => {
    expect(konverterBegrunnelseFullLonnIArbeidsgiverperiode('INVALID_INPUT')).toEqual('INVALID_INPUT');
  });

  it('should return the input value for invalid input StreikEllerLockout', () => {
    expect(konverterBegrunnelseFullLonnIArbeidsgiverperiode('StreikEllerLockout')).toEqual('StreikEllerLockout');
  });
});
