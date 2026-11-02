import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import KvitteringNaturalytelser from '../../components/kvittering/KvitteringNaturalytelser';

afterEach(() => {
  cleanup();
});

describe('KvitteringNaturalytelser', () => {
  it.each(['Naturalytelser', 'Eventuelle naturalytelser'])('beholder overskriften %s', (tittel) => {
    render(<KvitteringNaturalytelser tittel={tittel} naturalytelser={[]} />);

    expect(screen.getByRole('heading', { name: tittel })).toBeVisible();
    expect(screen.getByText('Ingen naturalytelser har falt bort')).toBeVisible();
  });
});
