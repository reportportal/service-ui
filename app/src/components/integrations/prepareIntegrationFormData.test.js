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

import { prepareGithubIntegrationFormData } from './prepareIntegrationFormData';

describe('prepareGithubIntegrationFormData', () => {
  it('should trim and drop empty organization strings', () => {
    const input = {
      clientId: 'id',
      restrictions: { organizations: ['  test1  ', '', '  ', 'test2'] },
    };
    expect(prepareGithubIntegrationFormData(input)).toEqual({
      clientId: 'id',
      restrictions: { organizations: ['test1', 'test2'] },
    });
  });

  it('should return a shallow copy when restrictions.organizations is not an array', () => {
    const input = { restrictions: { organizations: 'test' } };
    const result = prepareGithubIntegrationFormData(input);
    expect(result).toEqual(input);
    expect(result).not.toBe(input);
  });
});
