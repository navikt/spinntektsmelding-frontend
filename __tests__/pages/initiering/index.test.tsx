import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import Initiering from '../../../pages/initiering';
import { Mock, vi } from 'vitest';
import testFnr from '../../../mockdata/testFnr';
import useBoundStore from '../../../state/useBoundStore';

global.window = Object.create(window);
Object.defineProperty(global.window, 'location', {
  value: {
    ...window.location,
    replace: vi.fn()
  },
  writable: true
});

vi.mock('next/navigation', () => ({ useRouter: vi.fn() }));
const setIdentitetsnummerMock = vi.fn();
const setAarsakMock = vi.fn();

vi.mock('../../../state/useBoundStore', () => ({
  __esModule: true,
  default: vi.fn(),
  useBoundStore: vi.fn()
}));

describe('Initiering Page', () => {
  const pushMock = vi.fn();

  beforeEach(() => {
    // mock next/router
    (useRouter as unknown as Mock).mockReturnValue({ push: pushMock });

    (useBoundStore as Mock).mockImplementation((stateFn) =>
      stateFn({
        __esModule: true,
        default: vi.fn(),
        setIdentitetsnummer: setIdentitetsnummerMock,
        setAarsakSelvbestemtInnsending: setAarsakMock
      })
    );
    vi.clearAllMocks();
  });

  it('navigates to /initieringFiskere when årsakInnsending is Fiskere', async () => {
    render(<Initiering />);

    // select "Fiskere" radio
    const fiskereRadio = screen.getByRole('radio', { name: /Fisker/i });
    await userEvent.click(fiskereRadio);

    // fill in valid fødselsnummer
    const fnrInput = screen.getByLabelText(/Ansattes fødselsnummer/i);
    await userEvent.type(fnrInput, testFnr.GyldigeFraDolly.TestPerson1);

    // submit form
    const nextButton = screen.getByRole('button', { name: /Neste/i });
    await userEvent.click(nextButton);

    // assertions
    expect(setAarsakMock).toHaveBeenCalledWith('Fisker');
    expect(setIdentitetsnummerMock).toHaveBeenCalledWith(testFnr.GyldigeFraDolly.TestPerson1);
    expect(pushMock).toHaveBeenCalledWith('/initieringFiskere', { scroll: false });
  });
});
