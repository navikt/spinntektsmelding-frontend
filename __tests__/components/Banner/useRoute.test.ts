import { vi } from 'vitest';
import useRoute from '../../../components/Banner/useRoute';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  default: {},
  useRouter: () => ({ push: mockPush })
}));

describe('useRoute', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should call router.push with the correct URL when only slug is provided', async () => {
    const route = useRoute();
    await route(undefined, 'test-slug');
    expect(mockPush).toHaveBeenCalledWith('test-slug');
  });

  it('should call router.push with the correct URL when both slug and organisasjonsnummer are provided', async () => {
    const route = useRoute();
    await route('123456789', 'test-slug');
    expect(mockPush).toHaveBeenCalledWith('test-slug?bedrift=123456789');
  });

  it('should not call router.push when slug is not provided', async () => {
    const route = useRoute();
    await route('123456789');
    expect(mockPush).not.toHaveBeenCalled();
  });
});
