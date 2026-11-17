/* Copyright 2026 EPAM Systems
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may obtain a copy at http://www.apache.org/licenses/LICENSE-2.0
 */
import { act, Suspense, StrictMode, useLayoutEffect, startTransition } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useScopedTraceRequest } from './useScopedTraceRequest';

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((accept, decline) => {
    resolve = accept;
    reject = decline;
  });
  return { promise, resolve, reject };
};
let root: Root;
let container: HTMLDivElement;
let committed: ReturnType<typeof useScopedTraceRequest<string>>;
const initialResource = {};
const Harness = ({
  resource = initialResource,
  enabled = true,
  suspend,
}: {
  resource?: object;
  enabled?: boolean;
  suspend?: Promise<unknown>;
}) => {
  const request = useScopedTraceRequest<string>(resource, enabled);
  useLayoutEffect(() => {
    committed = request;
  });
  if (suspend !== undefined) {
    // Suspense deliberately throws a pending promise to simulate an abandoned render.
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw suspend;
  }
  let text = request.data ?? 'Idle';
  if (request.error) text = 'Failed';
  if (request.loading) text = 'Loading';
  return <output>{text}</output>;
};
const env = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };
const previous = env.IS_REACT_ACT_ENVIRONMENT;
beforeAll(() => {
  env.IS_REACT_ACT_ENVIRONMENT = true;
});
afterAll(() => {
  env.IS_REACT_ACT_ENVIRONMENT = previous;
});
beforeEach(() => {
  container = document.createElement('div');
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
});
const render = async (props: Parameters<typeof Harness>[0] = {}) => {
  await act(async () => {
    await Promise.resolve();
    root.render(<Harness {...props} />);
  });
};

test('locks duplicate commands, renders success, and allows a later refresh', async () => {
  await render();
  const pending = deferred<string>();
  const request = jest.fn(() => pending.promise);
  act(() => {
    committed.run(request);
    committed.run(request);
  });
  expect(request).toHaveBeenCalledTimes(1);
  expect(container.textContent).toBe('Loading');
  await act(async () => {
    await Promise.resolve();
    pending.resolve('First');
    await pending.promise;
  });
  expect(container.textContent).toBe('First');
  await act(async () => {
    await Promise.resolve();
    committed.run(() => Promise.resolve('Refreshed'));
  });
  expect(container.textContent).toBe('Refreshed');
});

test.each(['rejection', 'synchronous throw'])('captures %s and allows retry', async (failure) => {
  await render();
  await act(async () => {
    await Promise.resolve();
    committed.run(() => {
      if (failure === 'synchronous throw') throw new Error('Failed');
      return Promise.reject(new Error('Failed'));
    });
  });
  expect(container.textContent).toBe('Failed');
  await act(async () => {
    await Promise.resolve();
    committed.run(() => Promise.resolve('Recovered'));
  });
  expect(container.textContent).toBe('Recovered');
});

test.each(['resource', 'disabled', 'unmount'])(
  'aborts %s scope and ignores late callbacks and stale commands',
  async (change) => {
    await render();
    const oldRun = committed.run;
    const pending = deferred<string>();
    let signal!: AbortSignal;
    const onSuccess = jest.fn();
    act(() =>
      committed.run((nextSignal) => {
        signal = nextSignal;
        return pending.promise;
      }, onSuccess),
    );
    if (change === 'unmount') act(() => root.render(null));
    else await render(change === 'resource' ? { resource: {} } : { enabled: false });
    expect(signal.aborted).toBe(true);
    const staleRequest = jest.fn(() => Promise.resolve('Stale'));
    await act(async () => {
      await Promise.resolve();
      oldRun(staleRequest);
      pending.resolve('Late');
      await pending.promise;
    });
    expect(staleRequest).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(container.textContent).not.toContain('Late');
  },
);

test('an interrupted Suspense render does not invalidate the still-visible committed command', async () => {
  await act(async () => {
    await Promise.resolve();
    root.render(
      <Suspense fallback={<span>Fallback</span>}>
        <Harness />
      </Suspense>,
    );
  });
  const visibleRun = committed.run;
  const never = new Promise<never>(() => {});
  await act(async () => {
    await Promise.resolve();
    startTransition(() =>
      root.render(
        <Suspense fallback={<span>Fallback</span>}>
          <Harness resource={{}} suspend={never} />
        </Suspense>,
      ),
    );
  });
  expect(container.textContent).toBe('Idle');
  const onSuccess = jest.fn();
  await act(async () => {
    await Promise.resolve();
    visibleRun(() => Promise.resolve('Visible result'), onSuccess);
  });
  expect(container.textContent).toBe('Visible result');
  expect(onSuccess).toHaveBeenCalledWith('Visible result');
});

test('committed commands remain usable after StrictMode effect replay', async () => {
  await act(async () => {
    await Promise.resolve();
    root.render(
      <StrictMode>
        <Harness />
      </StrictMode>,
    );
  });
  await act(async () => {
    await Promise.resolve();
    committed.run(() => Promise.resolve('Strict success'));
  });
  expect(container.textContent).toBe('Strict success');
});
