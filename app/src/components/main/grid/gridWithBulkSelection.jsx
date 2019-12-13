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
