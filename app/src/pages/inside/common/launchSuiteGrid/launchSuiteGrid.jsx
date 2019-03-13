import React, { PureComponent, Fragment } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { PRODUCT_BUG, AUTOMATION_BUG, SYSTEM_ISSUE } from 'common/constants/defectTypes';
import { FAILED, INTERRUPTED, PASSED, SKIPPED } from 'common/constants/launchStatuses';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { Grid } from 'components/main/grid';
import { AbsRelTime } from 'components/main/absRelTime';
import { ItemInfo } from 'pages/inside/common/itemInfo';
import {
  ENTITY_START_TIME,
  ENTITY_NAME,
  ENTITY_ATTRIBUTE_KEYS,
  ENTITY_ATTRIBUTE_VALUES,
  CONDITION_HAS,
} from 'components/filterEntities/constants';
import { NoItemMessage } from 'components/main/noItemMessage';
import {
  STATS_TOTAL,
  STATS_SKIPPED,
  STATS_PASSED,
  STATS_FAILED,
  STATS_AB_TOTAL,
  STATS_PB_TOTAL,
  STATS_SI_TOTAL,
  STATS_TI_TOTAL,
} from 'common/constants/statistics';
import { Hamburger } from './hamburger';
import { ExecutionStatistics } from './executionStatistics';
import { DefectStatistics } from './defectStatistics';
import { ToInvestigateStatistics } from './toInvestigateStatistics';
import styles from './launchSuiteGrid.scss';

const cx = classNames.bind(styles);

const HamburgerColumn = ({ className, ...rest }) => (
  <div className={cx('hamburger-col', className)}>
    <Hamburger launch={rest.value} customProps={rest.customProps} />
  </div>
);
HamburgerColumn.propTypes = {
  className: PropTypes.string.isRequired,
};

const NameColumn = ({ className, ...rest }) => (
  <div className={cx('name-col', className)}>
    <ItemInfo {...rest} />
  </div>
);
NameColumn.propTypes = {
  className: PropTypes.string.isRequired,
};

const StartTimeColumn = ({ className, ...rest }) => (
  <div className={cx('start-time-col', className)}>
    <AbsRelTime startTime={rest.value.startTime} />
  </div>
);
StartTimeColumn.propTypes = {
  className: PropTypes.string.isRequired,
};

const TotalColumn = ({ className, ...rest }) => (
  <div className={cx('total-col', className)}>
    <ExecutionStatistics
      itemId={rest.value.id}
      title={rest.title}
      value={rest.value.statistics.executions && rest.value.statistics.executions.total}
      bold
      statuses={[
        PASSED.toUpperCase(),
        FAILED.toUpperCase(),
        SKIPPED.toUpperCase(),
        INTERRUPTED.toUpperCase(),
      ]}
    />
  </div>
);
TotalColumn.propTypes = {
  className: PropTypes.string.isRequired,
};

const PassedColumn = ({ className, ...rest }) => (
  <div className={cx('passed-col', className)}>
    <ExecutionStatistics
      itemId={rest.value.id}
      title={rest.title}
      value={rest.value.statistics.executions && rest.value.statistics.executions.passed}
      statuses={[PASSED.toUpperCase()]}
    />
  </div>
);
PassedColumn.propTypes = {
  className: PropTypes.string.isRequired,
};

const FailedColumn = ({ className, ...rest }) => (
  <div className={cx('failed-col', className)}>
    <ExecutionStatistics
      itemId={rest.value.id}
      title={rest.title}
      value={rest.value.statistics.executions && rest.value.statistics.executions.failed}
      statuses={[FAILED.toUpperCase(), INTERRUPTED.toUpperCase()]}
    />
  </div>
);
FailedColumn.propTypes = {
  className: PropTypes.string.isRequired,
};

const SkippedColumn = ({ className, ...rest }) => (
  <div className={cx('skipped-col', className)}>
    <ExecutionStatistics
      itemId={rest.value.id}
      title={rest.title}
      value={rest.value.statistics.executions && rest.value.statistics.executions.skipped}
      statuses={[SKIPPED.toUpperCase()]}
    />
  </div>
);
SkippedColumn.propTypes = {
  className: PropTypes.string.isRequired,
};

