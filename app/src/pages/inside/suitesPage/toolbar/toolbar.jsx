import { InfoLine } from 'pages/inside/common/infoLine';
import { SelectedItems } from 'pages/inside/common/selectedItems';
import PropTypes from 'prop-types';
import { ActionPanel } from './actionPanel';

export const Toolbar = ({ currentLaunch, selectedItems, onUnselect, onUnselectAll, onRefresh }) => (
  <div>
    {!!selectedItems.length && (
      <SelectedItems
        selectedItems={selectedItems}
        onUnselect={onUnselect}
        onClose={onUnselectAll}
      />
    )}
    <ActionPanel onRefresh={onRefresh} />
    {currentLaunch && <InfoLine data={currentLaunch} />}
    <div />
  </div>
);
Toolbar.propTypes = {
  selectedItems: PropTypes.arrayOf(PropTypes.object),
  onUnselect: PropTypes.func,
  onUnselectAll: PropTypes.func,
  currentLaunch: PropTypes.object,
  onRefresh: PropTypes.func,
};
Toolbar.defaultProps = {
  selectedItems: [],
  onUnselect: () => {},
  onUnselectAll: () => {},
  currentLaunch: {},
  onRefresh: () => {},
};
