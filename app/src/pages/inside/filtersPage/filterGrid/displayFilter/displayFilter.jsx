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

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { InputSwitcher } from 'components/inputs/inputSwitcher';
import styles from './displayFilter.scss';

const cx = classNames.bind(styles);

export const DisplayFilter = ({ userFilters, filter, onChangeDisplay, readOnly }) => {
  const isFilterDisplayed = !!userFilters.find((item) => item.id === filter.id);
  return (
    <Fragment>
      <div className={cx('mobile-label', 'display-label')}>
        <FormattedMessage id={'DisplayFilter.display'} defaultMessage={'Display on launches:'} />
      </div>
      <div className={cx('switcher-wrapper')}>
        <InputSwitcher
          value={!!isFilterDisplayed}
          onChange={() => onChangeDisplay(isFilterDisplayed, filter)}
          readOnly={readOnly}
        >
          <span className={cx('switcher-label')}>
            {isFilterDisplayed ? (
              <FormattedMessage
                id={'DisplayFilter.showOnLaunchesSwitcherOn'}
                defaultMessage={'ON'}
              />
            ) : (
              <FormattedMessage
                id={'DisplayFilter.showOnLaunchesSwitcherOff'}
                defaultMessage={'OFF'}
              />
            )}
          </span>
        </InputSwitcher>
      </div>
      <div className={cx('separator')} />
    </Fragment>
  );
};
DisplayFilter.propTypes = {
  userFilters: PropTypes.array,
  filter: PropTypes.object,
  onChangeDisplay: PropTypes.func,
  readOnly: PropTypes.bool,
};
DisplayFilter.defaultProps = {
  userFilters: [],
  filter: {},
  onChangeDisplay: () => {},
  readOnly: false,
};
