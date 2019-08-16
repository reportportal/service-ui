import { Component } from 'react';
import { URLS } from 'common/urls';
import ReactDOMServer from 'react-dom/server';
import PropTypes from 'prop-types';
import * as d3 from 'd3-selection';
import classNames from 'classnames/bind';
import { fetch, dateFormat } from 'common/utils';
import {
  STATS_AB_TOTAL,
  STATS_ND_TOTAL,
  STATS_PB_TOTAL,
  STATS_SI_TOTAL,
  STATS_TI_TOTAL,
  STATS_FAILED,
  STATS_PASSED,
  STATS_SKIPPED,
} from 'common/constants/statistics';
import { FAILED, PASSED, SKIPPED } from 'common/constants/launchStatuses';
import { COLOR_FAILED, COLOR_PASSED, COLOR_SKIPPED } from 'common/constants/colors';
import {
  PRODUCT_BUG,
  AUTOMATION_BUG,
  SYSTEM_ISSUE,
  NO_DEFECT,
  TO_INVESTIGATE,
} from 'common/constants/defectTypes';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { withModal, ModalLayout } from 'components/main/modal';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { defectColorsSelector } from 'controllers/project';
import { activeProjectSelector } from 'controllers/user';
import { C3Chart } from 'components/widgets/common/c3chart';
import styles from './launchCompareModal.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  compareLaunchHeader: {
    id: 'CompareLaunchDialog.compareLaunchHeader',
    defaultMessage: 'Compare launches',
  },
  yAxisTitle: {
    id: 'CompareLaunchDialog.yAxisTitle',
    defaultMessage: '% of test cases',
  },
  passed: {
    id: 'LaunchStatus.passed',
    defaultMessage: 'Passed',
  },
  failed: {
    id: 'LaunchStatus.failed',
    defaultMessage: 'Failed',
  },
  skipped: {
    id: 'LaunchStatus.skipped',
    defaultMessage: 'Skipped',
  },
  product_bug: {
    id: 'DefectType.product_bug',
    defaultMessage: 'Product bug',
  },
  automation_bug: {
    id: 'DefectType.automation_bug',
    defaultMessage: 'Automation bug',
  },
  system_issue: {
    id: 'DefectType.system_issue',
    defaultMessage: 'System issue',
  },
  no_defect: {
    id: 'DefectType.no_defect',
    defaultMessage: 'No defect',
  },
  to_investigate: {
    id: 'DefectType.to_investigate',
    defaultMessage: 'To investigate',
  },
});
const getInitialChartConfig = () => ({
  data: {
    type: 'bar',
    order: null,
  },
  grid: {
    y: {
      show: true,
    },
  },
  axis: {
    x: {
      show: true,
      type: 'category',
      tick: {
        centered: true,
        inner: true,
        outer: false,
      },
    },
    y: {
      show: true,
      padding: {
        top: 0,
      },
      max: 100,
      label: {
        position: 'outer-middle',
      },
    },
  },
  interaction: {
    enabled: !self.isPreview,
  },
  padding: {
    top: 0,
    left: 60,
    right: 20,
    bottom: 0,
  },
  legend: {
    show: false,
  },
  tooltip: {
    grouped: false,
  },
});

