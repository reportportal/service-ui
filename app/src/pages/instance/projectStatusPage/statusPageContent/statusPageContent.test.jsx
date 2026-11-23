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

import { shallow } from 'enzyme';
import { fetch } from 'common/utils';
import { statusPageWidgets, activityItem } from './statusPageWidgets';
import { StatusPageContent } from './statusPageContent';

// The real widgets pull in chart libraries; the page logic only needs their ids and URLs.
jest.mock('./statusPageWidgets', () => {
  const widget = (id, source = id) => ({
    id,
    source,
    title: { id, defaultMessage: id },
    getUrl: (projectKey, interval) => `/${projectKey}/${id}?interval=${interval}`,
    component: () => null,
  });
  return {
    statusPageWidgets: [
      widget('general'),
      { ...widget('owners', 'general'), getUrl: undefined },
      widget('lastLaunch'),
    ],
    activityItem: widget('activities'),
  };
});

jest.mock('common/utils', () => ({
  ...jest.requireActual('common/utils'),
  fetch: jest.fn(),
}));

const intl = { formatMessage: ({ defaultMessage }) => defaultMessage };
const Content = StatusPageContent.WrappedComponent;
const widgetsWithUrls = [...statusPageWidgets.filter((item) => item.getUrl), activityItem];

const render = (props = {}) =>
  shallow(<Content intl={intl} projectKey="demo" interval="3M" {...props} />, {
    disableLifecycleMethods: true,
  });

describe('StatusPageContent', () => {
  beforeEach(() => {
    fetch.mockReset();
  });

  test('requests all widgets in parallel', async () => {
    const resolvers = [];
    fetch.mockImplementation(() => new Promise((resolve) => resolvers.push(resolve)));
    const wrapper = render();

    const loading = wrapper.instance().fetchData();
    expect(fetch).toHaveBeenCalledTimes(widgetsWithUrls.length);
    resolvers.forEach((resolve) => resolve({}));
    await loading;
  });

  test('shows an error only for the widget whose request failed', async () => {
    const failedId = widgetsWithUrls[0].id;
    fetch.mockImplementation((url) =>
      url === widgetsWithUrls[0].getUrl('demo', '3M')
        ? Promise.reject(new Error('500'))
        : Promise.resolve({ ok: true }),
    );
    const wrapper = render();

    await wrapper.instance().fetchData();

    const { widgetsData, failedSources, loadingSources } = wrapper.state();
    expect(Object.values(loadingSources).some(Boolean)).toBe(false);
    expect(Object.keys(failedSources).filter((id) => failedSources[id])).toEqual([failedId]);
    expect(Object.keys(widgetsData)).toHaveLength(widgetsWithUrls.length - 1);
    expect(wrapper.find('.status-page-error').length).toBeGreaterThan(0);
  });

  test('shows settled sources while another source is still loading', async () => {
    const [general, lastLaunch] = widgetsWithUrls;
    fetch.mockImplementation((url) => {
      if (url === general.getUrl('demo', '3M')) {
        return Promise.resolve({ ok: true });
      }
      if (url === lastLaunch.getUrl('demo', '3M')) {
        return Promise.reject(new Error('500'));
      }
      return new Promise(() => {});
    });
    const wrapper = render();

    wrapper.instance().fetchData();
    await new Promise((resolve) => setTimeout(resolve, 0));
    wrapper.update();

    const { widgetsData, failedSources, loadingSources } = wrapper.state();
    expect(widgetsData).toEqual({ [general.id]: { ok: true } });
    expect(failedSources[lastLaunch.id]).toBe(true);
    expect(loadingSources).toEqual({
      [general.id]: false,
      [lastLaunch.id]: false,
      [activityItem.id]: true,
    });
    expect(wrapper.find('.status-page-error')).toHaveLength(1);
    expect(wrapper.find('.status-page-spinner-wrapper')).toHaveLength(1);
  });

  test('ignores results of a request superseded by a newer interval', async () => {
    const pending = [];
    fetch.mockImplementation(
      (url) =>
        new Promise((resolve) => {
          pending.push(() => resolve({ url }));
        }),
    );
    const wrapper = render();

    const first = wrapper.instance().fetchData();
    wrapper.setProps({ interval: '6M' });
    const second = wrapper.instance().fetchData();
    const firstBatch = pending.splice(0, widgetsWithUrls.length);
    pending.forEach((resolve) => resolve());
    await second;
    firstBatch.forEach((resolve) => resolve());
    await first;

    const activity = wrapper.state().widgetsData[activityItem.id];
    expect(activity).toEqual({ url: activityItem.getUrl('demo', '6M') });
  });
});
