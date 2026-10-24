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

import { Step } from '../step';
import { StepsList } from './stepsList';

jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({
    formatMessage: (message: { defaultMessage: string }) => message.defaultMessage,
  }),
}));
jest.mock('common/utils', () => ({
  createClassnames:
    () =>
    (...names: string[]) =>
      names.join(' '),
}));
jest.mock('../step', () => ({ Step: 'mock-Step' }));

const step = {
  id: 900,
  instructions: 'Open Library',
  expectedResult: 'Library is displayed',
  attachments: [],
};

describe('StepsList review target identity', () => {
  test('forwards original native step number independently of filtered position and database ID', () => {
    const renderReviewControl = jest.fn(() => <button type="button">Comment</button>);
    const wrapper = shallow(
      <StepsList
        steps={[{ ...step, reviewStepNumber: 2 }]}
        renderReviewControl={renderReviewControl}
      />,
    );

    expect(renderReviewControl).toHaveBeenCalledWith(900, 2);
    expect(wrapper.find(Step).prop('index')).toBe(2);
    expect(wrapper.find(Step).prop('reviewControl')).toEqual(
      <button type="button">Comment</button>,
    );
  });

  test('preserves legacy display position and database identity when no native step number exists', () => {
    const renderReviewControl = jest.fn(() => <button type="button">Comment</button>);
    const wrapper = shallow(<StepsList steps={[step]} renderReviewControl={renderReviewControl} />);

    expect(renderReviewControl).toHaveBeenCalledWith(900, undefined);
    expect(wrapper.find(Step).prop('index')).toBe(1);
  });

  test('renders ordinary steps without review controls', () => {
    const wrapper = shallow(<StepsList steps={[step]} />);
    expect(wrapper.find(Step).prop('reviewControl')).toBeUndefined();
    expect(wrapper.find(Step).prop('instructions')).toBe(step.instructions);
  });
});
