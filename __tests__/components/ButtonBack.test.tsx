import type { FormEvent, MouseEvent } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ButtonBack from '../../components/Initiering/ButtonBack';

describe('ButtonBack', () => {
  it('forwards the click event after preventing its default action without submitting the form', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
    const onClick = vi.fn((event: MouseEvent<HTMLButtonElement>) => {
      expect(event.defaultPrevented).toBe(true);
      expect(event.currentTarget).toBe(screen.getByRole('button', { name: 'Tilbake' }));
    });

    render(
      <form onSubmit={onSubmit}>
        <ButtonBack onClick={onClick} />
      </form>
    );

    const button = screen.getByRole('button', { name: 'Tilbake' });
    expect(button).toHaveAttribute('type', 'button');
    await user.click(button);

    expect(onClick).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('activates with Enter without submitting the form', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());

    render(
      <form onSubmit={onSubmit}>
        <ButtonBack onClick={onClick} />
      </form>
    );

    await user.tab();
    expect(screen.getByRole('button', { name: 'Tilbake' })).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(onClick).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
