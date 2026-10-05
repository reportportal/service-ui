/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { mount, type ReactWrapper } from 'enzyme';
import { usePolling } from './usePolling';

interface HarnessProps {
  callback: () => unknown;
  intervalMs: number;
  enabled: boolean;
}

const Harness = ({ callback, intervalMs, enabled }: HarnessProps) => {
  usePolling(callback, intervalMs, enabled);
  return null;
};

describe('usePolling', () => {
  let wrapper: ReactWrapper | undefined;

  beforeEach(() => {
    jest.useFakeTimers();
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    jest.useRealTimers();
  });

  test('does not call the callback before the interval elapses', () => {
    const callback = jest.fn();
    wrapper = mount(<Harness callback={callback} intervalMs={3000} enabled />);

    jest.advanceTimersByTime(2999);

    expect(callback).not.toHaveBeenCalled();
  });

  test('calls the callback repeatedly every intervalMs while enabled', () => {
    const callback = jest.fn();
    wrapper = mount(<Harness callback={callback} intervalMs={3000} enabled />);

    jest.advanceTimersByTime(3000);
    expect(callback).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(6000);
    expect(callback).toHaveBeenCalledTimes(3);
  });

  test('does not poll at all when enabled is false', () => {
    const callback = jest.fn();
    wrapper = mount(<Harness callback={callback} intervalMs={3000} enabled={false} />);

    jest.advanceTimersByTime(9000);

    expect(callback).not.toHaveBeenCalled();
  });

  test('stops polling once enabled flips to false', () => {
    const callback = jest.fn();
    wrapper = mount(<Harness callback={callback} intervalMs={3000} enabled />);

    jest.advanceTimersByTime(3000);
    expect(callback).toHaveBeenCalledTimes(1);

    wrapper.setProps({ enabled: false });
    jest.advanceTimersByTime(9000);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('always invokes the latest callback, not a stale closure', () => {
    const firstCallback = jest.fn();
    const secondCallback = jest.fn();
    wrapper = mount(<Harness callback={firstCallback} intervalMs={3000} enabled />);

    wrapper.setProps({ callback: secondCallback });
    jest.advanceTimersByTime(3000);

    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).toHaveBeenCalledTimes(1);
  });

  test('clears the interval on unmount', () => {
    const callback = jest.fn();
    wrapper = mount(<Harness callback={callback} intervalMs={3000} enabled />);

    wrapper.unmount();
    wrapper = undefined;
    jest.advanceTimersByTime(9000);

    expect(callback).not.toHaveBeenCalled();
  });

  test('does not poll while the document is hidden and resumes on a later interval', () => {
    const callback = jest.fn();
    wrapper = mount(<Harness callback={callback} intervalMs={3000} enabled />);

    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    jest.advanceTimersByTime(3000);
    expect(callback).not.toHaveBeenCalled();

    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    jest.advanceTimersByTime(3000);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('does not start an overlapping poll while the previous promise is pending', async () => {
    let resolveRequest!: () => void;
    const request = new Promise<void>((resolve) => {
      resolveRequest = resolve;
    });
    const callback = jest.fn(() => request);
    wrapper = mount(<Harness callback={callback} intervalMs={3000} enabled />);

    jest.advanceTimersByTime(9000);
    expect(callback).toHaveBeenCalledTimes(1);

    await Promise.resolve().then(resolveRequest);
    jest.advanceTimersByTime(3000);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  test('releases the overlap guard after a rejected poll', async () => {
    const callback = jest
      .fn<Promise<void>, []>()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue(undefined);
    wrapper = mount(<Harness callback={callback} intervalMs={3000} enabled />);

    jest.advanceTimersByTime(3000);
    await Promise.resolve();
    jest.advanceTimersByTime(3000);

    expect(callback).toHaveBeenCalledTimes(2);
  });

  test('does not let an old request release the overlap guard for a newer polling generation', async () => {
    let resolveOldRequest!: () => void;
    let resolveNewRequest!: () => void;
    const oldRequest = new Promise<void>((resolve) => {
      resolveOldRequest = resolve;
    });
    const newRequest = new Promise<void>((resolve) => {
      resolveNewRequest = resolve;
    });
    const callback = jest
      .fn<Promise<void> | undefined, []>()
      .mockReturnValueOnce(oldRequest)
      .mockReturnValueOnce(newRequest);
    wrapper = mount(<Harness callback={callback} intervalMs={3000} enabled />);

    jest.advanceTimersByTime(3000);
    wrapper.setProps({ enabled: false });
    wrapper.setProps({ enabled: true });
    jest.advanceTimersByTime(3000);
    expect(callback).toHaveBeenCalledTimes(2);

    resolveOldRequest();
    await oldRequest;
    jest.advanceTimersByTime(3000);
    expect(callback).toHaveBeenCalledTimes(2);

    resolveNewRequest();
    await newRequest;
    jest.advanceTimersByTime(3000);
    expect(callback).toHaveBeenCalledTimes(3);
  });
});
