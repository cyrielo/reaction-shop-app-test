import { renderHook, act } from '@testing-library/react-native';
import { Dimensions, EmitterSubscription, ScaledSize } from 'react-native';
import useMediaQuery from '../../src/hooks/useMediaQuery';

// Typed handles for mocked Dimensions methods
const mockGet = jest.spyOn(Dimensions, 'get');
const mockAddEventListener = jest.spyOn(Dimensions, 'addEventListener');

// Helper: create a fake subscription cast to the expected EmitterSubscription shape
function makeFakeSubscription(): EmitterSubscription {
  return { remove: jest.fn() } as unknown as EmitterSubscription;
}

// Helper: set the initial window width returned by Dimensions.get
function mockWindowWidth(width: number): void {
  mockGet.mockReturnValue({ width, height: 800, scale: 1, fontScale: 1 });
}

// Capture the last registered 'change' handler so tests can fire dimension events
type DimensionChangeHandler = (dims: { window: ScaledSize; screen: ScaledSize }) => void;
let capturedHandler: DimensionChangeHandler | null = null;

beforeEach(() => {
  capturedHandler = null;
  mockGet.mockReturnValue({ width: 375, height: 800, scale: 1, fontScale: 1 });
  mockAddEventListener.mockImplementation(
    (_event: 'change', handler: DimensionChangeHandler): EmitterSubscription => {
      capturedHandler = handler;
      return makeFakeSubscription();
    },
  );
});

afterEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------

describe('useMediaQuery — initial breakpoint', () => {
  it('returns "sm" for widths below 480', () => {
    mockWindowWidth(375);
    const { result } = renderHook(() => useMediaQuery());
    expect(result.current.breakpoint).toBe('sm');
  });

  it('returns "sm" for width exactly 0', () => {
    mockWindowWidth(0);
    const { result } = renderHook(() => useMediaQuery());
    expect(result.current.breakpoint).toBe('sm');
  });

  it('returns "sm" for width exactly 479', () => {
    mockWindowWidth(479);
    const { result } = renderHook(() => useMediaQuery());
    expect(result.current.breakpoint).toBe('sm');
  });

  it('returns "md" for width exactly 480', () => {
    mockWindowWidth(480);
    const { result } = renderHook(() => useMediaQuery());
    expect(result.current.breakpoint).toBe('md');
  });

  it('returns "md" for widths in the 480–767 range', () => {
    mockWindowWidth(600);
    const { result } = renderHook(() => useMediaQuery());
    expect(result.current.breakpoint).toBe('md');
  });

  it('returns "md" for width exactly 767', () => {
    mockWindowWidth(767);
    const { result } = renderHook(() => useMediaQuery());
    expect(result.current.breakpoint).toBe('md');
  });

  it('returns "lg" for width exactly 768', () => {
    mockWindowWidth(768);
    const { result } = renderHook(() => useMediaQuery());
    expect(result.current.breakpoint).toBe('lg');
  });

  it('returns "lg" for widths in the 768–1278 range', () => {
    mockWindowWidth(1024);
    const { result } = renderHook(() => useMediaQuery());
    expect(result.current.breakpoint).toBe('lg');
  });

  it('returns "lg" for width exactly 1278', () => {
    mockWindowWidth(1278);
    const { result } = renderHook(() => useMediaQuery());
    expect(result.current.breakpoint).toBe('lg');
  });

  it('returns "xlg" for widths above 1279', () => {
    mockWindowWidth(1440);
    const { result } = renderHook(() => useMediaQuery());
    expect(result.current.breakpoint).toBe('xlg');
  });

  it('returns "xlg" for width exactly 1280', () => {
    mockWindowWidth(1280);
    const { result } = renderHook(() => useMediaQuery());
    expect(result.current.breakpoint).toBe('xlg');
  });
});

// ---------------------------------------------------------------------------

describe('useMediaQuery — responds to dimension changes', () => {
  it('updates breakpoint when window width changes to a different tier', () => {
    mockWindowWidth(375); // starts sm
    const { result } = renderHook(() => useMediaQuery());
    expect(result.current.breakpoint).toBe('sm');

    act(() => {
      capturedHandler?.({ window: { width: 600, height: 800, scale: 1, fontScale: 1 }, screen: { width: 600, height: 800, scale: 1, fontScale: 1 } });
    });

    expect(result.current.breakpoint).toBe('md');
  });

  it('updates from md to lg on resize', () => {
    mockWindowWidth(600);
    const { result } = renderHook(() => useMediaQuery());

    act(() => {
      capturedHandler?.({ window: { width: 900, height: 800, scale: 1, fontScale: 1 }, screen: { width: 900, height: 800, scale: 1, fontScale: 1 } });
    });

    expect(result.current.breakpoint).toBe('lg');
  });

  it('updates from lg to xlg on resize', () => {
    mockWindowWidth(1024);
    const { result } = renderHook(() => useMediaQuery());

    act(() => {
      capturedHandler?.({ window: { width: 1440, height: 800, scale: 1, fontScale: 1 }, screen: { width: 1440, height: 800, scale: 1, fontScale: 1 } });
    });

    expect(result.current.breakpoint).toBe('xlg');
  });

  it('updates from xlg back down to sm on resize', () => {
    mockWindowWidth(1440);
    const { result } = renderHook(() => useMediaQuery());

    act(() => {
      capturedHandler?.({ window: { width: 320, height: 800, scale: 1, fontScale: 1 }, screen: { width: 320, height: 800, scale: 1, fontScale: 1 } });
    });

    expect(result.current.breakpoint).toBe('sm');
  });

  it('registers a "change" event listener on mount', () => {
    mockWindowWidth(375);
    renderHook(() => useMediaQuery());
    expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});

// ---------------------------------------------------------------------------

describe('useMediaQuery — cleanup', () => {
  it('removes the dimension listener on unmount', () => {
    const fakeSubscription = makeFakeSubscription();
    mockAddEventListener.mockReturnValueOnce(fakeSubscription);
    mockWindowWidth(375);

    const { unmount } = renderHook(() => useMediaQuery());
    unmount();

    expect(fakeSubscription.remove).toHaveBeenCalled();
  });
});
