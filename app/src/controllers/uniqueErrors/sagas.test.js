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

import { URLS } from 'common/urls';
import { FETCH_DATA } from 'controllers/fetch/constants';
import { fetchErrorAction, fetchSuccessAction, handleError } from 'controllers/fetch';
import { userRolesSelector } from 'controllers/pages';
import { launchSelector } from 'controllers/testItem';
import { projectKeySelector } from 'controllers/project';
import { COMMAND_GET_CLUSTERS } from 'controllers/plugins/uiExtensions/constants';
import { selectedClusterItemsSelector } from './clusterItems';
import { queryParametersSelector } from './selectors';
import { NAMESPACE } from './constants';
import { fetchClusters } from './sagas';

const PLUGIN = { name: 'analyzer', enabled: true };
const VIEWER = { userRole: 'USER', organizationRole: 'MEMBER', projectRole: 'VIEWER' };
const EDITOR = { userRole: 'USER', organizationRole: 'MEMBER', projectRole: 'EDITOR' };

// Drives the saga generator: answers selects from a map, calls and takes from the given stubs.
const drive = ({ roles, takes = [] }) => {
  const selects = new Map([
    [userRolesSelector, roles],
    [launchSelector, { id: 1 }],
    [projectKeySelector, 'demo'],
    [selectedClusterItemsSelector, []],
    [queryParametersSelector, {}],
  ]);
  const puts = [];
  const calls = [];
  const gen = fetchClusters();
  let step = gen.next();
  while (!step.done) {
    const effect = step.value;
    let input;
    if (effect.SELECT) {
      input = selects.get(effect.SELECT.selector);
    } else if (effect.CALL) {
      calls.push(effect.CALL);
      input = effect.CALL.fn.name === 'getPlugin' ? PLUGIN : undefined;
    } else if (effect.PUT) {
      puts.push(effect.PUT.action);
    } else if (effect.TAKE) {
      input = takes.shift();
    }
    step = gen.next(input);
  }
  return { fetches: puts.filter(({ type }) => type === FETCH_DATA), calls };
};

const pluginUrl = URLS.pluginsCommandsCommon(PLUGIN.name, COMMAND_GET_CLUSTERS);

describe('controllers/uniqueErrors/sagas fetchClusters', () => {
  test('uses the native clusters endpoint for a project viewer without asking the plugin', () => {
    const { fetches, calls } = drive({ roles: VIEWER });

    expect(calls.some(({ fn }) => fn.name === 'getPlugin')).toBe(false);
    expect(fetches).toHaveLength(1);
    expect(fetches[0].payload.url).toBe(URLS.clusterByLaunchId('demo', undefined, {}));
  });

  test('uses the plugin command for a project editor', () => {
    const { fetches } = drive({
      roles: EDITOR,
      takes: [fetchSuccessAction(NAMESPACE, { content: [] })],
    });

    expect(fetches).toHaveLength(1);
    expect(fetches[0].payload.url).toBe(pluginUrl);
    expect(fetches[0].meta.silent).toBe(true);
  });

  test('falls back to the native endpoint when the plugin command is forbidden', () => {
    const { fetches, calls } = drive({
      roles: EDITOR,
      takes: [fetchErrorAction(NAMESPACE, { errorCode: 4003, message: 'Forbidden' }, true)],
    });

    expect(fetches.map(({ payload }) => payload.url)).toEqual([
      pluginUrl,
      URLS.clusterByLaunchId('demo', undefined, {}),
    ]);
    expect(calls.some(({ fn }) => fn === handleError)).toBe(false);
  });

  test('reports other plugin command errors without a fallback', () => {
    const error = { errorCode: 5000, message: 'Analyzer is down' };
    const { fetches, calls } = drive({
      roles: EDITOR,
      takes: [fetchErrorAction(NAMESPACE, error, true)],
    });

    expect(fetches).toHaveLength(1);
    expect(calls.find(({ fn }) => fn === handleError).args).toEqual([
      fetchErrorAction(NAMESPACE, error),
    ]);
  });
});
