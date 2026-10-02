/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import type { ReactNode } from 'react';
import { shallow } from 'enzyme';

import { CostLabel } from 'pages/inside/aiFactory/common';
import { AiDetailsSectionState } from 'pages/inside/aiFactory/common/aiDetailsSectionState';
import type { TestCaseAiLoadState } from 'pages/inside/aiFactory/lifecycle';

import { GenerationCost } from './generationCost';

jest.mock('@reportportal/ui-kit', () => ({ BubblesLoader: 'BubblesLoader', Button: 'Button' }));
jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({
    formatMessage: (
      message: { defaultMessage: string },
      values: Record<string, string | number> = {},
    ) =>
      Object.entries(values).reduce(
        (text, [key, value]) => text.replace(`{${key}}`, String(value)),
        message.defaultMessage,
      ),
  }),
}));
jest.mock('components/collapsibleSection', () => ({ CollapsibleSection: 'CollapsibleSection' }));

const reload = jest.fn();
const state: TestCaseAiLoadState = {
  data: {
    lifecycleHistory: [],
    pipelineLinks: [],
    cost: {
      approxTotal: 0.54,
      iterationShare: {
        iterationNumber: 1,
        amount: 0.32,
        iterationBaseCost: 1.6,
        casesCount: 5,
      },
      fixRounds: [{ round: 1, amount: 0.22 }],
      tokens: { input: 14000, cacheRead: 902000, cacheWrite: 30100, output: 14800 },
      model: 'default',
    },
  },
  isLoading: false,
  isError: false,
  reload,
};

describe('GenerationCost', () => {
  test('renders the total, iteration-share formula, fix rounds, tokens, and model', () => {
    const wrapper = shallow(<GenerationCost aiDetailsState={state} />);
    const content = shallow(
      <div>{wrapper.find(AiDetailsSectionState).prop('children') as ReactNode}</div>,
    );

    expect(wrapper.find(CostLabel)).toHaveLength(3);
    expect(
      wrapper.find('[data-automation-id="generation-cost-total"]').find(CostLabel).props(),
    ).toEqual({ amount: 0.54 });
    expect(content.text()).toContain('$1.60 ÷ 5 cases = $0.32');
    expect(content.text()).toContain('Fix round 1');
    expect(content.text()).toContain('Input 14.0k · Cache read 902.0k');
    expect(content.text()).toContain('Model: default');
  });

  test('passes loading and retry state to the shared state renderer', () => {
    const wrapper = shallow(
      <GenerationCost aiDetailsState={{ ...state, data: null, isLoading: true, isError: true }} />,
    );

    expect(wrapper.find(AiDetailsSectionState).props()).toMatchObject({
      isLoading: true,
      isError: true,
      loadingLabel: 'Loading generation cost',
      errorMessage: 'Generation cost could not be loaded',
      retryAutomationId: 'retry-generation-cost',
      onRetry: reload,
    });
  });

  test('passes no content to the collapsible section when cost is unavailable', () => {
    const wrapper = shallow(<GenerationCost aiDetailsState={{ ...state, data: null }} />);

    expect(wrapper.prop('children')).toBeNull();
  });
});
