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

import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import PencilIcon from 'common/img/pencil-icon-inline.svg';
import { FilterOptions } from 'pages/inside/filtersPage/filterGrid/filterOptions';
import { FilterName } from 'pages/inside/filtersPage/filterGrid/filterName';
import { isEmptyObject } from 'common/utils';
import { injectIntl, defineMessages } from 'react-intl';
import styles from './lockedActiveFilter.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  filterNotFound: {
    id: 'FiltersControl.notFoundOnProject',
    defaultMessage: 'Filter is not found',
  },
});

@injectIntl
export class LockedActiveFilter extends PureComponent {
  static propTypes = {
    filter: PropTypes.object,
    onEdit: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  static defaultProps = {
    filter: {},
    onEdit: () => {},
  };

  render() {
    const { filter, onEdit, intl } = this.props;

    return (
      <div className={cx('locked-active-filter')}>
        <span className={cx('pencil-icon')} onClick={onEdit}>
          {Parser(PencilIcon)}
        </span>

        {isEmptyObject(filter) ? (
          <span className={cx('not-found')}>{intl.formatMessage(messages.filterNotFound)}</span>
        ) : (
          <Fragment>
            <FilterName
              userId={filter.owner}
              filter={filter}
              showDesc={false}
              editable={false}
              isBold
            />
            <FilterOptions entities={filter.conditions} sort={filter.orders} />
          </Fragment>
        )}
      </div>
    );
  }
}
