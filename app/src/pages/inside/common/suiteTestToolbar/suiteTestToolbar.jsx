import { InfoLine } from 'pages/inside/common/infoLine';
import { SelectedItems } from 'pages/inside/common/selectedItems';
import PropTypes from 'prop-types';
import { ActionPanel } from './actionPanel';

export const SuiteTestToolbar = ({
  parentItem,
  selectedItems,
  onUnselect,
  onUnselectAll,
  onRefresh,
}) => (
  <div>
    {!!selectedItems.length && (
      <SelectedItems
        selectedItems={selectedItems}
        onUnselect={onUnselect}
        onClose={onUnselectAll}
      />
    )}
    <ActionPanel onRefresh={onRefresh} />
    {parentItem && <InfoLine data={parentItem} />}
    <div />
  </div>
);
SuiteTestToolbar.propTypes = {
  selectedItems: PropTypes.arrayOf(PropTypes.object),
  onUnselect: PropTypes.func,
  onUnselectAll: PropTypes.func,
  parentItem: PropTypes.object,
  onRefresh: PropTypes.func,
};
SuiteTestToolbar.defaultProps = {
  selectedItems: [],
  onUnselect: () => {},
  onUnselectAll: () => {},
  parentItem: null,
  onRefresh: () => {},
};
