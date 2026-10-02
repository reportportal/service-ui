/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { shallow } from 'enzyme';

import { Scenario } from './scenario';

jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({
    formatMessage: (message: { defaultMessage: string }) => message.defaultMessage,
  }),
}));
jest.mock('common/utils', () => ({
  createClassnames:
    () =>
    (...classNames: string[]) =>
      classNames.join(' '),
}));

describe('Scenario review controls', () => {
  const content = {
    precondition: 'A signed-in user',
    instructions: 'Open the Library',
    expectedResult: 'The Library is displayed',
  };

  test('preserves the original section structure without review controls', () => {
    const wrapper = shallow(<Scenario {...content} />);

    expect(wrapper.find('.scenario__section')).toHaveLength(3);
    expect(wrapper.find('.scenario__review-block')).toHaveLength(0);
  });

  test('groups text targets only when review controls are provided', () => {
    const wrapper = shallow(
      <Scenario
        {...content}
        preconditionReviewControl={<button type="button">Precondition comment</button>}
        scenarioReviewControl={<button type="button">Scenario comment</button>}
      />,
    );

    expect(wrapper.find('.scenario__review-block')).toHaveLength(2);
    expect(wrapper.find('button')).toHaveLength(2);
  });
});
