/*
 * Copyright 2019 EPAM Systems
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

import { defineMessages, injectIntl } from 'react-intl';
import track from 'react-tracking';
import { InputSwitcher } from 'components/inputs/inputSwitcher';
import { connectRouter } from 'common/utils';
import { namespaceSelector } from 'controllers/testItem';
import { PREDEFINED_FILTER_KEY, FILTER_COLLAPSED } from 'controllers/step';
import { STEP_PAGE_EVENTS } from 'components/main/analytics/events';

const messages = defineMessages({
  collapse: {
    id: 'StepGrid.showPreconditionMethods',
    defaultMessage: 'Collapse precondition methods',
  },
  expand: {
    id: 'StepGrid.hidePreconditionMethods',
    defaultMessage: 'Expand precondition methods',
  },
});

export const PredefinedFilterSwitcher = track()(
  connectRouter(
    (query) => ({
      predefinedFilter: query[PREDEFINED_FILTER_KEY],
    }),
    {
      toggleFilter: (value) => ({ [PREDEFINED_FILTER_KEY]: value ? FILTER_COLLAPSED : undefined }),
    },
    {
      namespaceSelector,
    },
  )(
    injectIntl(({ predefinedFilter, toggleFilter, intl, tracking }) => {
      const isCollapsed = predefinedFilter === FILTER_COLLAPSED;
      const title = isCollapsed
        ? intl.formatMessage(messages.expand)
        : intl.formatMessage(messages.collapse);
      return (
        <div title={title}>
          <InputSwitcher
            value={isCollapsed}
            onChange={(val) => {
              tracking.trackEvent(STEP_PAGE_EVENTS.METHOD_TYPE_SWITCHER);
              toggleFilter(val);
            }}
          />
        </div>
      );
    }),
  ),
);
