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
    getPanelTitle: () => {},
  };

  onToggleActive = (enabled) => {
    const { onToggle, item, id } = this.props;

    onToggle(enabled, item, id);
  };

  render() {
    const { id, item, readOnly, onDelete, onEdit, onClone, getPanelTitle, isCloned } = this.props;
    return (
      <div className={cx('pattern-control-panel')}>
        <span className={cx('pattern-number')}>{id + 1}</span>
        <span className={cx('switcher', { disabled: readOnly })}>
          <InputSwitcher value={item.enabled} readOnly={readOnly} onChange={this.onToggleActive} />
        </span>
        <span className={cx('pattern-name')}>{getPanelTitle(item.name || id)}</span>
        {!readOnly && (
          <div className={cx('panel-buttons')}>
            <button className={cx('panel-button')} onClick={() => onEdit(item, id)}>
              {Parser(IconEdit)}
            </button>
            {isCloned && (
              <button className={cx('panel-button')} onClick={() => onClone(item)}>
                {Parser(IconDuplicate)}
              </button>
            )}
            <button className={cx('panel-button', 'filled')} onClick={() => onDelete(item, id)}>
              {Parser(IconDelete)}
            </button>
          </div>
        )}
      </div>
    );
  }
}
