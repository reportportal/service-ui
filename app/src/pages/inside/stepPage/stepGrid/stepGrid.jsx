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

import React, { Component, Fragment } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { Grid } from 'components/main/grid';
import { AbsRelTime } from 'components/main/absRelTime';
import { groupItemsByParent } from 'controllers/testItem';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { formatMethodType } from 'common/utils/localizationUtils';
import { FAILED } from 'common/constants/testStatuses';
import {
  ENTITY_METHOD_TYPE,
  ENTITY_STATUS,
  ENTITY_START_TIME,
  ENTITY_DEFECT_TYPE,
  CONDITION_HAS,
  ENTITY_ATTRIBUTE,
} from 'components/filterEntities/constants';
import { NoItemMessage } from 'components/main/noItemMessage';
import { getChangeItemStatusEvent } from 'components/main/analytics/events';
import { formatAttribute } from 'common/utils/attributeUtils';
import { StatusDropdown } from 'pages/inside/common/statusDropdown/statusDropdown';
import { PredefinedFilterSwitcher } from './predefinedFilterSwitcher';
import { DefectType } from './defectType';
import { GroupHeader } from './groupHeader';
import { ItemInfoWithRetries } from './itemInfoWithRetries';
import styles from './stepGrid.scss';

const cx = classNames.bind(styles);

const MethodTypeColumn = ({ className, value, customProps: { formatMessage } }) => (
  <div className={cx('method-type-col', className)}>
    {formatMethodType(formatMessage, value.type)}
  </div>
);
MethodTypeColumn.propTypes = {
  className: PropTypes.string,
  value: PropTypes.object,
  customProps: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};
MethodTypeColumn.defaultProps = {
  className: null,
  value: {},
};

const NameColumn = ({ className, customProps, ...rest }) => (
  <div className={cx('name-col', className, customProps.className)}>
    <ItemInfoWithRetries
      {...rest}
      customProps={{
        ...customProps,
        ownLinkParams: { ...customProps.ownLinkParams, testItem: rest.value },
      }}
    />
  </div>
);
NameColumn.propTypes = {
  className: PropTypes.string,
  customProps: PropTypes.object,
};
NameColumn.defaultProps = {
  className: null,
  customProps: {},
};

const StatusColumn = ({ className, value, customProps: { onChange, fetchFunc } }) => {
  const { id, status, attributes, description } = value;
  return (
    <div className={cx('status-col', className)}>
      <StatusDropdown
        itemId={id}
        status={status}
        attributes={attributes}
        description={description}
        onChange={onChange}
        fetchFunc={fetchFunc}
      />
    </div>
  );
};
StatusColumn.propTypes = {
  className: PropTypes.string,
  value: PropTypes.object,
  customProps: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
    onChange: PropTypes.func,
    fetchFunc: PropTypes.func,
  }).isRequired,
};
StatusColumn.defaultProps = {
  className: null,
  value: {},
};

const StartTimeColumn = ({ className, value }) => (
  <div className={cx('start-time-col', className)}>
    <AbsRelTime startTime={value.startTime} />
  </div>
);
StartTimeColumn.propTypes = {
  className: PropTypes.string,
  value: PropTypes.object,
};
StartTimeColumn.defaultProps = {
  className: null,
  value: {},
};

const DefectTypeColumn = ({
  className,
  value,
  customProps: { onEdit, onUnlinkSingleTicket, events },
}) => (
  <div className={cx('defect-type-col', className)}>
    {value.issue && value.issue.issueType && (
      <DefectType
        issue={value.issue}
        patternTemplates={value.patternTemplates}
        onEdit={() => onEdit(value)}
        onRemove={onUnlinkSingleTicket(value)}
        events={events}
      />
    )}
  </div>
);
DefectTypeColumn.propTypes = {
  className: PropTypes.string,
  value: PropTypes.object,
  customProps: PropTypes.shape({
    onEdit: PropTypes.func.isRequired,
    onUnlinkSingleTicket: PropTypes.func.isRequired,
    events: PropTypes.object,
  }).isRequired,
};
DefectTypeColumn.defaultProps = {
  className: null,
  value: {},
};

const PredefinedFilterSwitcherCell = ({ className }) => (
  <div className={cx('filter-switcher-col', className)}>
    <PredefinedFilterSwitcher />
  </div>
);
PredefinedFilterSwitcherCell.propTypes = {
  className: PropTypes.string,
};
PredefinedFilterSwitcherCell.defaultProps = {
  className: null,
};

