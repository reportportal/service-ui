import { InfoLine } from 'pages/inside/common/infoLine';
import { SelectedItems } from 'pages/inside/common/selectedItems';
import PropTypes from 'prop-types';
import { ActionPanel } from './actionPanel';

export const SuiteTestToolbar = ({
  parentItem,
  selectedItems,
  errors,
  onUnselect,
  onUnselectAll,
  onRefresh,
  onProceedValidItems,
  onIgnoreInAA,
  onIncludeInAA,
  debugMode,
}) => (
  <div>
    {!!selectedItems.length && (
      <SelectedItems
        selectedItems={selectedItems}
        errors={errors}
        onUnselect={onUnselect}
        onClose={onUnselectAll}
      />
    )}
    <ActionPanel
      debugMode={debugMode}
      hasErrors={selectedItems.some((item) => !!errors[item.id])}
      hasValidItems={selectedItems.length > Object.keys(errors).length}
      onProceedValidItems={onProceedValidItems}
      showBreadcrumbs={selectedItems.length === 0}
      onRefresh={onRefresh}
      selectedItems={selectedItems}
      onIgnoreInAA={onIgnoreInAA}
      onIncludeInAA={onIncludeInAA}
    />
    {parentItem && <InfoLine data={parentItem} />}
    <div />
  </div>
);
SuiteTestToolbar.propTypes = {
  selectedItems: PropTypes.arrayOf(PropTypes.object),
  errors: PropTypes.object,
  onUnselect: PropTypes.func,
  onUnselectAll: PropTypes.func,
  parentItem: PropTypes.object,
  onRefresh: PropTypes.func,
  onProceedValidItems: PropTypes.func,
  onIgnoreInAA: PropTypes.func,
  onIncludeInAA: PropTypes.func,
  debugMode: PropTypes.bool,
};
SuiteTestToolbar.defaultProps = {
  selectedItems: [],
  errors: {},
  onUnselect: () => {},
  onUnselectAll: () => {},
  parentItem: null,
  onRefresh: () => {},
  onProceedValidItems: () => {},
  onIgnoreInAA: () => {},
  onIncludeInAA: () => {},
  debugMode: false,
};
