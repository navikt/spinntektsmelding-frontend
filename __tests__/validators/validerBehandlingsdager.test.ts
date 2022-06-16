import validerBehandlingsdager, { valideringBehandlingsdager } from '../../validators/validerBehandlingsdager';

describe('validerBehandlingsdager', () => {
  it('should return OK when the days are once a week and no more than fifteen days apart', () => {
    const dager = [new Date(2022, 5, 10), new Date(2022, 5, 18), new Date(2022, 4, 30), new Date(2022, 5, 26)];

    expect(validerBehandlingsdager(dager)).toBe(valideringBehandlingsdager.OK);
  });

  it('should return OK when the days are once a week and no more than fifteen days apart and the days are sorted', () => {
    const dager = [new Date(2022, 4, 30), new Date(2022, 5, 10), new Date(2022, 5, 18), new Date(2022, 5, 26)];

    expect(validerBehandlingsdager(dager)).toBe(valideringBehandlingsdager.OK);
  });

  it('should return an error when two days are in the same week', () => {
    const dager = [
      new Date(2022, 5, 10),
      new Date(2022, 5, 18),
      new Date(2022, 5, 17),
      new Date(2022, 4, 30),
      new Date(2022, 5, 26)
    ];

    expect(validerBehandlingsdager(dager)).toBe(valideringBehandlingsdager.FLER_ENN_EN_I_UKEN);
  });

  it('should return an error when two days are more than 15 days apart', () => {
    const dager = [new Date(2022, 5, 10), new Date(2022, 5, 18), new Date(2022, 4, 10), new Date(2022, 5, 26)];

    expect(validerBehandlingsdager(dager)).toBe(valideringBehandlingsdager.FOR_LANGT_OPPHOLD);
  });
});
