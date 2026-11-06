import { describe, expect, it } from 'vitest';
import handler from '../../../pages/api/hentKvittering';
import handlerMedId from '../../../pages/api/hentKvittering/[postId]';

describe('/api/hentKvittering', () => {
  it('exports the receipt handler function', () => {
    expect(typeof handler).toBe('function');
    expect(handler).toBe(handlerMedId);
  });
});
