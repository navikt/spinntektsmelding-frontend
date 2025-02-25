import useErrorRespons, { ErrorResponse } from '../../utils/useErrorResponse';
import useBoundStore from '../../state/useBoundStore';
import { vi } from 'vitest';

vi.mock('../../state/useBoundStore');

const mockUseBoundStore = vi.mocked(useBoundStore);

describe('useErrorRespons', () => {
  it('should call leggTilFeilmelding for each error', () => {
    const leggTilFeilmeldingMock = vi.fn();
    mockUseBoundStore.mockReturnValue(leggTilFeilmeldingMock);

    const errors: ErrorResponse[] = [
      { property: 'name', error: 'Invalid name', value: 'John' },
      { property: 'email', error: 'Invalid email', value: 'john@example.com' }
    ];

    const useErrorResponsFn = useErrorRespons();
    useErrorResponsFn(errors);

    expect(leggTilFeilmeldingMock).toHaveBeenCalledTimes(2);
    expect(leggTilFeilmeldingMock).toHaveBeenCalledWith('name', 'Invalid name');
    expect(leggTilFeilmeldingMock).toHaveBeenCalledWith('email', 'Invalid email');
  });
});
