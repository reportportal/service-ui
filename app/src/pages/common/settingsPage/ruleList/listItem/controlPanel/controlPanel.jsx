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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import IconEdit from 'common/img/pencil-empty-inline.svg';
import IconDuplicate from 'common/img/duplicate-inline.svg';
import IconDelete from 'common/img/trashcan-inline.svg';
import IconOrderArrowUp from 'common/img/order-arrow-up-inline.svg';
import IconOrderArrowDown from 'common/img/order-arrow-down-inline.svg';
import IconDots from 'common/img/dots-inline.svg';
import { InputSwitcher } from 'components/inputs/inputSwitcher';
import classNames from 'classnames/bind';
import styles from './controlPanel.scss';

const cx = classNames.bind(styles);

export class ControlPanel extends Component {
  static propTypes = {
    item: PropTypes.object,
    id: PropTypes.number,
    readOnly: PropTypes.bool,
    onToggle: PropTypes.func,
    onDelete: PropTypes.func,
    onEdit: PropTypes.func,
    onClone: PropTypes.func,
    isCloned: PropTypes.bool,
    isMovable: PropTypes.bool,
    getPanelTitle: PropTypes.func,
  };

  static defaultProps = {
    item: {},
    id: 0,
    readOnly: false,
    onToggle: () => {},
    onDelete: () => {},
    onEdit: () => {},
    onClone: () => {},
    isCloned: false,
    isMovable: false,
    getPanelTitle: (name) => name,
  };

  constructor(props) {
    super(props);
    const { isCloned, isMovable } = props;

    this.actions = [
      {
        id: 'moveUp',
        icon: IconOrderArrowUp,
        action: this.moveUp,
        available: isMovable,
      },
      {
        id: 'moveDown',
        icon: IconOrderArrowDown,
        action: this.moveDown,
        available: isMovable,
      },
      {
        id: 'edit',
        action: this.editItem,
        icon: IconEdit,
        available: true,
      },
      {
        id: 'clone',
        icon: IconDuplicate,
        action: this.cloneItem,
        available: isCloned,
      },
      {
        id: 'delete',
        action: this.deleteItem,
        icon: IconDelete,
        available: true,
        filled: true,
      },
    ];
  }

  // TODO: implement
  moveUp = () => {};

  // TODO: implement
  moveDown = () => {};

  onToggleActive = (enabled) => {
    const { onToggle, item, id } = this.props;

    onToggle(enabled, item, id);
  };

  editItem = () => {
    const { id, item, onEdit } = this.props;

    onEdit(item, id);
  };

  deleteItem = () => {
    const { id, item, onDelete } = this.props;

    onDelete(item, id);
  };

  cloneItem = () => {
    const { item, onClone } = this.props;

    onClone(item);
  };

  render() {
    const { id, item, readOnly, getPanelTitle, isMovable } = this.props;
    const availableActions = this.actions.filter((action) => action.available);

    return (
      <div className={cx('rule-control-panel')}>
        {isMovable ? (
          <span className={cx('move-control')}>{Parser(IconDots)}</span>
        ) : (
          <span className={cx('rule-number')}>{id + 1}</span>
        )}
        <span className={cx('switcher', { disabled: readOnly })}>
          <InputSwitcher value={item.enabled} readOnly={readOnly} onChange={this.onToggleActive} />
        </span>
        <span className={cx('rule-name')}>{getPanelTitle(item.name || id)}</span>
        {!readOnly && (
          <div className={cx('rule-actions')}>
            {availableActions.map(({ icon, action, filled, id: key }) => (
              <button key={key} className={cx('rule-action', { filled })} onClick={action}>
                {Parser(icon)}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
}
