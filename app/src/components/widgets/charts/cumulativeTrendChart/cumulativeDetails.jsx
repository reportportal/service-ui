import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import isEqual from 'fast-deep-equal';
import { ALL } from 'common/constants/reservedFilterIds';
import { TEST_ITEM_PAGE } from 'controllers/pages';
import { Grid } from 'components/main/grid';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { showDefaultErrorNotification } from 'controllers/notification';
import {
  STATS_TOTAL,
  STATS_FAILED,
  STATS_PASSED,
  STATS_SKIPPED,
} from 'common/constants/statistics';
import { NameLink } from 'pages/inside/common/nameLink';
import { ExecutionStatistics } from 'pages/inside/common/launchSuiteGrid/executionStatistics';
import { formatItemName } from 'controllers/testItem';
import { activeProjectSelector } from 'controllers/user';
import { DefectTypeBlock } from 'pages/inside/common/infoLine/defectTypeBlock';
import { DEFECT_TYPES_SEQUENCE } from 'common/constants/defectTypes';
import LeftArrowIcon from 'common/img/arrow-left-small-inline.svg';
import { CumulativeChartBreadcrumbs } from './cumulativeChartBreadcrumbs';
import { getStatisticsStatuses, getPassingRate } from '../../tables/launchesTable/utils';
import styles from './cumulativeDetails.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  backToChart: {
    id: 'CumulativeChart.backToChart',
    defaultMessage: 'Back to chart',
  },
});

const NameColumn = ({ className, value, customProps }) => {
  const ownLinkParams = {
    page: TEST_ITEM_PAGE,
    payload: customProps.linkPayload,
  };

  return (
    <div className={cx('name-col', className)}>
      <NameLink itemId={value.id} ownLinkParams={ownLinkParams} className={cx('name-link')}>
        <span title={value.name} className={cx('name')}>
          {`${formatItemName(value.name)} `}
          {value.number && `#${value.number}`}
        </span>
      </NameLink>
    </div>
  );
};
NameColumn.propTypes = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
  customProps: PropTypes.object.isRequired,
};

const StatisticsColumn = ({ id, className, value, customProps: { linkPayload, statsKey } }) => {
  const {
    id: itemId,
    statistics: { executions },
  } = value;

  const defaultColumnProps = {
    itemId: Number(itemId),
    statuses: getStatisticsStatuses(id),
    ownLinkParams: {
      page: TEST_ITEM_PAGE,
      payload: linkPayload,
    },
  };
  return (
    <div className={cx('statistics-col', className)}>
      <ExecutionStatistics value={Number(executions[statsKey])} {...defaultColumnProps} />
    </div>
  );
};
StatisticsColumn.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
  customProps: PropTypes.object.isRequired,
};

const PassingRateColumn = ({ className, value }) => {
  const {
    statistics: {
      executions: { passed, total },
    },
  } = value;

  const passingRate = getPassingRate(passed, total);

  return <div className={cx('passing-rate-col', className)}>{passingRate}</div>;
};
PassingRateColumn.propTypes = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
};

const DefectTypesColumn = ({ className, value, customProps }) => {
  const {
    statistics: { defects },
  } = value;
  const ownLinkParams = {
    itemId: Number(value.id),
    ownLinkParams: {
      page: TEST_ITEM_PAGE,
      payload: customProps.linkPayload,
    },
  };

  return (
    <div className={cx(className)}>
      {DEFECT_TYPES_SEQUENCE.map((defect) => {
        const defectValue = defects[defect.toLowerCase()];

        return defectValue ? (
          <div key={defect} className={cx('defect-type')}>
            <DefectTypeBlock {...ownLinkParams} type={defect} data={defectValue} />
          </div>
        ) : null;
      })}
    </div>
  );
};
DefectTypesColumn.propTypes = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
  customProps: PropTypes.object.isRequired,
};

@connect(
  (state) => ({
    activeProject: activeProjectSelector(state),
  }),
  { showDefaultErrorNotification },
)
@injectIntl
export class CumulativeDetails extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    widget: PropTypes.object,
    activeAttribute: PropTypes.object,
    activeAttributes: PropTypes.array,
    activeProject: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    showDefaultErrorNotification: PropTypes.func.isRequired,
  };

  static defaultProps = {
    widget: null,
    activeAttribute: null,
    activeAttributes: [],
  };

  state = {
    launches: [],
    loading: true,
  };

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.widget.content, this.props.widget.content)) {
      this.fetchLaunches();
    }
  }

  getLaunchIds = () => {
    const {
      widget: {
        content: { result },
      },
    } = this.props;

    return result.reduce((ids, bar) => [...ids, ...bar.content.launchIds], []);
  };

  getColumns() {
    const { activeProject } = this.props;

    const customProps = {
      linkPayload: {
        projectId: activeProject,
        filterId: ALL,
      },
    };

    const columns = [
      {
        id: 'Name',
        title: {
          full: 'name',
        },
        component: NameColumn,
        customProps,
      },
      {
        id: STATS_FAILED,
        title: {
          full: 'Failed',
        },
        component: StatisticsColumn,
        customProps: {
          ...customProps,
          statsKey: 'failed',
        },
      },
      {
        id: STATS_PASSED,
        title: {
          full: 'passed',
        },
        component: StatisticsColumn,
        customProps: {
          ...customProps,
          statsKey: 'passed',
        },
      },
      {
        id: STATS_SKIPPED,
        title: {
          full: 'skipped',
        },
        component: StatisticsColumn,
        customProps: {
          ...customProps,
          statsKey: 'skipped',
        },
      },
      {
        id: STATS_TOTAL,
        title: {
          full: 'total',
        },
        component: StatisticsColumn,
        customProps: {
          ...customProps,
          statsKey: 'total',
        },
      },
      {
        id: 'passingRate',
        title: {
          full: 'Pass. rate',
        },
        component: PassingRateColumn,
      },
      {
        id: 'defectType',
        title: {
          full: 'Defect type',
        },
        customProps,
        component: DefectTypesColumn,
      },
    ];
    return columns;
  }

  columns = this.getColumns();

  sortLaunchesByFailedItems = (launches) =>
    launches.sort((a, b) => b.statistics.executions.failed - a.statistics.executions.failed);

  fetchLaunches = () => {
    this.setState({
      loading: true,
    });
    fetch(URLS.launchByIds(this.props.activeProject, this.getLaunchIds()), {
      method: 'get',
    })
      .then((res) => {
        const launches = this.sortLaunchesByFailedItems(res.content);
        this.setState({
          launches,
          loading: false,
        });
      })
      .catch((error) => {
        this.props.showDefaultErrorNotification(error);
        this.setState({
          loading: false,
        });
      });
  };

  render() {
    const { onClose, activeAttributes, intl } = this.props;
    const { launches, loading } = this.state;

    return (
      <div className={cx('cumulative-details-wrapper')}>
        <div className={cx('details-legend')}>
          <i className={cx('icon')}>{Parser(LeftArrowIcon)}</i>
          <span className={cx('back-link')} onClick={onClose}>
            {intl.formatMessage(messages.backToChart)}
          </span>
          <CumulativeChartBreadcrumbs isStatic activeAttributes={activeAttributes} />
        </div>
        {loading ? <SpinningPreloader /> : <Grid columns={this.columns} data={launches} />}
      </div>
    );
  }
}
