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

import { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import RefreshIcon from 'common/img/refresh-inline.svg';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { breadcrumbsSelector, restorePathAction } from 'controllers/testItem';
import { Breadcrumbs, breadcrumbDescriptorShape } from 'components/main/breadcrumbs';
import { GhostMenuButton } from 'components/buttons/ghostMenuButton';
import { GhostButton } from 'components/buttons/ghostButton';
// import { createStepActionDescriptors } from 'pages/inside/common/utils';
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
@injectIntl
export class ActionPanel extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    onRefresh: PropTypes.func,
    breadcrumbs: PropTypes.arrayOf(breadcrumbDescriptorShape),
    restorePath: PropTypes.func,
    selectedItems: PropTypes.array,
  };

  static defaultProps = {
    onRefresh: () => {},
    breadcrumbs: [],
    restorePath: () => {},
    selectedItems: [],
  };

  getActionDescriptors = () => []; // createStepActionDescriptors

  render() {
    const {
      intl: { formatMessage },
      breadcrumbs,
      onRefresh,
      restorePath,
      selectedItems,
    } = this.props;
    const actionDescriptors = this.getActionDescriptors();

    return (
      <div className={cx('action-panel')}>
        <Breadcrumbs descriptors={breadcrumbs} onRestorePath={restorePath} />
        <div className={cx('action-button')}>
          <GhostButton icon={RefreshIcon} onClick={onRefresh}>
            <FormattedMessage id="Common.refresh" defaultMessage="Refresh" />
          </GhostButton>
        </div>
        <div className={cx('action-button', 'mobile-hidden')}>
          <GhostMenuButton
            title={formatMessage(COMMON_LOCALE_KEYS.ACTIONS)}
            items={actionDescriptors}
            disabled={!selectedItems.length}
          />
        </div>
      </div>
    );
  }
}