@injectIntl
@track()
export class StepGrid extends Component {
  static propTypes = {
    data: PropTypes.array,
    intl: PropTypes.object.isRequired,
    selectedItems: PropTypes.array,
    onItemSelect: PropTypes.func,
    onItemsSelect: PropTypes.func,
    onAllItemsSelect: PropTypes.func,
    loading: PropTypes.bool,
    listView: PropTypes.bool,
    onFilterClick: PropTypes.func,
    onEditDefect: PropTypes.func,
    onUnlinkSingleTicket: PropTypes.func,
    events: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    onEditItem: PropTypes.func,
    onChangeSorting: PropTypes.func,
    sortingColumn: PropTypes.string,
    sortingDirection: PropTypes.string,
    rowHighlightingConfig: PropTypes.shape({
      onGridRowHighlighted: PropTypes.func,
      isGridRowHighlighted: PropTypes.bool,
      highlightedRowId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
    onStatusUpdate: PropTypes.func.isRequired,
    modifyColumnsFunc: PropTypes.func,
  };

  static defaultProps = {
    data: [],
    selectedItems: [],
    onItemSelect: () => {},
    onItemsSelect: () => {},
    onAllItemsSelect: () => {},
    loading: false,
    listView: false,
    onFilterClick: () => {},
    onEditDefect: () => {},
    onUnlinkSingleTicket: () => {},
    onEditItem: () => {},
    events: {},
    onChangeSorting: () => {},
    sortingColumn: null,
    sortingDirection: null,
    rowHighlightingConfig: PropTypes.shape({
      onGridRowHighlighted: () => {},
      isGridRowHighlighted: false,
      highlightedRowId: null,
    }),
    modifyColumnsFunc: null,
  };

  constructor(props) {
    super(props);
    const {
      intl: { formatMessage },
      tracking,
      events,
      onUnlinkSingleTicket,
      onEditItem,
      onEditDefect,
      onStatusUpdate,
      modifyColumnsFunc,
    } = props;
    this.columns = [
      {
        id: 'predefinedFilterSwitcher',
        title: {
          component: PredefinedFilterSwitcherCell,
        },
        formatter: () => {},
      },
      {
        id: ENTITY_METHOD_TYPE,
        title: {
          full: 'method type',
        },
        sortable: true,
        component: MethodTypeColumn,
        customProps: {
          formatMessage,
        },
        withFilter: true,
        filterEventInfo: events.METHOD_TYPE_FILTER,
        sortingEventInfo: events.METHOD_TYPE_SORTING,
      },
      {
        id: 'name',
        title: {
          full: 'name',
        },
        sortable: true,
        component: NameColumn,
        maxHeight: 170,
        customProps: {
          onEditItem,
          onClickAttribute: this.handleAttributeFilterClick,
          events,
        },
        withFilter: true,
        filterEventInfo: events.NAME_FILTER,
        sortingEventInfo: events.NAME_SORTING,
      },
      {
        id: ENTITY_STATUS,
        title: {
          full: 'status',
        },
        sortable: true,
        component: StatusColumn,
        customProps: {
          formatMessage,
          onChange: (oldStatus, newStatus) =>
            tracking.trackEvent(getChangeItemStatusEvent(oldStatus, newStatus)),
          fetchFunc: onStatusUpdate,
        },
        withFilter: true,
        filterEventInfo: events.STATUS_FILTER,
        sortingEventInfo: events.STATUS_SORTING,
      },
      {
        id: ENTITY_START_TIME,
        title: {
          full: 'start time',
        },
        sortable: true,
        component: StartTimeColumn,
        withFilter: true,
        filterEventInfo: events.START_TIME_FILTER,
        sortingEventInfo: events.START_TIME_SORTING,
      },
      {
        id: ENTITY_DEFECT_TYPE,
        title: {
          full: 'defect type',
        },
        sortable: false,
        component: DefectTypeColumn,
        customProps: {
          onEdit: (data) => {
            onEditDefect(data);
          },
          onUnlinkSingleTicket,
          events: {
            onEditEvent:
              events.MAKE_DECISION_MODAL_EVENTS && events.MAKE_DECISION_MODAL_EVENTS.openModal,
            onClickIssueTicketEvent: events.onClickIssueTicketEvent,
          },
        },
        withFilter: true,
        filterEventInfo: events.DEFECT_TYPE_FILTER,
      },
    ];
    if (modifyColumnsFunc) {
      this.columns = modifyColumnsFunc(this.columns);
    }
  }

  handleAttributeFilterClick = (attribute) => {
    const { tracking, events, onFilterClick } = this.props;

    onFilterClick(
      [
        {
          id: ENTITY_ATTRIBUTE,
          value: {
            filteringField: ENTITY_ATTRIBUTE,
            condition: CONDITION_HAS,
            value: formatAttribute(attribute),
          },
        },
      ],
      true,
    );

    events.CLICK_ATTRIBUTES && tracking.trackEvent(events.CLICK_ATTRIBUTES);
  };

  highlightFailedItems = (value) => ({
    [cx('failed')]: value.status === FAILED,
  });

  render() {
    const {
      intl: { formatMessage },
      data,
      onItemSelect,
      onItemsSelect,
      onAllItemsSelect,
      selectedItems,
      loading,
      listView,
      onFilterClick,
      onChangeSorting,
      sortingColumn,
      sortingDirection,
      rowHighlightingConfig,
    } = this.props;

    return (
      <Fragment>
        <Grid
          columns={this.columns}
          data={data}
          onToggleSelection={onItemSelect}
          onToggleSelectAll={onAllItemsSelect}
          onItemsSelect={onItemsSelect}
          selectedItems={selectedItems}
          selectable
          rowClassMapper={this.highlightFailedItems}
          loading={loading}
          groupHeader={GroupHeader}
          groupFunction={groupItemsByParent}
          grouped={listView}
          onFilterClick={onFilterClick}
          onChangeSorting={onChangeSorting}
          sortingColumn={sortingColumn}
          sortingDirection={sortingDirection}
          rowHighlightingConfig={rowHighlightingConfig}
        />
        {!data.length && !loading && (
          <NoItemMessage message={formatMessage(COMMON_LOCALE_KEYS.NO_RESULTS)} />
        )}
      </Fragment>
    );
  }
}
