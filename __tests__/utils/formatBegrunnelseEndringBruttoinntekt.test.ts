import formatBegrunnelseEndringBruttoinntekt from '../../utils/formatBegrunnelseEndringBruttoinntekt';

describe.concurrent('formatBegrunnelseEndringBruttoinntekt', () => {
  it('shold return Tariffendring', () => {
    expect(formatBegrunnelseEndringBruttoinntekt('Tariffendring')).toBe('Tariffendring');
  });

  it('shold return Ferie', () => {
    expect(formatBegrunnelseEndringBruttoinntekt('Ferie')).toBe('Ferie');
  });

  it('shold return VarigLonnsendring', () => {
    expect(formatBegrunnelseEndringBruttoinntekt('VarigLoennsendring')).toBe('Varig lønnsendring');
  });

  it('shold return Permisjon', () => {
    expect(formatBegrunnelseEndringBruttoinntekt('Permisjon')).toBe('Permisjon');
  });
});
