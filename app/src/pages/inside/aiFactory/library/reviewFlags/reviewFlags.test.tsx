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

import { ReviewFlags } from './reviewFlags';

jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({
    formatMessage: (message: { id: string }, values?: { count?: number }) => {
      if (message.id === 'ReviewFlags.agentFixing') {
        return 'Agent fixing';
      }
      const count = values?.count ?? 0;
      return `${count} ${count === 1 ? 'comment' : 'comments'} not sent`;
    },
  }),
}));
jest.mock('common/utils', () => ({
  createClassnames: () => (...classNames: string[]) => classNames.filter(Boolean).join(' '),
}));

describe('ReviewFlags', () => {
  test.each([
    { count: 1, expected: '1 comment not sent' },
    { count: 3, expected: '3 comments not sent' },
  ])('renders the unsent-comment label for count $count', ({ count, expected }) => {
    const wrapper = shallow(<ReviewFlags review={{ unsentCommentsCount: count }} />);

    expect(wrapper.text()).toBe(expected);
  });

  test('renders the agent-fixing label for a running fix round', () => {
    const wrapper = shallow(
      <ReviewFlags
        review={{ unsentCommentsCount: 0, fixRound: { number: 2, status: 'RUNNING' } }}
      />,
    );

    expect(wrapper.text()).toBe('Agent fixing');
  });

  test('renders both flags when comments are unsent during a running fix', () => {
    const wrapper = shallow(
      <ReviewFlags
        review={{ unsentCommentsCount: 2, fixRound: { number: 2, status: 'RUNNING' } }}
      />,
    );

    expect(wrapper.text()).toContain('2 comments not sent');
    expect(wrapper.text()).toContain('Agent fixing');
  });

  test.each([
    { description: 'review data is absent', review: undefined },
    { description: 'the comment count is zero', review: { unsentCommentsCount: 0 } },
  ])('renders nothing when $description', ({ review }) => {
    const wrapper = shallow(<ReviewFlags review={review} />);

    expect(wrapper.find('div')).toHaveLength(0);
  });
});
