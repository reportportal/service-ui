import React, { PureComponent } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { PRODUCT_BUG, AUTOMATION_BUG, SYSTEM_ISSUE } from 'common/constants/defectTypes';
import { Grid } from 'components/main/grid';
import { AbsRelTime } from 'components/main/absRelTime';
import { ItemInfo } from './itemInfo';
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
    <AbsRelTime startTime={rest.value.start_time} />
  </div>
);
StartTimeColumn.propTypes = {
  className: PropTypes.string.isRequired,
};

const TotalColumn = ({ className, ...rest }) => (
  <div className={cx('total-col', className)}>
    <ExecutionStatistics title={rest.title} value={rest.value.statistics.executions.total} bold />
  </div>
);
TotalColumn.propTypes = {
  className: PropTypes.string.isRequired,
};

const PassedColumn = ({ className, ...rest }) => (
  <div className={cx('passed-col', className)}>
    <ExecutionStatistics title={rest.title} value={rest.value.statistics.executions.passed} />
  </div>
);
PassedColumn.propTypes = {
  className: PropTypes.string.isRequired,
};

const FailedColumn = ({ className, ...rest }) => (
  <div className={cx('failed-col', className)}>
    <ExecutionStatistics title={rest.title} value={rest.value.statistics.executions.failed} />
  </div>
);
FailedColumn.propTypes = {
  className: PropTypes.string.isRequired,
};

const SkippedColumn = ({ className, ...rest }) => (
  <div className={cx('skipped-col', className)}>
    <ExecutionStatistics title={rest.title} value={rest.value.statistics.executions.skipped} />
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
      data={rest.value.statistics.defects.product_bug}
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
      data={rest.value.statistics.defects.automation_bug}
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
      data={rest.value.statistics.defects.system_issue}
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
      value={rest.value.statistics.defects.to_investigate}
    />
  </div>
);
TiColumn.propTypes = {
  className: PropTypes.string.isRequired,
};

export class LaunchSuiteGrid extends PureComponent {
  static propTypes = {
    data: PropTypes.array,
    sortingColumn: PropTypes.string,
    sortingDirection: PropTypes.string,
    onChangeSorting: PropTypes.func,
    onDeleteItem: PropTypes.func,
    onMoveToDebug: PropTypes.func,
    onEditLaunch: PropTypes.func,
    selectedItems: PropTypes.arrayOf(PropTypes.object),
    onItemSelect: PropTypes.func,
    onAllItemsSelect: PropTypes.func,
    withHamburger: PropTypes.bool,
  };
  static defaultProps = {
    data: {},
    sortingColumn: null,
    sortingDirection: null,
    onChangeSorting: () => {},
    onDeleteItem: () => {},
    onMoveToDebug: () => {},
    onEditLaunch: () => {},
    selectedItems: [],
    onItemSelect: () => {},
    onAllItemsSelect: () => {},
    withHamburger: false,
  };
  getColumns() {
    const hamburgerColumn = {
      component: HamburgerColumn,
      customProps: {
        onDeleteItem: this.props.onDeleteItem,
        onMoveToDebug: this.props.onMoveToDebug,
      },
    };
    const columns = [
      {
        id: 'name',
        title: {
          full: 'name',
          short: 'name',
        },
        maxHeight: 170,
        component: NameColumn,
        sortable: true,
        customProps: {
          onEditLaunch: this.props.onEditLaunch,
        },
      },
      {
        id: 'start_time',
        title: {
          full: 'start time',
          short: 'start',
        },
        component: StartTimeColumn,
        sortable: true,
      },
      {
        id: 'statistics$executions$total',
        title: {
          full: 'total',
          short: 'ttl',
        },
        component: TotalColumn,
        sortable: true,
      },
      {
        id: 'statistics$executions$passed',
        title: {
          full: 'passed',
          short: 'ps',
        },
        component: PassedColumn,
        sortable: true,
      },
      {
        id: 'statistics$executions$failed',
        title: {
          full: 'failed',
          short: 'fl',
        },
        component: FailedColumn,
        sortable: true,
      },
      {
        id: 'statistics$executions$skipped',
        title: {
          full: 'skipped',
          short: 'skp',
        },
        component: SkippedColumn,
        sortable: true,
      },
      {
        id: 'statistics$defects$product_bug$total',
        title: {
          full: 'product bug',
          short: 'product bug',
        },
        component: PbColumn,
        customProps: {
          abbreviation: 'pb',
        },
        sortable: true,
      },
      {
        id: 'statistics$defects$automation_bug$total',
        title: {
          full: 'auto bug',
          short: 'auto bug',
        },
        component: AbColumn,
        customProps: {
          abbreviation: 'ab',
        },
        sortable: true,
      },
      {
        id: 'statistics$defects$system_issue$total',
        title: {
          full: 'system issue',
          short: 'system issue',
        },
        component: SiColumn,
        customProps: {
          abbreviation: 'si',
        },
        sortable: true,
      },
      {
        id: 'statistics$defects$to_investigate$total',
        title: {
          full: 'to investigate',
          short: 'to invest',
        },
        component: TiColumn,
        customProps: {
          abbreviation: 'ti',
        },
        sortable: true,
      },
    ];
    if (this.props.withHamburger) {
      columns.splice(0, 0, hamburgerColumn);
    }
    return columns;
  }

  COLUMNS = this.getColumns();

  render() {
    const {
      data,
      onChangeSorting,
      sortingColumn,
      sortingDirection,
      selectedItems,
      onItemSelect,
      onAllItemsSelect,
    } = this.props;

    return (
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
      />
    );
  }
}
