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
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { SharedFilterIcon } from 'pages/inside/common/sharedFilterIcon';
import styles from './infoLine.scss';
import { Owner } from './owner';
import { Description } from './description';

const cx = classNames.bind(styles);
const messages = defineMessages({
  filter: {
    id: 'InfoLineListView.filter',
    defaultMessage: 'Filter',
  },
});

@injectIntl
export class InfoLineListView extends Component {
  static propTypes = {
    data: PropTypes.object,
    intl: intlShape.isRequired,
    currentUser: PropTypes.string,
  };
  static defaultProps = {
    currentUser: '',
    data: {},
  };

  render() {
    const { data, currentUser } = this.props;
    const { formatMessage } = this.props.intl;

    return (
      <div className={cx('info-line')}>
        {data &&
          data.name && (
            <div className={cx('filter-holder')}>
              {formatMessage(messages.filter)}: {data.name}
            </div>
          )}
        {data &&
          data.owner && (
            <div className={cx('icon-holder')}>
              <Owner owner={data.owner} />
            </div>
          )}
        {data &&
          data.share && (
            <div className={cx('icon-holder', 'info-line-icon-holder')}>
              <SharedFilterIcon share={data.share} currentUser={currentUser} owner={data.owner} />
            </div>
          )}
        {data &&
          data.description && (
            <div className={cx('icon-holder')}>
              <Description description={data.description} />
            </div>
          )}
      </div>
    );
  }
}
