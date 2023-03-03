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

import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { GhostButton } from 'components/buttons/ghostButton';
import AddDashboardIcon from 'common/img/add-widget-inline.svg';
import styles from './emptyWidgetGrid.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  addNewWidget: {
    id: 'DashboardItemPage.addNewWidget',
    defaultMessage: 'Add new widget',
  },
  dashboardEmptyText: {
    id: 'DashboardItemPage.dashboardEmptyText',
    defaultMessage: 'Add your first widget to analyse statistics',
  },
  notMyDashboardEmptyHeader: {
    id: 'DashboardItemPage.notMyDashboardEmptyHeader',
    defaultMessage: 'There are no widgets on this dashboard',
  },
});

@injectIntl
export class EmptyWidgetGrid extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    action: PropTypes.func,
    isDisable: PropTypes.bool,
  };

  static defaultProps = {
    action: () => {},
    isDisable: false,
  };

  render() {
    const { action, intl, isDisable } = this.props;
    const isAddWidgetEnabled = !isDisable;

    return (
      <div className={cx('empty-widget')}>
        <div className={cx('empty-dashboard', { 'add-enabled': isAddWidgetEnabled })} />
        <p className={cx('empty-widget-headline')}>
          {intl.formatMessage(messages.notMyDashboardEmptyHeader)}
        </p>
        {isAddWidgetEnabled && (
          <Fragment>
            <p className={cx('empty-widget-text')}>
              {intl.formatMessage(messages.dashboardEmptyText)}
            </p>
            <div className={cx('empty-widget-content')}>
              <GhostButton icon={AddDashboardIcon} onClick={action}>
                {intl.formatMessage(messages.addNewWidget)}
              </GhostButton>
            </div>
          </Fragment>
        )}
      </div>
    );
  }
}
