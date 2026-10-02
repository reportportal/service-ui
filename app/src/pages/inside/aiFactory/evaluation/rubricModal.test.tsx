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

import { CriterionKey } from 'types/aiFactory';

import { RubricModalContent } from './rubricModal';

jest.mock('@reportportal/ui-kit', () => ({ Modal: 'Modal' }));
jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({
    formatMessage: (message: { defaultMessage: string }) => message.defaultMessage,
  }),
}));
jest.mock('react-redux', () => ({ useDispatch: () => jest.fn() }));
jest.mock('common/utils', () => ({
  createClassnames:
    () =>
    (...classNames: string[]) =>
      classNames.filter(Boolean).join(' '),
}));
jest.mock('controllers/modal', () => ({
  hideModalAction: jest.fn(),
  withModal: () => (component: unknown) => component,
}));

describe('RubricModalContent', () => {
  test('uses the evaluation snapshot order and maximum scores', () => {
    const wrapper = shallow(
      <RubricModalContent
        data={{
          criteria: [
            { key: CriterionKey.COHERENCE, maxScore: 12 },
            { key: CriterionKey.ATOMICITY, maxScore: 18 },
          ],
        }}
      />,
    );

    const text = wrapper.text();
    expect(text.indexOf('Coherence')).toBeLessThan(text.indexOf('Atomicity'));
    expect(text).toContain('/12');
    expect(text).toContain('/18');
    expect(text).toContain('snapshot stored with this evaluation');
    expect(text).toContain('Criterion descriptions are not available');
  });
});
