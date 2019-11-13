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

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { GhostButton } from 'components/buttons/ghostButton';
import styles from './actionsPopup.scss';

const cx = classNames.bind(styles);

export class ActionsPopup extends PureComponent {
  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        icon: PropTypes.any,
        title: PropTypes.string,
        onClick: PropTypes.func,
        disabled: PropTypes.bool,
      }),
    ),
  };

  static defaultProps = {
    items: [],
  };

  render() {
    const { items } = this.props;

    return (
      <div className={cx('actions-popup')}>
        {items.map((item) => (
          <div key={item.id} className={cx('action-item')}>
            <GhostButton
              onClick={item.onClick}
              icon={item.icon}
              disabled={item.disabled}
              transparentBorder
              notMinified
              large
            >
              {item.title}
            </GhostButton>
          </div>
        ))}
      </div>
    );
  }
}
