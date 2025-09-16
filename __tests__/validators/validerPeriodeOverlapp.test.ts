import validerPeriodeOverlapp, { PeriodeOverlappFeilkode } from '../../validators/validerPeriodeOverlapp';
import { Periode } from '../../state/state';

describe('validerPeriodeOverlapp', () => {
  it('should return an empty array when there are no overlapping periods', () => {
    const perioder: Periode[] = [
      { id: 'p1', fom: new Date('2022-01-01'), tom: new Date('2022-01-31') },
      { id: 'p2', fom: new Date('2022-02-01'), tom: new Date('2022-02-28') },
      { id: 'p3', fom: new Date('2022-03-01'), tom: new Date('2022-03-31') }
    ];

    const result = validerPeriodeOverlapp(perioder);

    expect(result).toEqual([]);
  });

  it('should return an array with the correct error code when there are overlapping periods', () => {
    const perioder: Periode[] = [
      { id: 'p1', fom: new Date('2022-01-01'), tom: new Date('2022-01-31') },
      { id: 'p2', fom: new Date('2022-01-15'), tom: new Date('2022-02-15') },
      { id: 'p3', fom: new Date('2022-02-01'), tom: new Date('2022-02-28') }
    ];

    const result = validerPeriodeOverlapp(perioder);

    expect(result).toEqual([{ felt: 'arbeidsgiverperioder-feil', code: PeriodeOverlappFeilkode.PERIODE_OVERLAPPER }]);
  });

  it('should return one error code when there are multiple overlapping periods', () => {
    const perioder: Periode[] = [
      { id: 'p1', fom: new Date('2022-01-01'), tom: new Date('2022-01-31') },
      { id: 'p2', fom: new Date('2022-01-15'), tom: new Date('2022-02-15') },
      { id: 'p3', fom: new Date('2022-02-01'), tom: new Date('2022-02-28') },
      { id: 'p4', fom: new Date('2022-02-15'), tom: new Date('2022-03-15') }
    ];

    const result = validerPeriodeOverlapp(perioder);

    expect(result).toEqual([{ felt: 'arbeidsgiverperioder-feil', code: PeriodeOverlappFeilkode.PERIODE_OVERLAPPER }]);
  });
});
