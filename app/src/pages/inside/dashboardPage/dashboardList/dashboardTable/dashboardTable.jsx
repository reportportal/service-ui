/*
 * Copyright 2025 EPAM Systems
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

import React, { Component, Fragment } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { Grid, ALIGN_CENTER } from 'components/main/grid';
import { EmptyDashboards } from 'pages/inside/dashboardPage/dashboardList/EmptyDashboards';
import { getDashboardItemPageLinkSelector } from 'controllers/dashboard';
import { messages } from './messages';
import {
  NameColumn,
  DescriptionColumn,
  OwnerColumn,
  EditColumn,
  DeleteColumn,
  DuplicateColumn,
} from './dashboardTableColumns';
import styles from './dashboardTable.scss';

const cx = classNames.bind(styles);

@injectIntl
@connect((state) => ({
  getDashboardItemPageLink: getDashboardItemPageLinkSelector(state),
}))
export class DashboardTable extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    getDashboardItemPageLink: PropTypes.func.isRequired,
    onDeleteItem: PropTypes.func,
    onEditItem: PropTypes.func,
    onDuplicate: PropTypes.func,
    onAddItem: PropTypes.func,
    dashboardItems: PropTypes.array,
    loading: PropTypes.bool,
    filter: PropTypes.string,
  };

  static defaultProps = {
    onDeleteItem: () => {},
    onEditItem: () => {},
    onDuplicate: () => {},
    onAddItem: () => {},
    dashboardItems: [],
    loading: false,
    filter: '',
  };

  getTableColumns() {
    const { onDeleteItem, onEditItem, onDuplicate, intl, getDashboardItemPageLink } = this.props;

    return [
      {
        title: {
          full: intl.formatMessage(messages.dashboardName),
          short: intl.formatMessage(messages.dashboardName),
        },
        component: NameColumn,
        customProps: {
          getLink: getDashboardItemPageLink,
        },
      },
      {
        title: {
          full: intl.formatMessage(messages.description),
          short: intl.formatMessage(messages.description),
        },
        component: DescriptionColumn,
        formatter: (value) => value.description,
      },
      {
        title: {
          full: intl.formatMessage(messages.owner),
          short: intl.formatMessage(messages.owner),
        },
        formatter: (value) => value.owner,
        component: OwnerColumn,
      },
      {
        title: {
          full: intl.formatMessage(messages.duplicate),
          short: intl.formatMessage(messages.duplicate),
        },
        component: DuplicateColumn,
        customProps: {
          onDuplicate,
        },
        align: ALIGN_CENTER,
      },
      {
        title: {
          full: intl.formatMessage(messages.edit),
          short: intl.formatMessage(messages.edit),
        },
        component: EditColumn,
        customProps: {
          onEdit: onEditItem,
        },
        align: ALIGN_CENTER,
      },
      {
        title: {
          full: intl.formatMessage(messages.deleteDashboard),
          short: intl.formatMessage(messages.deleteDashboard),
        },
        component: DeleteColumn,
        customProps: {
          onDelete: onDeleteItem,
        },
        align: ALIGN_CENTER,
      },
    ];
  }

  render() {
    const { dashboardItems, loading, onAddItem, filter } = this.props;

    return (
      <Fragment>
        <Grid
          className={cx('dashboard-table')}
          columns={this.getTableColumns()}
          data={dashboardItems}
          loading={loading}
        />
        {dashboardItems.length === 0 && <EmptyDashboards filter={filter} action={onAddItem} />}
      </Fragment>
    );
  }
}
