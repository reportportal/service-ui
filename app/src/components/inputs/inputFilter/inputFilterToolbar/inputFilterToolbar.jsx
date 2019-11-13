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
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import { BigButton } from 'components/buttons/bigButton';
import styles from './inputFilterToolbar.scss';

const cx = classNames.bind(styles);

export class InputFilterToolbar extends PureComponent {
  static propTypes = {
    onApply: PropTypes.func,
    onCancel: PropTypes.func,
    onClear: PropTypes.func,
  };
  static defaultProps = {
    onApply: () => {},
    onCancel: () => {},
    onClear: () => {},
  };

  render() {
    const { onApply, onClear, onCancel } = this.props;

    return (
      <div className={cx('input-filter-toolbar')}>
        <div className={cx('button-container', 'left')}>
          <BigButton color="white-two" onClick={onClear}>
            <span className={cx('button', 'clear-all-filters')}>
              <FormattedMessage
                id="InputFilterToolbar.clearAllfilters"
                defaultMessage="Clear all filters"
              />
            </span>
          </BigButton>
        </div>
        <div className={cx('button-splitter')}>
          <div className={cx('button-container', 'right')}>
            <BigButton color="white-two" onClick={onCancel}>
              <span className={cx('button', 'cancel')}>
                <FormattedMessage id="Common.cancel" defaultMessage="Cancel" />
              </span>
            </BigButton>
          </div>
          <div className={cx('button-container', 'right')}>
            <BigButton color="topaz" roundedCorners onClick={onApply}>
              <span className={cx('button', 'apply')}>
                <FormattedMessage id="InputFilterToolbar.apply" defaultMessage="Apply" />
              </span>
            </BigButton>
          </div>
        </div>
      </div>
    );
  }
}
