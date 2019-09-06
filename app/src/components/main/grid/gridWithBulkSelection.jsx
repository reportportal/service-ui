import PropTypes from 'prop-types';
import { Grid } from './grid';

export class GridWithBulkSelection extends React.Component {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.object),
    selectedItems: PropTypes.arrayOf(PropTypes.object),
    onToggleSelection: PropTypes.func,
    onItemsSelect: PropTypes.func,
  };
  static defaultProps = {
    data: [],
    selectedItems: [],
    onToggleSelection: () => {},
    onItemsSelect: null,
  };

  selectItemsBefore = (targetItem) => {
    const { data: items, selectedItems, onItemsSelect, onToggleSelection } = this.props;
    const { id: targetItemId } = targetItem;
    const selectedIds = selectedItems.map((item) => item.id);

    if (selectedIds.includes(targetItem.id)) {
      onToggleSelection(targetItem);
      return;
    }

    const targetItemIndex = items.findIndex((item) => item.id === targetItemId);
    const itemsToSelect = [];

    for (let index = targetItemIndex - 1; index >= 0; index -= 1) {
      const currentItem = items[index];
      if (selectedIds.includes(currentItem.id)) {
        break;
      }
      itemsToSelect.push(currentItem);
    }
    if (itemsToSelect.length) {
      onItemsSelect([...itemsToSelect, items[targetItemIndex]]);
    } else {
      onToggleSelection(targetItem);
    }
  };

  itemSelectHandler = (event, value) => {
    if (event.ctrlKey || event.metaKey) {
      if (event.altKey) {
        this.selectItemsBefore(value);
        return;
      }
      this.props.onToggleSelection(value);
    }
  };

  render = () => (
    <Grid {...this.props} onClickRow={this.props.onItemsSelect ? this.itemSelectHandler : null} />
  );
}
