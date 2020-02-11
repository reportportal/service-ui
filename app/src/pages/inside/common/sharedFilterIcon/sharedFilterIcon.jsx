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
import classNames from 'classnames/bind';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import { withTooltip } from 'components/main/tooltips/tooltip';
import ShareIcon from 'common/img/share-icon-inline.svg';
import GlobeIcon from 'common/img/globe-icon-inline.svg';
import styles from './sharedFilterIcon.scss';
import { SharedFilterIconTooltip } from './sharedFilterIconTooltip';

const cx = classNames.bind(styles);

@injectIntl
@withTooltip({
  TooltipComponent: SharedFilterIconTooltip,
  data: { width: 'auto', align: 'left', noArrow: true },
})
export class SharedFilterIcon extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    share: PropTypes.bool,
    currentUser: PropTypes.string,
    owner: PropTypes.string,
  };

  static defaultProps = {
    share: false,
    currentUser: '',
    owner: undefined,
  };

  render() {
    const { currentUser, owner } = this.props;
    return (
      <div className={cx('share-block')}>
        <div className={cx('share-icon')}>
          {Parser(currentUser === owner || owner === undefined ? ShareIcon : GlobeIcon)}
        </div>
      </div>
    );
  }
}
