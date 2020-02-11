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
import { injectIntl, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FilterName } from 'pages/inside/filtersPage/filterGrid/filterName';
import styles from './activeFilter.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  chooseFilter: {
    id: 'FiltersWrapper.chooseFilter',
    defaultMessage: 'Choose filter from the list below',
  },
});

@injectIntl
export class ActiveFilter extends PureComponent {
  static propTypes = {
    intl: PropTypes.object,
    touched: PropTypes.bool.isRequired,
    error: PropTypes.string,
    filter: PropTypes.object,
  };

  static defaultProps = {
    intl: {},
    filter: false,
    touched: false,
    error: '',
  };

  render() {
    const { intl, error, filter, touched } = this.props;

    return (
      <div className={cx('filters-wrapper')}>
        <span className={cx('filters-text', { error: error && touched })}>
          {filter ? (
            <FilterName filter={filter} showDesc={false} />
          ) : (
            intl.formatMessage(messages.chooseFilter)
          )}
        </span>
      </div>
    );
  }
}
