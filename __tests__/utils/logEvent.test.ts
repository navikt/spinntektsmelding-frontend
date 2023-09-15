import { vi } from 'vitest';
import logEvent from '../../utils/logEvent';
import env from '../../config/environment';

const mockLogAmplitudeEvent = vi.hoisted(() => {
  return vi.fn();
});

const mockLoggerWarn = vi.hoisted(() => {
  return vi.fn();
});

const mockWindow = {
  location: {
    href: 'http://localhost:3000'
  }
};

const mockEventName = 'knapp klikket';
const mockEventData = {
  buttonName: 'Lagre',
  formName: 'Opprett bruker'
};

vi.mock('@navikt/nav-dekoratoren-moduler', () => ({
  logAmplitudeEvent: mockLogAmplitudeEvent,
  default: vi.fn()
}));
vi.mock('@navikt/next-logger', () => ({
  logger: {
    warn: mockLoggerWarn
  }
}));
vi.spyOn(global, 'window', 'get').mockImplementation(() => mockWindow);

const envSpy = vi.spyOn(env, 'amplitudeEnabled', 'get').mockImplementation(() => true);

const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

describe.skip('logEvent', () => {
  beforeEach(() => {
    consoleSpy.mockClear();
    mockLogAmplitudeEvent.mockClear();
    mockLoggerWarn.mockClear();
    envSpy.mockClear();
  });

  it('should log event data to Amplitude if amplitudeEnabled is true', () => {
    logEvent(mockEventName, mockEventData);
    expect(consoleSpy).not.toHaveBeenCalled();
    expect(mockLoggerWarn).not.toHaveBeenCalled();
    expect(mockLogAmplitudeEvent).toHaveBeenCalledWith({
      origin: 'spinntektsmelding-frontend',
      eventName: mockEventName,
      eventData: mockEventData
    });
  });

  it('should log event data to console if amplitudeEnabled is false', () => {
    // const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    logEvent(mockEventName, mockEventData);

    expect(mockLogAmplitudeEvent).not.toHaveBeenCalled();
    expect(mockLoggerWarn).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      `Logger ${mockEventName} - Event properties: ${JSON.stringify(mockEventData)}!`
    );

    consoleSpy.mockRestore();
  });

  it('should not log event data if window is undefined', () => {
    logEvent(mockEventName, mockEventData);

    expect(mockLogAmplitudeEvent).not.toHaveBeenCalled();
    expect(mockLoggerWarn).not.toHaveBeenCalled();
  });
});
