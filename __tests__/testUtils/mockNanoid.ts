import { vi } from 'vitest';

// Centralized nanoid mock. Guarantees we always operate on the same vi.fn spy instance.
// Provides helpers for deterministic sequences or constant IDs across tests.

let nanoidSpy: ReturnType<typeof vi.fn>;

vi.mock('nanoid', () => {
  // Create the spy when the module factory runs (hoisted by Vitest)
  nanoidSpy = vi.fn(() => 'id'); // default deterministic fallback
  return { nanoid: nanoidSpy };
});

function ensureSpy() {
  if (!nanoidSpy) {
    // Fallback safety (should not happen because factory above runs first)
    nanoidSpy = vi.fn(() => 'id');
  }
  return nanoidSpy;
}

export function mockNanoidSequence(ids: string[]) {
  const spy = ensureSpy();
  if (typeof (spy as any).mockReset === 'function') spy.mockReset();
  // Queue each id. After the sequence is exhausted fall back to last value.
  ids.forEach((id, idx) => {
    if (idx === ids.length - 1) {
      spy.mockImplementation(() => id); // final becomes persistent
    } else {
      spy.mockImplementationOnce(() => id);
    }
  });
  if (ids.length === 0) {
    spy.mockImplementation(() => 'id');
  }
}

export function mockNanoidConstant(id: string) {
  const spy = ensureSpy();
  if (typeof (spy as any).mockReset === 'function') spy.mockReset();
  spy.mockImplementation(() => id);
}

export function resetNanoidMock() {
  const spy = ensureSpy();
  if (typeof (spy as any).mockReset === 'function') spy.mockReset();
  spy.mockImplementation(() => 'id');
}

// Expose helpers (default already returns 'id')
const api = { mockNanoidSequence, mockNanoidConstant, resetNanoidMock };
export default api;
