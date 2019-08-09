import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import LeftArrowIcon from 'common/img/arrow-left-small-inline.svg';
import { activeProjectSelector } from 'controllers/user';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { showDefaultErrorNotification } from 'controllers/notification';
import { LaunchesDetailsTable } from '../../tables/components/launchesDetailsTable';
import { CumulativeChartBreadcrumbs } from './legend/cumulativeChartBreadcrumbs';
import styles from './cumulativeDetails.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  backToChart: {
    id: 'CumulativeChart.backToChart',
    defaultMessage: 'Back to chart',
  },
});

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
    selectedItem: PropTypes.object,
    activeAttributes: PropTypes.array,
    activeProject: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    showDefaultErrorNotification: PropTypes.func.isRequired,
    chartHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  };

  static defaultProps = {
    selectedItem: null,
    activeAttributes: [],
    chartHeight: '100%',
  };

  state = {
    launches: [],
    loading: !!this.props.selectedItem,
  };

  componentDidMount() {
    if (this.props.selectedItem) {
      this.fetchLaunches();
    }
  }

  getLaunchIds = () => {
    const { selectedItem: { content = {} } = {} } = this.props;

    return content.launchIds || [];
  };

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
    const { intl, onClose, activeAttributes, chartHeight } = this.props;
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
        {loading ? (
          <SpinningPreloader />
        ) : (
          <LaunchesDetailsTable
            items={launches}
            maxHeight={chartHeight}
            noItemsMessage={intl.formatMessage(COMMON_LOCALE_KEYS.NO_RESULTS)}
          />
        )}
      </div>
    );
  }
}
