import { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { Grid } from 'components/main/grid';
import { AbsRelTime } from 'components/main/absRelTime';
import { formatMethodType, formatStatus } from 'common/utils/localizationUtils';
import { FAILED } from 'common/constants/testStatuses';
import {
  ENTITY_METHOD_TYPE,
  ENTITY_STATUS,
  ENTITY_START_TIME,
  ENTITY_DEFECT_TYPE,
  CONDITION_HAS,
  ENTITY_ATTRIBUTE_KEYS,
  ENTITY_ATTRIBUTE_VALUES,
} from 'components/filterEntities/constants';
import { STEP_PAGE_EVENTS } from 'components/main/analytics/events';
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

const NameColumn = ({ className, ...rest }) => (
  <div className={cx('name-col', className)}>
    <ItemInfoWithRetries {...rest} />
  </div>
);
NameColumn.propTypes = {
  className: PropTypes.string,
};
NameColumn.defaultProps = {
  className: null,
};

const StatusColumn = ({ className, value, customProps: { formatMessage } }) => (
  <div className={cx('status-col', className)}>{formatStatus(formatMessage, value.status)}</div>
);
StatusColumn.propTypes = {
  className: PropTypes.string,
  value: PropTypes.object,
  customProps: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
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

const DefectTypeColumn = ({ className, value, customProps: { onEdit } }) => (
  <div className={cx('defect-type-col', className)}>
    {value.issue &&
      value.issue.issueType && <DefectType issue={value.issue} onEdit={() => onEdit(value)} />}
  </div>
);
DefectTypeColumn.propTypes = {
  className: PropTypes.string,
  value: PropTypes.object,
  customProps: PropTypes.shape({
    onEdit: PropTypes.func.isRequired,
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
    onAllItemsSelect: PropTypes.func,
    loading: PropTypes.bool,
    listView: PropTypes.bool,
    onShowTestParams: PropTypes.func,
    onFilterClick: PropTypes.func,
    onEditDefect: PropTypes.func,
    events: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    onEditItem: PropTypes.func,
    onChangeSorting: PropTypes.func,
    sortingColumn: PropTypes.string,
    sortingDirection: PropTypes.string,
  };

  static defaultProps = {
    data: [],
    selectedItems: [],
    onItemSelect: () => {},
    onAllItemsSelect: () => {},
    loading: false,
    listView: false,
    onShowTestParams: () => {},
    onFilterClick: () => {},
    onEditDefect: () => {},
    onEditItem: () => {},
    events: {},
    onChangeSorting: () => {},
    sortingColumn: null,
    sortingDirection: null,
  };

  constructor(props) {
    super(props);
    const { events } = this.props;
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
          formatMessage: props.intl.formatMessage,
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
          onShowTestParams: props.onShowTestParams,
          onEditItem: props.onEditItem,
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
          formatMessage: props.intl.formatMessage,
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
        sortable: true,
        component: DefectTypeColumn,
        customProps: {
          onEdit: (data) => {
            props.tracking.trackEvent(STEP_PAGE_EVENTS.EDIT_DEFECT_TYPE_ICON);
            props.onEditDefect(data);
          },
        },
        withFilter: true,
        filterEventInfo: events.DEFECT_TYPE_FILTER,
        sortingEventInfo: events.DEFECT_TYPE_SORTING,
      },
    ];
  }

  handleAttributeFilterClick = (attribute) => {
    this.props.onFilterClick({
      id: ENTITY_ATTRIBUTE_KEYS,
      value: {
        filteringField: ENTITY_ATTRIBUTE_KEYS,
        condition: CONDITION_HAS,
        value: attribute.key || '',
      },
    });
    this.props.onFilterClick({
      id: ENTITY_ATTRIBUTE_VALUES,
      value: {
        filteringField: ENTITY_ATTRIBUTE_VALUES,
        condition: CONDITION_HAS,
        value: attribute.value || '',
      },
    });
  };

  highlightFailedItems = (value) => ({
    [cx('failed')]: value.status === FAILED,
  });

  groupStepItems = () =>
    this.props.data.reduce((groups, step) => {
      const group = groups[step.parent] || [];
      return {
        ...groups,
        [step.parent]: [...group, step],
      };
    }, {});

  render() {
    const {
      data,
      onItemSelect,
      onAllItemsSelect,
      selectedItems,
      loading,
      listView,
      onFilterClick,
      onChangeSorting,
      sortingColumn,
      sortingDirection,
    } = this.props;
    return (
      <Grid
        columns={this.columns}
        data={data}
        onToggleSelection={onItemSelect}
        onToggleSelectAll={onAllItemsSelect}
        selectedItems={selectedItems}
        selectable
        rowClassMapper={this.highlightFailedItems}
        loading={loading}
        groupHeader={GroupHeader}
        groupFunction={this.groupStepItems}
        grouped={listView}
        onFilterClick={onFilterClick}
        onChangeSorting={onChangeSorting}
        sortingColumn={sortingColumn}
        sortingDirection={sortingDirection}
      />
    );
  }
}
