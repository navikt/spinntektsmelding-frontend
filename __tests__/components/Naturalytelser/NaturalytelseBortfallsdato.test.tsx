import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import NaturalytelseBortfallsdato from '../../../components/Naturalytelser/NaturalytelseBortfallsdato';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import timezone_mock from 'timezone-mock';
import { afterAll } from 'vitest';

describe('NaturalytelseBortfallsdato', () => {
  const user = userEvent.setup();

  beforeAll(() => {
    // Suppress uncaught exceptions in this test file
    process.on('uncaughtException', (err) => {
      // ignore
    });
    process.on('unhandledRejection', (err) => {
      // ignore
    });
  });

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterAll(() => {
    timezone_mock.unregister();
  });

  it('renders a title text', () => {
    const setFn = vi.fn();
    render(<NaturalytelseBortfallsdato naturalytelseId='id' setNaturalytelseBortfallsdato={setFn} />);

    const inputField = screen.getByRole('textbox', {
      name: /Dato naturalytelse bortfaller/i
    });
    expect(inputField).toBeInTheDocument();
  });

  it('calls callback when date changes', async () => {
    timezone_mock.register('UTC');
    const setFn = vi.fn();
    render(
      <NaturalytelseBortfallsdato
        naturalytelseId='id'
        setNaturalytelseBortfallsdato={setFn}
        defaultValue={new Date()}
      />
    );

    const inputField = screen.getByRole('textbox', {
      name: /Dato naturalytelse bortfaller/i
    });
    act(async () => {
      await user.type(inputField, '24.12.2024{tab}');
      expect(setFn).toHaveBeenCalledWith('id', new Date('2024-12-24T00:00:00'));
    });
    timezone_mock.unregister();
  });

  it('should have no violations', async () => {
    const setFn = vi.fn();
    const { container } = render(
      <NaturalytelseBortfallsdato
        naturalytelseId='id'
        setNaturalytelseBortfallsdato={setFn}
        defaultValue={new Date()}
      />
    );
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
