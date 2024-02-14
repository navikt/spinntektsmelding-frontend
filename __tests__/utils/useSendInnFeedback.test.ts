import { vi } from 'vitest';
import useSendInnFeedback from '../../utils/useSendInnFeedback';
import environment from '../../config/environment';

const loggerMock = vi.hoisted(() => {
  return vi.fn();
});
vi.mock('@navikt/next-logger', () => ({
  logger: { info: loggerMock },

  default: vi.fn()
}));

describe('useSendInnFeedback', () => {
  beforeEach(() => {
    loggerMock.mockClear();
  });

  it('should send feedback successfully', async () => {
    const feedback = { message: 'This is a feedback' };
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock;

    const sendInnFeedback = useSendInnFeedback();
    const response = await sendInnFeedback(feedback);

    expect(fetchMock).toHaveBeenCalledWith(`${environment.flexjarUrl}`, {
      body: JSON.stringify(feedback),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    expect(response.ok).toBe(true);
    expect(loggerMock).toHaveBeenCalledWith('Feedback sendt');
  });

  it('should handle failed feedback sending', async () => {
    const feedback = { message: 'This is a feedback' };
    const fetchMock = vi.fn().mockResolvedValue({ ok: false });
    global.fetch = fetchMock;

    const sendInnFeedback = useSendInnFeedback();
    const response = await sendInnFeedback(feedback);

    expect(fetchMock).toHaveBeenCalledWith(`${environment.flexjarUrl}`, {
      body: JSON.stringify(feedback),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    expect(response.ok).toBe(false);
    expect(loggerMock).not.toHaveBeenCalled();
  });
});
