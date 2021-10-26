/*
 * Copyright 2021 EPAM Systems
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
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import RefreshIcon from 'common/img/refresh-inline.svg';
import { breadcrumbsSelector, restorePathAction } from 'controllers/testItem';
import { Breadcrumbs, breadcrumbDescriptorShape } from 'components/main/breadcrumbs';
import { GhostButton } from 'components/buttons/ghostButton';
import { ParentInfo } from 'pages/inside/common/infoLine/parentInfo';
import { GhostMenuButton } from 'components/buttons/ghostMenuButton';
import styles from './actionPanel.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    breadcrumbs: breadcrumbsSelector(state),
  }),
  {
    restorePath: restorePathAction,
  },
)
export class ActionPanel extends Component {
  static propTypes = {
    breadcrumbs: PropTypes.arrayOf(breadcrumbDescriptorShape),
    showBreadcrumbs: PropTypes.bool,
    parentItem: PropTypes.object,
    restorePath: PropTypes.func,
  };

  static defaultProps = {
    breadcrumbs: [],
    showBreadcrumbs: true,
    parentItem: null,
    restorePath: () => {},
  };

  render() {
    const { breadcrumbs, restorePath, showBreadcrumbs, parentItem } = this.props;

    return (
      <div className={cx('action-panel', { 'right-buttons-only': !showBreadcrumbs })}>
        {showBreadcrumbs && <Breadcrumbs descriptors={breadcrumbs} onRestorePath={restorePath} />}
        <div className={cx('action-buttons')}>
          {parentItem && <ParentInfo parentItem={parentItem} />}
          <div className={cx('action-button', 'mobile-hidden')}>
            <GhostMenuButton title={'Actions'} disabled />
          </div>
          <div className={cx('action-button')}>
            <GhostButton icon={RefreshIcon} disabled transparentBackground>
              <FormattedMessage id="Common.refresh" defaultMessage="Refresh" />
            </GhostButton>
          </div>
        </div>
      </div>
    );
  }
}
