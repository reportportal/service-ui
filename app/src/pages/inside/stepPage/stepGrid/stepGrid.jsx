/*
 * Copyright 2024 EPAM Systems
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

import { useMemo } from 'react';
import { useTracking } from 'react-tracking';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
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
import { formatAttribute } from 'common/utils/attributeUtils';
import { StatusDropdown } from 'pages/inside/common/statusDropdown/statusDropdown';
import { canWorkWithDefectTypes, canWorkWithTests } from 'common/utils/permissions/permissions';
import { userRolesSelector } from 'controllers/pages';
import { useSelector } from 'react-redux';
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
      hideEdit={customProps?.hideEdit}
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

const StatusColumn = ({
  className,
  value,
  customProps: { viewOnly, onChange, fetchFunc, readOnly },
}) => {
  const { id, status, attributes, description } = value;
  return (
    <div className={cx('status-col', className)}>
      {viewOnly ? (
        <span className={cx('status-value')}>{status.toLowerCase()}</span>
      ) : (
        <StatusDropdown
          itemId={id}
          status={status}
          attributes={attributes}
          description={description}
          onChange={onChange}
          fetchFunc={fetchFunc}
          readOnly={readOnly}
        />
      )}
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
    readOnly: PropTypes.bool,
    viewOnly: PropTypes.bool,
  }).isRequired,
};
StatusColumn.defaultProps = {
  className: null,
  value: {},
  viewOnly: false,
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
  customProps: { onEdit, onUnlinkSingleTicket, events, disabled, hideEdit },
}) => (
  <div className={cx('defect-type-col', className)}>
    {value.issue?.issueType && (
      <DefectType
        issue={value.issue}
        patternTemplates={value.patternTemplates}
        hideEdit={hideEdit}
        onEdit={() => onEdit(value)}
        onRemove={onUnlinkSingleTicket(value)}
        events={events}
        disabled={disabled}
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
    disabled: PropTypes.bool,
    hideEdit: PropTypes.bool,
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

export const StepGrid = ({
  data,
  selectedItems,
  onItemSelect,
  onItemsSelect,
  onAllItemsSelect,
  loading,
  listView,
  onFilterClick,
  onEditDefect,
  onUnlinkSingleTicket,
  events,
  onEditItem,
  onChangeSorting,
  sortingColumn,
  sortingDirection,
  rowHighlightingConfig,
  onStatusUpdate,
  modifyColumnsFunc,
  isTestSearchView,
  errorMessage,
}) => {
  const { trackEvent } = useTracking();
  const { formatMessage } = useIntl();
  const userRoles = useSelector(userRolesSelector);
  const canManageTests = canWorkWithTests(userRoles);

  const handleAttributeFilterClick = (attribute) => {
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

    if (events.CLICK_ATTRIBUTES) {
      trackEvent(events.CLICK_ATTRIBUTES);
    }
  };

  const highlightFailedItems = (value) => ({
    [cx('failed')]: value.status === FAILED && !isTestSearchView,
  });

  const columns = useMemo(() => {
    const baseColumns = [
      ...(isTestSearchView
        ? []
        : [
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
          ]),
      {
        id: 'name',
        title: { full: 'name' },
        sortable: !isTestSearchView,
        component: NameColumn,
        maxHeight: 170,
        customProps: {
          onEditItem,
          onClickAttribute: handleAttributeFilterClick,
          events,
          hideEdit: isTestSearchView,
          openInNewTab: isTestSearchView,
        },
        withFilter: !isTestSearchView,
        filterEventInfo: events.NAME_FILTER,
        sortingEventInfo: events.NAME_SORTING,
      },
      {
        id: ENTITY_STATUS,
        title: { full: 'status' },
        sortable: !isTestSearchView,
        component: StatusColumn,
        customProps: {
          formatMessage,
          onChange: (status) => trackEvent(events.getChangeItemStatusEvent(status)),
          fetchFunc: onStatusUpdate,
          readOnly: !canWorkWithTests(userRoles),
          viewOnly: isTestSearchView,
        },
        withFilter: !isTestSearchView,
        filterEventInfo: events.STATUS_FILTER,
        sortingEventInfo: events.STATUS_SORTING,
      },
      {
        id: ENTITY_START_TIME,
        title: { full: 'start time' },
        sortable: true,
        component: StartTimeColumn,
        withFilter: !isTestSearchView,
        filterEventInfo: events.START_TIME_FILTER,
        sortingEventInfo: events.START_TIME_SORTING,
      },
      {
        id: ENTITY_DEFECT_TYPE,
        title: { full: 'defect type' },
        sortable: false,
        component: DefectTypeColumn,
        customProps: {
          hideEdit: isTestSearchView,
          onEdit: onEditDefect,
          onUnlinkSingleTicket,
          events: {
            onEditEvent: events.MAKE_DECISION_MODAL_EVENTS?.getOpenModalEvent,
            onClickIssueTicketEvent: events.onClickIssueTicketEvent,
          },
          disabled: !canWorkWithDefectTypes(userRoles),
        },
        withFilter: !isTestSearchView,
        filterEventInfo: events.DEFECT_TYPE_FILTER,
      },
    ];

    return modifyColumnsFunc ? modifyColumnsFunc(baseColumns) : baseColumns;
  }, [
    formatMessage,
    events,
    onEditItem,
    onEditDefect,
    onUnlinkSingleTicket,
    onStatusUpdate,
    modifyColumnsFunc,
    isTestSearchView,
    userRoles,
    trackEvent,
  ]);

  return (
    <>
      <Grid
        columns={columns}
        data={data}
        onToggleSelection={onItemSelect}
        onToggleSelectAll={onAllItemsSelect}
        onItemsSelect={onItemsSelect}
        selectedItems={selectedItems}
        selectable={!isTestSearchView && canManageTests}
        rowClassMapper={highlightFailedItems}
        loading={loading}
        groupHeader={GroupHeader}
        groupFunction={groupItemsByParent}
        grouped={listView}
        onFilterClick={onFilterClick}
        onChangeSorting={onChangeSorting}
        sortingColumn={sortingColumn}
        sortingDirection={sortingDirection}
        rowHighlightingConfig={rowHighlightingConfig}
        isViewOnly={isTestSearchView}
        eventsInfo={events}
      />
      {!loading && errorMessage ? (
        <div className={cx('error-message-wrapper')}>
          <span className={cx('message')}>{errorMessage}</span>
        </div>
      ) : (
        !data.length &&
        !loading && <NoItemMessage message={formatMessage(COMMON_LOCALE_KEYS.NO_RESULTS)} />
      )}
    </>
  );
};

StepGrid.propTypes = {
  data: PropTypes.array,
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
  isTestSearchView: PropTypes.bool,
  errorMessage: PropTypes.string,
};

StepGrid.defaultProps = {
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
  rowHighlightingConfig: {
    onGridRowHighlighted: () => {},
    isGridRowHighlighted: false,
    highlightedRowId: null,
  },
  modifyColumnsFunc: null,
  isTestSearchView: false,
  errorMessage: null,
};
