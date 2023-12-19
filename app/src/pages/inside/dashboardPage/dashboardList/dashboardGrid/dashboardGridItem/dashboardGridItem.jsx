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
import track from 'react-tracking';
import { injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { PROJECT_DASHBOARD_ITEM_PAGE } from 'controllers/pages';
import { activeProjectKeySelector, activeProjectRoleSelector } from 'controllers/user';
import { Icon } from 'components/main/icon';
import { NavLink } from 'components/main/navLink';
import { projectOrganizationSlugSelector } from 'controllers/project';
import styles from './dashboardGridItem.scss';

const cx = classNames.bind(styles);

@injectIntl
@connect((state) => ({
  projectRole: activeProjectRoleSelector(state),
  organizationSlug: projectOrganizationSlugSelector(state),
  projectKey: activeProjectKeySelector(state),
}))
@track()
export class DashboardGridItem extends Component {
  static calculateGridPreviewBaseOnWidgetId(id) {
    return id % 14;
  }

  static propTypes = {
    projectKey: PropTypes.string.isRequired,
    intl: PropTypes.object.isRequired,
    item: PropTypes.object,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    nameEventInfo: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    organizationSlug: PropTypes.string.isRequired,
  };

  static defaultProps = {
    action: () => {},
    item: {},
    onEdit: () => {},
    onDelete: () => {},
    nameEventInfo: {},
  };

  editItem = (e) => {
    e.preventDefault();

    const { item, onEdit } = this.props;

    onEdit(item);
  };

  deleteItem = (e) => {
    e.preventDefault();

    const { item, onDelete } = this.props;

    onDelete(item);
  };

  render() {
    const { item, projectKey, organizationSlug } = this.props;
    const { name, description, owner, id } = item;

    return (
      <div className={cx('grid-view')}>
        <NavLink
          to={{
            type: PROJECT_DASHBOARD_ITEM_PAGE,
            payload: { projectKey, organizationSlug, dashboardId: id },
          }}
          className={cx('grid-view-inner')}
          onClick={() => this.props.tracking.trackEvent(this.props.nameEventInfo)}
        >
          <div className={cx('grid-cell', 'name')}>
            <h3 className={cx('dashboard-link')}>{name}</h3>
          </div>
          <div
            className={cx(
              'grid-cell',
              'description',
              'preview',
              `preview-${DashboardGridItem.calculateGridPreviewBaseOnWidgetId(id)}`,
            )}
          >
            <p>{description}</p>
          </div>
          <div className={cx('grid-cell', 'owner')}>{owner}</div>
          <div className={cx('grid-cell', 'edit')} onClick={this.editItem}>
            <Icon type="icon-pencil" />
          </div>
          <div className={cx('grid-cell', 'delete')} onClick={this.deleteItem}>
            <Icon type="icon-close" />
          </div>
        </NavLink>
      </div>
    );
  }
}
