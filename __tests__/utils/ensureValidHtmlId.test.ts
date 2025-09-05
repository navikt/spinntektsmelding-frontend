import ensureValidHtmlId from '../../utils/ensureValidHtmlId';

describe('ensureValidHtmlId', () => {
  it('keeps a simple valid id (lowercases by default)', () => {
    expect(ensureValidHtmlId('Section_1')).toBe('section_1');
  });

  it('replaces spaces and punctuation with hyphens', () => {
    expect(ensureValidHtmlId('Min tittel: Del #2')).toBe('min-tittel-del-2');
  });

  it('removes diacritics', () => {
    expect(ensureValidHtmlId('Über café å')).toBe('uber-cafe-a');
  });

  it('prefixes when starting with a digit', () => {
    expect(ensureValidHtmlId('123abc')).toBe('id-123abc');
  });

  it('collapses repeated separators and trims ends', () => {
    expect(ensureValidHtmlId('  --- Hei   verden ---  ')).toBe('hei-verden');
  });

  it('falls back when empty and ensures leading letter via prefix', () => {
    expect(ensureValidHtmlId('   ')).toBe('id-0');
  });

  it('supports custom replacement token', () => {
    expect(ensureValidHtmlId('Hei verden!', { replacement: '_' })).toBe('hei_verden');
  });

  it('supports disabling lowercase', () => {
    expect(ensureValidHtmlId('Foo Bar', { lowercase: false })).toBe('oo-ar');
  });

  it('truncates to maxLength and trims trailing separators', () => {
    expect(ensureValidHtmlId('A'.repeat(5) + '-'.repeat(10), { maxLength: 8 })).toBe('aaaaa');
  });

  it('uses custom prefixIfNeeded', () => {
    expect(ensureValidHtmlId('9lives', { prefixIfNeeded: 'x-' })).toBe('x-9lives');
  });
});
