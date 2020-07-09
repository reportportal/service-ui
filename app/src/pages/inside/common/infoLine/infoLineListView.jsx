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
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { compositeAttributesSelector } from 'controllers/testItem';
import styles from './infoLine.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  filter: {
    id: 'InfoLineListView.filter',
    defaultMessage: 'Filter:',
  },
  filteredBy: {
    id: 'InfoLineListView.filteredBy',
    defaultMessage: 'Filtered by:',
  },
});

@connect((state) => ({
  compositeAttributes: compositeAttributesSelector(state),
}))
@injectIntl
export class InfoLineListView extends Component {
  static propTypes = {
    compositeAttributes: PropTypes.string,
    intl: PropTypes.object.isRequired,
    data: PropTypes.object,
  };
  static defaultProps = {
    compositeAttributes: '',
    currentUser: '',
    data: {},
  };

  render() {
    const {
      data,
      compositeAttributes,
      intl: { formatMessage },
    } = this.props;

    return (
      <div className={cx('info-line', 'info-line--list-view')}>
        {data && data.name && (
          <div className={cx('filter-holder')}>
            <span>{formatMessage(messages.filter)}</span>
            <span className={cx('filter-holder-name')} title={data.name}>
              {data.name}
            </span>
          </div>
        )}
        {compositeAttributes && (
          <div className={cx('composite-attributes')}>
            <span className={cx('label')}>{formatMessage(messages.filteredBy)}</span>
            <ul className={cx('list')}>
              {compositeAttributes.split(',').map((item) => {
                const attribute = item.split(':');

                return (
                  <li key={item} className={cx('item')} title={item}>
                    <span className={cx('item-child')}>{attribute[0]}</span>
                    <span className={cx('item-child')}>{`:${attribute[1]}`}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    );
  }
}
