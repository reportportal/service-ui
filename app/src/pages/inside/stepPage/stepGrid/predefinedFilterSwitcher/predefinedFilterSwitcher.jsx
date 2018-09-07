import { defineMessages, injectIntl } from 'react-intl';
import { InputSwitcher } from 'components/inputs/inputSwitcher';
import { connectRouter } from 'common/utils';
import { namespaceSelector } from 'controllers/testItem';

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

export const PredefinedFilterSwitcher = connectRouter(
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
  injectIntl(({ predefinedFilter, toggleFilter, intl }) => {
    const isCollapsed = predefinedFilter === FILTER_COLLAPSED;
    const title = isCollapsed
      ? intl.formatMessage(messages.expand)
      : intl.formatMessage(messages.collapse);
    return (
      <div title={title}>
        <InputSwitcher value={isCollapsed} onChange={toggleFilter} />
      </div>
    );
  }),
);
