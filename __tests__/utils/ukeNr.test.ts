import ukeNr from '../../utils/ukeNr';

describe.concurrent('ukeNr', () => {
  it('shold return return the correct weeknumber for a sunday', () => {
    expect(ukeNr(new Date(2022, 9, 2))).toBe(40);
  });

  it('shold return return the correct weeknumber for a monday', () => {
    expect(ukeNr(new Date(2022, 9, 3))).toBe(41);
  });

  it('shold return return the correct weeknumber for a saturday', () => {
    expect(ukeNr(new Date(2022, 9, 8))).toBe(41);
  });

  it('shold return return the correct weeknumber for another sunday', () => {
    expect(ukeNr(new Date(2022, 9, 9))).toBe(41);
  });

  it('shold return return the correct weeknumber for another monday', () => {
    expect(ukeNr(new Date(2022, 9, 10))).toBe(42);
  });

  it('shold return return the correct weeknumber for another saturday', () => {
    expect(ukeNr(new Date(2022, 9, 15))).toBe(42);
  });
});
