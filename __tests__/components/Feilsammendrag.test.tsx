import { render } from '@testing-library/react';

import useBoundStore from '../../state/useBoundStore';
import formatRHFFeilmeldinger from '../../utils/formatRHFFeilmeldinger';
import { vi, Mock } from 'vitest';
import Feilsammendrag from '../../components/Feilsammendrag';

vi.mock('../../state/useBoundStore');
vi.mock('../../utils/formatRHFFeilmeldinger');

describe('Feilsammendrag', () => {
  it('should render null if there are no errors', () => {
    (formatRHFFeilmeldinger as Mock).mockReturnValue([]);
    (useBoundStore as Mock).mockReturnValue([]);

    const { container } = render(<Feilsammendrag skjemafeil={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render FeilListe if there are errors', () => {
    const mockErrors = [
      { text: 'Error 1', felt: 'field1' },
      { text: 'Error 2', felt: 'field2' }
    ];
    (formatRHFFeilmeldinger as Mock).mockReturnValue(mockErrors);
    (useBoundStore as Mock).mockReturnValueOnce([]).mockReturnValueOnce(true);

    const { getByText } = render(<Feilsammendrag skjemafeil={mockErrors} />);
    expect(getByText('Error 1')).toBeInTheDocument();
    expect(getByText('Error 2')).toBeInTheDocument();
  });

  it('should combine errors from state and props', () => {
    const mockErrors = [{ text: 'Error 1', felt: 'field1' }];
    const stateErrors = [{ text: 'State Error', felt: 'field2' }];
    (formatRHFFeilmeldinger as Mock).mockReturnValue(mockErrors);
    (useBoundStore as Mock).mockReturnValueOnce(stateErrors).mockReturnValueOnce(true);

    const { getByText } = render(<Feilsammendrag skjemafeil={mockErrors} />);
    expect(getByText('Error 1')).toBeInTheDocument();
    expect(getByText('State Error')).toBeInTheDocument();
  });
});
