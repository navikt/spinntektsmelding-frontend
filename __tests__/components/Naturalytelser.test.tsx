import useBoundStore from '../../state/useBoundStore';
import Naturalytelser from '../../components/Naturalytelser';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, Mock } from 'vitest';

vi.mock('../../state/useBoundStore', () => ({
  __esModule: true,
  default: vi.fn(),
  useBoundStore: vi.fn()
}));

describe('Naturalytelser', () => {
  const setIsDirtyForm = vi.fn();

  describe('Naturalytelser', () => {
    const setIsDirtyForm = vi.fn();
    const mockStore = {
      naturalytelser: [],
      leggTilNaturalytelse: vi.fn(),
      setNaturalytelseType: vi.fn(),
      setNaturalytelseBortfallsdato: vi.fn(),
      setNaturalytelseVerdi: vi.fn(),
      slettNaturalytelse: vi.fn(),
      slettAlleNaturalytelser: vi.fn(),
      visFeilmeldingTekst: vi.fn()
    };

    // beforeEach(() => {
    //   useBoundStore.mockReturnValue(mockStore);
    // });

    beforeEach(() => {
      (useBoundStore as unknown as Mock).mockImplementation((stateFn) => stateFn(mockStore));
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('renders the component', () => {
      render(<Naturalytelser setIsDirtyForm={setIsDirtyForm} />);
      expect(screen.getByText('Naturalytelser')).toBeInTheDocument();
      expect(
        screen.getByText('Har den ansatte naturalytelser som faller bort under sykefraværet?')
      ).toBeInTheDocument();
    });

    it('adds a naturalytelse when checkbox is checked', () => {
      render(<Naturalytelser setIsDirtyForm={setIsDirtyForm} />);
      const checkbox = screen.getByLabelText('Den ansatte har naturalytelser som faller bort ved sykmeldingen.');
      fireEvent.click(checkbox);
      expect(setIsDirtyForm).toHaveBeenCalledWith(true);
      expect(mockStore.leggTilNaturalytelse).toHaveBeenCalled();
    });

    it('removes all naturalytelser when checkbox is unchecked', () => {
      mockStore.naturalytelser = [{ id: '1', type: '', bortfallsdato: '', verdi: '' }];
      render(<Naturalytelser setIsDirtyForm={setIsDirtyForm} />);
      const checkbox = screen.getByLabelText('Den ansatte har naturalytelser som faller bort ved sykmeldingen.');
      fireEvent.click(checkbox);
      expect(setIsDirtyForm).toHaveBeenCalledWith(true);
      expect(mockStore.slettAlleNaturalytelser).toHaveBeenCalled();
    });

    it('adds a new naturalytelse when "Legg til naturalytelse" button is clicked', () => {
      render(<Naturalytelser setIsDirtyForm={setIsDirtyForm} />);
      const button = screen.getByText('Legg til naturalytelse');
      fireEvent.click(button);
      expect(setIsDirtyForm).toHaveBeenCalledWith(true);
      expect(mockStore.leggTilNaturalytelse).toHaveBeenCalled();
    });

    it('removes a naturalytelse when "Slett ytelse" button is clicked', () => {
      mockStore.naturalytelser = [{ id: '1', type: '', bortfallsdato: '', verdi: '' }];
      render(<Naturalytelser setIsDirtyForm={setIsDirtyForm} />);
      const button = screen.getByTitle('Slett ytelse');
      fireEvent.click(button);
      expect(setIsDirtyForm).toHaveBeenCalledWith(true);
      expect(mockStore.slettNaturalytelse).toHaveBeenCalledWith('1');
    });
  });
});