const PbColumn = ({ className, ...rest }) => (
  <div className={cx('pb-col', className)}>
    <DefectStatistics
      type={PRODUCT_BUG}
      customProps={rest.customProps}
      data={rest.value.statistics.defects && rest.value.statistics.defects.product_bug}
      itemId={rest.value.id}
      eventInfo={rest.customProps.events.PB_CHART}
      tooltipEventInfo={rest.customProps.events.PB_TOOLTIP}
    />
  </div>
);
PbColumn.propTypes = {
  className: PropTypes.string.isRequired,
};

const AbColumn = ({ className, ...rest }) => (
  <div className={cx('ab-col', className)}>
    <DefectStatistics
      type={AUTOMATION_BUG}
      customProps={rest.customProps}
      data={rest.value.statistics.defects && rest.value.statistics.defects.automation_bug}
      itemId={rest.value.id}
      eventInfo={rest.customProps.events.AB_CHART}
      tooltipEventInfo={rest.customProps.events.AB_TOOLTIP}
    />
  </div>
);
AbColumn.propTypes = {
  className: PropTypes.string.isRequired,
};

const SiColumn = ({ className, ...rest }) => (
  <div className={cx('si-col', className)}>
    <DefectStatistics
      type={SYSTEM_ISSUE}
      customProps={rest.customProps}
      data={rest.value.statistics.defects && rest.value.statistics.defects.system_issue}
      itemId={rest.value.id}
      eventInfo={rest.customProps.events.SI_CHART}
      tooltipEventInfo={rest.customProps.events.SI_TOOLTIP}
    />
  </div>
);
SiColumn.propTypes = {
  className: PropTypes.string.isRequired,
};

const TiColumn = ({ className, ...rest }) => (
  <div className={cx('ti-col', className)}>
    <ToInvestigateStatistics
      customProps={rest.customProps}
      value={rest.value.statistics.defects && rest.value.statistics.defects.to_investigate}
      itemId={rest.value.id}
      eventInfo={rest.customProps.events.TI_CHART}
    />
  </div>
);
TiColumn.propTypes = {
  className: PropTypes.string.isRequired,
};

