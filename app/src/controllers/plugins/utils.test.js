/* * Copyright 2020 EPAM Systems
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

import { clearSecretFields } from './utils';

describe('clearSecretFields util function', () => {
  const data = {
    integrationParameters: {
      key: 'value',
      anotherKey: 'anotherValue',
      oneMoreKey: 'oneMoreValue',
    },
  };

  test('should return unchanged data in case of empty secretFields', () => {
    expect(clearSecretFields(data)).toEqual(data);
  });

  test('should return unchanged data in case of unknown secretFields', () => {
    const secretFields = ['unknownField'];

    expect(clearSecretFields(data, secretFields)).toEqual(data);
  });

  test('should return updated data without fields from secretFields', () => {
    const secretFields = ['anotherKey', 'oneMoreKey'];
    const updatedData = {
      integrationParameters: {
        key: 'value',
      },
    };

    expect(clearSecretFields(data, secretFields)).toEqual(updatedData);
  });
});
