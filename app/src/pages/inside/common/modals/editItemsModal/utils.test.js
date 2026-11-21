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

import { DESCRIPTION_CREATE, DESCRIPTION_UPDATE, getDescriptionPayload } from './utils';

describe('getDescriptionPayload', () => {
  test('stores a replaced description without a leading newline', () => {
    expect(getDescriptionPayload(DESCRIPTION_CREATE, 'Release 6.0')).toEqual({
      action: DESCRIPTION_CREATE,
      comment: 'Release 6.0',
    });
  });

  test('appends an added description on a new line', () => {
    expect(getDescriptionPayload(DESCRIPTION_UPDATE, 'Release 6.0').comment).toBe('\nRelease 6.0');
  });
});
