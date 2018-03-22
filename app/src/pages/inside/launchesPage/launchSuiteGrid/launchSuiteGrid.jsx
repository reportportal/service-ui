import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { Grid } from 'components/main/grid';
import { AbsRelTime } from 'components/main/absRelTime';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { ItemInfo } from './itemInfo';
import { Hamburger } from './hamburger';
import { ExecutionStatistics } from './executionStatistics';
import { DefectStatistics } from './defectStatistics';
import { ToInvestigteStatistics } from './toInvestigteStatistics';
import styles from './launchSuiteGrid.scss';

const cx = classNames.bind(styles);

const HamburgerColumn = ({ className, ...rest }) => (
  <div className={cx('hamburger-col', className)}>
    <Hamburger mode={rest.value.mode} />
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
    <AbsRelTime startTime={rest.value.start_time} user={{ userId: 'artem' }} />
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
      type={'pb'}
      customProps={rest.customProps}
      value={rest.value.statistics.defects.product_bug}
    />
  </div>
);
PbColumn.propTypes = {
  className: PropTypes.string.isRequired,
};

const AbColumn = ({ className, ...rest }) => (
  <div className={cx('ab-col', className)}>
    <DefectStatistics
      type={'ab'}
      customProps={rest.customProps}
      value={rest.value.statistics.defects.automation_bug}
    />
  </div>
);
AbColumn.propTypes = {
  className: PropTypes.string.isRequired,
};

const SiColumn = ({ className, ...rest }) => (
  <div className={cx('si-col', className)}>
    <DefectStatistics
      type={'si'}
      customProps={rest.customProps}
      value={rest.value.statistics.defects.system_issue}
    />
  </div>
);
SiColumn.propTypes = {
  className: PropTypes.string.isRequired,
};

const TiColumn = ({ className, ...rest }) => (
  <div className={cx('ti-col', className)}>
    <ToInvestigteStatistics
      customProps={rest.customProps}
      value={rest.value.statistics.defects.to_investigate}
    />
  </div>
);
TiColumn.propTypes = {
  className: PropTypes.string.isRequired,
};

const SelectColumn = ({ className }) => (
  <div className={cx('select-col', className)}>
    <InputCheckbox />
  </div>
);
SelectColumn.propTypes = {
  className: PropTypes.string.isRequired,
};

const COLUMNS = [
  {
    component: HamburgerColumn,
  },
  {
    title: {
      full: 'name',
      short: 'name',
    },
    maxHeight: 170,
    component: NameColumn,
  },
  {
    title: {
      full: 'start time',
      short: 'start',
    },
    component: StartTimeColumn,
  },
  {
    title: {
      full: 'total',
      short: 'ttl',
    },
    component: TotalColumn,
  },
  {
    title: {
      full: 'passed',
      short: 'ps',
    },
    component: PassedColumn,
  },
  {
    title: {
      full: 'failed',
      short: 'fl',
    },
    component: FailedColumn,
  },
  {
    title: {
      full: 'skipped',
      short: 'skp',
    },
    component: SkippedColumn,
  },
  {
    title: {
      full: 'product bug',
      short: 'product bug',
    },
    component: PbColumn,
    customProps: {
      abbreviation: 'pb',
    },
  },
  {
    title: {
      full: 'auto bug',
      short: 'auto bug',
    },
    component: AbColumn,
    customProps: {
      abbreviation: 'ab',
    },
  },
  {
    title: {
      full: 'system issue',
      short: 'system issue',
    },
    component: SiColumn,
    customProps: {
      abbreviation: 'si',
    },
  },
  {
    title: {
      full: 'to investigate',
      short: 'to invest',
    },
    component: TiColumn,
    customProps: {
      abbreviation: 'ti',
    },
  },
  {
    component: SelectColumn,
  },
];

export const LaunchSuiteGrid = ({ data }) => (
  <Grid
    columns={COLUMNS}
    data={data}
  />
  );
LaunchSuiteGrid.propTypes = {
  data: PropTypes.array,
};
LaunchSuiteGrid.defaultProps = {
  data: {},
};
