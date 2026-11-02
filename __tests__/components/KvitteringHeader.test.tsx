import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import KvitteringHeader from '../../components/kvittering/KvitteringHeader';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('KvitteringHeader', () => {
  it('viser kvitteringstittel og kaller sidens Endre-handler', async () => {
    const user = userEvent.setup();
    const onEndre = vi.fn();
    render(<KvitteringHeader onEndre={onEndre} />);

    expect(screen.getByRole('heading', { name: 'Kvittering - innsendt inntektsmelding' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Endre' }));

    expect(onEndre).toHaveBeenCalledTimes(1);
  });
});
