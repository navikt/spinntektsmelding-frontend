import { render, screen, fireEvent, createEvent } from '@testing-library/react';
import VisMer from '../../components/PeriodeVelger/VisMer';
import { vi, describe } from 'vitest';

describe('VisMer', () => {
  it('should render the button with the correct text', () => {
    render(<VisMer />);

    const button = screen.getByRole('button', { name: /Vis mer.../i });

    expect(button).toBeInTheDocument();
  });

  it('should call the onClick function when the button is clicked', () => {
    const onClickMock = vi.fn();
    render(<VisMer onClick={onClickMock} />);

    const button = screen.getByRole('button', { name: /Vis mer.../i });

    fireEvent.click(button);

    expect(onClickMock).toHaveBeenCalled();
  });

  it('should prevent default behavior when the button is clicked', () => {
    const preventDefaultMock = vi.fn();
    const mocker = vi.fn();
    render(<VisMer />);

    const button = screen.getByRole('button', { name: /Vis mer.../i });

    const clickEvent = createEvent.click(button);

    fireEvent(button, clickEvent);

    expect(clickEvent.defaultPrevented).toBeTruthy();
  });
});
