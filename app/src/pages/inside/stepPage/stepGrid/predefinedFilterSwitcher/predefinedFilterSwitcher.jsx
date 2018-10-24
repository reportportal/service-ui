import { defineMessages, injectIntl } from 'react-intl';
import track from 'react-tracking';
import { InputSwitcher } from 'components/inputs/inputSwitcher';
import { connectRouter } from 'common/utils';
import { namespaceSelector } from 'controllers/testItem';
import { STEP_PAGE_EVENTS } from 'components/main/analytics/events';

const FILTER_COLLAPSED = 'collapsed';
const FILTER_KEY = 'predefined_filter';

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
      predefinedFilter: query[FILTER_KEY],
    }),
    {
      toggleFilter: (value) => ({ [FILTER_KEY]: value ? FILTER_COLLAPSED : undefined }),
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
