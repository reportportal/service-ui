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
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import { ALIGN_CENTER, Grid } from 'components/main/grid';
import { FILTERS_PAGE_EVENTS } from 'components/main/analytics/events';
import { PROJECT_LAUNCHES_PAGE, urlOrganizationAndProjectSelector } from 'controllers/pages';
import { canWorkWithFilters } from 'common/utils/permissions';
import { userRolesType } from 'common/constants/projectRoles';
import { userRolesSelector } from 'controllers/user';
import { FilterName } from './filterName';
import { FilterOptions } from './filterOptions';
import { DisplayFilter } from './displayFilter';
import { DeleteFilterButton } from './deleteFilterButton';
import styles from './filterGrid.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  nameCol: { id: 'MembersGrid.nameCol', defaultMessage: 'Filter name' },
  optionsCol: { id: 'MembersGrid.optionsCol', defaultMessage: 'Options' },
  ownerCol: { id: 'MembersGrid.ownerCol', defaultMessage: 'Owner' },
  displayCol: { id: 'MembersGrid.displayCol', defaultMessage: 'Display on launches' },
  deleteCol: { id: 'MembersGrid.deleteCol', defaultMessage: 'Delete' },
});

const NameColumn = ({ className, value, customProps }) => {
  const { organizationSlug, projectSlug, editable = true } = customProps;
  return (
    <div className={cx('name-col', className)}>
      <FilterName
        userFilters={customProps.userFilters}
        filter={value}
        onClickName={customProps.onClickName}
        onEdit={customProps.onEdit}
        nameLink={{
          type: PROJECT_LAUNCHES_PAGE,
          payload: { projectSlug, filterId: value.id, organizationSlug },
        }}
        editable={editable}
        isLink
        isBold
      />
    </div>
  );
};
NameColumn.propTypes = {
  className: PropTypes.string.isRequired,
  value: PropTypes.object,
  customProps: PropTypes.object,
};
NameColumn.defaultProps = {
  value: {},
  customProps: {},
};

const OptionsColumn = ({ className, value }) => (
  <div className={cx('options-col', className)}>
    <FilterOptions entities={value.conditions} sort={value.orders} />
  </div>
);
OptionsColumn.propTypes = {
  className: PropTypes.string.isRequired,
  value: PropTypes.object,
};
OptionsColumn.defaultProps = {
  value: {},
};

const OwnerColumn = ({ className, value }) => (
  <div className={cx('owner-col', className)}>
    <div className={cx('mobile-label', 'owner-label')}>
      <FormattedMessage id={'OwnerColumn.owner'} defaultMessage={'Owner:'} />
    </div>
    {value.owner}
  </div>
);
OwnerColumn.propTypes = {
  className: PropTypes.string.isRequired,
  value: PropTypes.object,
};
OwnerColumn.defaultProps = {
  value: {},
};

const DisplayOnLaunchColumn = ({ className, value, customProps }) => {
  const { onChangeDisplay, userFilters, readOnly } = customProps;
  return (
    <div className={cx('display-col', className)}>
      <DisplayFilter
        filter={value}
        onChangeDisplay={onChangeDisplay}
        userFilters={userFilters}
        readOnly={readOnly}
      />
    </div>
  );
};

DisplayOnLaunchColumn.propTypes = {
  className: PropTypes.string.isRequired,
  value: PropTypes.object,
  customProps: PropTypes.object,
};
DisplayOnLaunchColumn.defaultProps = {
  value: {},
  customProps: {},
};

const DeleteColumn = ({ className, value, customProps }) => {
  const { disabled, onDelete } = customProps;

  return (
    <div className={cx('delete-col', className)}>
      <DeleteFilterButton filter={value} onDelete={onDelete} disabled={disabled} />
    </div>
  );
};
DeleteColumn.propTypes = {
  className: PropTypes.string.isRequired,
  value: PropTypes.object,
  customProps: PropTypes.object,
};
DeleteColumn.defaultProps = {
  value: {},
  customProps: {},
};

@connect((state) => ({
  slugs: urlOrganizationAndProjectSelector(state),
  userRoles: userRolesSelector(state),
}))
@injectIntl
@track()
export class FilterGrid extends Component {
  static propTypes = {
    filters: PropTypes.arrayOf(PropTypes.object),
    intl: PropTypes.object.isRequired,
    userFilters: PropTypes.arrayOf(PropTypes.object),
    onEdit: PropTypes.func,
    showFilterOnLaunchesAction: PropTypes.func,
    hideFilterOnLaunchesAction: PropTypes.func,
    onDelete: PropTypes.func,
    loading: PropTypes.bool,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    userRoles: userRolesType,
    slugs: PropTypes.shape({
      organizationSlug: PropTypes.string.isRequired,
      projectSlug: PropTypes.string.isRequired,
    }),
  };

  static defaultProps = {
    filters: [],
    userFilters: [],
    onEdit: () => {},
    showFilterOnLaunchesAction: () => {},
    hideFilterOnLaunchesAction: () => {},
    onDelete: () => {},
    userRoles: {},
    loading: false,
  };

  getColumns = () => {
    const { userRoles } = this.props;
    const editable = canWorkWithFilters(userRoles);

    return [
      {
        id: 'name',
        title: {
          full: this.props.intl.formatMessage(messages.nameCol),
        },
        component: NameColumn,
        customProps: {
          userFilters: this.props.userFilters,
          onClickName: (filter) => {
            const isActiveFilter = this.props.userFilters.find((item) => item.id === filter.id);
            if (!isActiveFilter) {
              this.props.showFilterOnLaunchesAction(filter);
            }
            this.props.tracking.trackEvent(FILTERS_PAGE_EVENTS.CLICK_FILTER_NAME);
          },
          onEdit: (filter) => {
            this.props.onEdit(filter);
            this.props.tracking.trackEvent(FILTERS_PAGE_EVENTS.CLICK_EDIT_ICON);
          },
          organizationSlug: this.props.slugs.organizationSlug,
          projectSlug: this.props.slugs.projectSlug,
          editable,
        },
      },
      {
        id: 'options',
        title: {
          full: this.props.intl.formatMessage(messages.optionsCol),
        },
        component: OptionsColumn,
      },
      {
        id: 'owner',
        title: {
          full: this.props.intl.formatMessage(messages.ownerCol),
        },
        component: OwnerColumn,
      },
      {
        id: 'display',
        title: {
          full: this.props.intl.formatMessage(messages.displayCol),
        },
        align: ALIGN_CENTER,
        component: DisplayOnLaunchColumn,
        customProps: {
          userFilters: this.props.userFilters,
          onChangeDisplay: (isFilterDisplayed, filter) => {
            isFilterDisplayed
              ? this.props.hideFilterOnLaunchesAction(filter)
              : this.props.showFilterOnLaunchesAction(filter);
            this.props.tracking.trackEvent(FILTERS_PAGE_EVENTS.CLICK_DISPLAY_ON_LAUNCH_SWITCHER);
          },
          readOnly: !editable,
        },
      },
      {
        id: 'delete',
        title: {
          full: this.props.intl.formatMessage(messages.deleteCol),
        },
        align: ALIGN_CENTER,
        component: DeleteColumn,
        customProps: {
          onDelete: (filter) => {
            this.props.onDelete(filter);
            this.props.tracking.trackEvent(FILTERS_PAGE_EVENTS.CLICK_DELETE_FILTER_ICON);
          },
          disabled: !editable,
        },
      },
    ];
  };

  render() {
    return (
      <Grid
        columns={this.getColumns()}
        data={this.props.filters}
        changeOnlyMobileLayout
        loading={this.props.loading}
      />
    );
  }
}