@withModal('launchCompareModal')
@injectIntl
@connect((state) => ({
  defectColors: defectColorsSelector(state),
  activeProject: activeProjectSelector(state),
}))
export class LaunchCompareModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    activeProject: PropTypes.string.isRequired,
    defectColors: PropTypes.object.isRequired,
    data: PropTypes.shape({
      ids: PropTypes.array,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.chartConfig = getInitialChartConfig();
    this.state = {
      loaded: false,
    };
  }

  componentDidMount() {
    fetch(URLS.launchesCompare(this.props.activeProject, this.props.data.ids.join(',')), {
      method: 'get',
    }).then((response) => {
      this.prepareDataForConfig(response.result);
    });
  }

  componentWillUnmount() {
    this.chartContainer && this.chartContainer.removeEventListener('mousemove', this.getCoords);
  }

  onChartCreated = () => {
    this.chartContainer.addEventListener('mousemove', this.getCoords);
  };

  getCoords = ({ pageX, pageY }) => {
    this.x = pageX;
    this.y = pageY;
  };

  getPosition = (d, width, height) => {
    const rect = this.chartContainer.getBoundingClientRect();
    const left = this.x - rect.left - width / 2;
    const top = this.y - rect.top - height;

    return {
      top: top - 8,
      left,
    };
  };

  setChartContainerRef = (chartContainer) => {
    this.chartContainer = chartContainer;
  };

  setupChartConfig = ({ columns, itemsData }) => {
    this.chartConfig.data.columns = [
      columns[STATS_PASSED],
      columns[STATS_FAILED],
      columns[STATS_SKIPPED],
      columns[STATS_PB_TOTAL],
      columns[STATS_AB_TOTAL],
      columns[STATS_SI_TOTAL],
      columns[STATS_ND_TOTAL],
      columns[STATS_TI_TOTAL],
    ];
    this.chartConfig.data.colors = this.props.defectColors;
    this.chartConfig.data.colors[PASSED] = COLOR_PASSED;
    this.chartConfig.data.colors[FAILED] = COLOR_FAILED;
    this.chartConfig.data.colors[SKIPPED] = COLOR_SKIPPED;
    this.chartConfig.axis.x.categories = itemsData.map((item) => `#${item.number}`);
    this.chartConfig.axis.y.label.text = this.props.intl.formatMessage(messages.yAxisTitle);
    this.chartConfig.size = {
      height: this.chartContainer.offsetHeight,
    };
    this.chartConfig.onrendered = () => {
      const barPaths = d3.select(this.chartContainer).selectAll('.c3-chart-bar path');
      barPaths.each((d, i) => {
        // eslint-disable-next-line no-underscore-dangle
        const elem = d3.select(barPaths._groups[0][i]);
        if (elem.datum().value === 0) {
          elem.style('stroke-width', '3px');
        }
      });
    };
    this.chartConfig.tooltip.position = this.getPosition;
    this.chartConfig.tooltip.contents = (d, defaultTitleFormat, defaultValueFormat, color) => {
      const launchData = itemsData[d[0].index];
      const id = d[0].id;
      return ReactDOMServer.renderToStaticMarkup(
        <div className={cx('tooltip')}>
          <div className={cx('launch-name')}>{`${launchData.name} #${launchData.number}`}</div>
          <div className={cx('start-time')}>
            {dateFormat(new Date(Number(launchData.startTime)))}
          </div>
          <div className={cx('stats')}>
            <div className={cx('color-mark')} style={{ backgroundColor: color(id) }} />
            <div className={cx('item-name')}>{this.props.intl.formatMessage(messages[id])}:</div>
            <div className={cx('item-value')}>{`${d[0].value}%`}</div>
          </div>
        </div>,
      );
    };

    this.setState({ loaded: true });
  };

  prepareDataForConfig = (data) => {
    const columns = {
      [STATS_PASSED]: [PASSED],
      [STATS_FAILED]: [FAILED],
      [STATS_SKIPPED]: [SKIPPED],
      [STATS_PB_TOTAL]: [PRODUCT_BUG],
      [STATS_AB_TOTAL]: [AUTOMATION_BUG],
      [STATS_SI_TOTAL]: [SYSTEM_ISSUE],
      [STATS_ND_TOTAL]: [NO_DEFECT],
      [STATS_TI_TOTAL]: [TO_INVESTIGATE],
    };
    const itemsData = data.map((item) => {
      Object.keys(item.values).forEach((key) => {
        columns[key].push(item.values[key]);
      });
      return {
        id: item.id,
        name: item.name,
        number: item.number,
        startTime: item.startTime,
      };
    });

    this.setupChartConfig({ columns, itemsData });
  };

  render() {
    const { intl } = this.props;
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    };
    return (
      <ModalLayout
        className={cx('launch-compare-modal')}
        title={intl.formatMessage(messages.compareLaunchHeader)}
        cancelButton={cancelButton}
      >
        <div ref={this.setChartContainerRef} className={cx('chart-container')}>
          {this.state.loaded ? (
            <C3Chart config={this.chartConfig} onChartCreated={this.onChartCreated} />
          ) : (
            <SpinningPreloader />
          )}
        </div>
      </ModalLayout>
    );
  }
}
