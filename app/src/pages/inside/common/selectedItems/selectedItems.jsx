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
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import Parser from 'html-react-parser';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SelectedItem } from './selectedItem';
import styles from './selectedItems.scss';

const cx = classNames.bind(styles);

export const SelectedItems = ({ selectedItems, errors, onClose, onUnselect }) => (
  <div className={cx('selected-items')}>
    <div className={cx('content')}>
      <span className={cx('header')}>
        <FormattedMessage id="LaunchesPage.multipleSelectHeader" defaultMessage="Selected items:" />
      </span>
      <div className={cx('items-wrapper')}>
        <ScrollWrapper autoHeight autoHeightMax={120} hideTracksWhenNotNeeded>
          <div className={cx('list')}>
            {selectedItems.map((item) => (
              <div className={cx('item')} key={item.id}>
                <SelectedItem
                  name={item.name}
                  number={item.number}
                  error={errors[item.id]}
                  onUnselect={() => onUnselect(item)}
                />
              </div>
            ))}
          </div>
        </ScrollWrapper>
        {selectedItems.some((item) => !!errors[item.id]) && (
          <span className={cx('error-message')}>
            <FormattedMessage
              id="LaunchesPage.multiSelectError"
              defaultMessage="You cannot perform operation to invalid items"
            />
          </span>
        )}
      </div>
    </div>
    <div className={cx('close-icon')} onClick={onClose}>
      {Parser(CrossIcon)}
    </div>
  </div>
);
SelectedItems.propTypes = {
  selectedItems: PropTypes.arrayOf(PropTypes.object),
  onClose: PropTypes.func,
  onUnselect: PropTypes.func,
  errors: PropTypes.object,
};
SelectedItems.defaultProps = {
  selectedItems: [],
  errors: {},
  onClose: () => {},
  onUnselect: () => {},
};