@injectIntl
export class LaunchSuiteGrid extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.array,
    sortingColumn: PropTypes.string,
    sortingDirection: PropTypes.string,
    onChangeSorting: PropTypes.func,
    onDeleteItem: PropTypes.func,
    onMove: PropTypes.func,
    onEditItem: PropTypes.func,
    onForceFinish: PropTypes.func,
    selectedItems: PropTypes.arrayOf(PropTypes.object),
    onItemSelect: PropTypes.func,
    onAllItemsSelect: PropTypes.func,
    withHamburger: PropTypes.bool,
    loading: PropTypes.bool,
    onFilterClick: PropTypes.func,
    events: PropTypes.object,
    onAnalysis: PropTypes.func,
  };
  static defaultProps = {
    data: [],
    sortingColumn: null,
    sortingDirection: null,
    onChangeSorting: () => {},
    onDeleteItem: () => {},
    onMove: () => {},
    onEditItem: () => {},
    onForceFinish: () => {},
    selectedItems: [],
    onItemSelect: () => {},
    onAllItemsSelect: () => {},
    withHamburger: false,
    loading: false,
    onFilterClick: () => {},
    events: {},
    onAnalysis: () => {},
  };
  getColumns() {
    const hamburgerColumn = {
      component: HamburgerColumn,
      customProps: {
        onDeleteItem: this.props.onDeleteItem,
        onMove: this.props.onMove,
        onForceFinish: this.props.onForceFinish,
        onAnalysis: this.props.onAnalysis,
      },
    };
    const { events } = this.props;
    const columns = [
      {
        id: ENTITY_NAME,
        title: {
          full: 'name',
          short: 'name',
        },
        maxHeight: 170,
        component: NameColumn,
        sortable: true,
        customProps: {
          onEditItem: this.props.onEditItem,
          onClickAttribute: this.handleAttributeFilterClick,
          events,
        },
        sortingEventInfo: events.NAME_SORTING,
      },
      {
        id: ENTITY_START_TIME,
        title: {
          full: 'start time',
          short: 'start',
        },
        component: StartTimeColumn,
        sortable: true,
        withFilter: true,
        filterEventInfo: events.START_TIME_FILTER,
        sortingEventInfo: events.START_TIME_SORTING,
      },
      {
        id: STATS_TOTAL,
        title: {
          full: 'total',
          short: 'ttl',
        },
        component: TotalColumn,
        sortable: true,
        withFilter: true,
        filterEventInfo: events.TOTAL_FILTER,
        sortingEventInfo: events.TOTAL_SORTING,
      },
      {
        id: STATS_PASSED,
        title: {
          full: 'passed',
          short: 'ps',
        },
        component: PassedColumn,
        sortable: true,
        withFilter: true,
        filterEventInfo: events.PASSED_FILTER,
        sortingEventInfo: events.PASSED_SORTING,
      },
      {
        id: STATS_FAILED,
        title: {
          full: 'failed',
          short: 'fl',
        },
        component: FailedColumn,
        sortable: true,
        withFilter: true,
        filterEventInfo: events.FAILED_FILTER,
        sortingEventInfo: events.FAILED_SORTING,
      },
      {
        id: STATS_SKIPPED,
        title: {
          full: 'skipped',
          short: 'skp',
        },
        component: SkippedColumn,
        sortable: true,
        withFilter: true,
        filterEventInfo: events.SKIPPED_FILTER,
        sortingEventInfo: events.SKIPPED_SORTING,
      },
      {
        id: STATS_PB_TOTAL,
        title: {
          full: 'product bug',
          short: 'product bug',
        },
        component: PbColumn,
        customProps: {
          abbreviation: 'pb',
          events,
        },
        sortable: true,
        withFilter: true,
        filterEventInfo: events.PB_FILTER,
        sortingEventInfo: events.PB_SORTING,
      },
      {
        id: STATS_AB_TOTAL,
        title: {
          full: 'auto bug',
          short: 'auto bug',
        },
        component: AbColumn,
        customProps: {
          abbreviation: 'ab',
          events,
        },
        sortable: true,
        withFilter: true,
        filterEventInfo: events.AB_FILTER,
        sortingEventInfo: events.AB_SORTING,
      },
      {
        id: STATS_SI_TOTAL,
        title: {
          full: 'system issue',
          short: 'system issue',
        },
        component: SiColumn,
        customProps: {
          abbreviation: 'si',
          events,
        },
        sortable: true,
        withFilter: true,
        filterEventInfo: events.SI_FILTER,
        sortingEventInfo: events.SI_SORTING,
      },
      {
        id: STATS_TI_TOTAL,
        title: {
          full: 'to investigate',
          short: 'to invest',
        },
        component: TiColumn,
        customProps: {
          abbreviation: 'ti',
          events,
        },
        sortable: true,
        withFilter: true,
        filterEventInfo: events.TI_FILTER,
        sortingEventInfo: events.TI_SORTING,
      },
    ];
    if (this.props.withHamburger) {
      columns.splice(0, 0, hamburgerColumn);
    }
    return columns;
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

  COLUMNS = this.getColumns();

  render() {
    const {
      intl: { formatMessage },
      data,
      onChangeSorting,
      sortingColumn,
      sortingDirection,
      selectedItems,
      onItemSelect,
      onAllItemsSelect,
      loading,
      onFilterClick,
    } = this.props;

    return (
      <Fragment>
        <Grid
          columns={this.COLUMNS}
          data={data}
          sortingColumn={sortingColumn}
          sortingDirection={sortingDirection}
          onChangeSorting={onChangeSorting}
          selectedItems={selectedItems}
          selectable
          onToggleSelection={onItemSelect}
          onToggleSelectAll={onAllItemsSelect}
          loading={loading}
          onFilterClick={onFilterClick}
        />
        {!data.length &&
          !loading && <NoItemMessage message={formatMessage(COMMON_LOCALE_KEYS.NO_RESULTS)} />}
      </Fragment>
    );
  }
}
