import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape } from 'react-intl';
import { TEST_ITEM_PAGE, PROJECT_LOG_PAGE } from 'controllers/pages/constants';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { ALL } from 'common/constants/reservedFilterIds';
import isEqual from 'fast-deep-equal';
import { C3Chart } from '../../charts/common/c3chart';
import styles from './mostTimeConsumingTestCasesChart.scss';
import { MESSAGES } from '../../charts/common/constants';
import { getConfig } from './getConfig';

const cx = classNames.bind(styles);

@injectIntl
export class MostTimeConsumingTestCasesChart extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widget: PropTypes.object.isRequired,
    container: PropTypes.instanceOf(Element).isRequired,
    project: PropTypes.string.isRequired,
    navigate: PropTypes.func.isRequired,
    isPreview: PropTypes.bool,
    height: PropTypes.number,
    observer: PropTypes.object,
  };

  static defaultProps = {
    isPreview: false,
    height: 0,
    observer: {},
  };

  state = {
    isConfigReady: false,
  };

  componentDidMount() {
    const { observer } = this.props;

    observer.subscribe && observer.subscribe('widgetResized', this.resizeChart);
    this.getConfig();
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.widget, this.props.widget)) {
      this.getConfig();
    }
  }

  componentWillUnmount() {
    const { observer } = this.props;

    this.node && this.node.removeEventListener('mousemove', this.getCoords);
    observer.unsubscribe && observer.unsubscribe('widgetResized', this.resizeChart);
  }

  onChartCreated = (chart, element) => {
    this.chart = chart;
    this.node = element;
    this.node.addEventListener('mousemove', this.getCoords);
  };

  getConfig = () => {
    const { widget, intl, container } = this.props;

    const params = {
      content: widget.content,
      isPreview: false,
      intl,
      positionCallback: this.getPosition,
      size: {
        height: container.offsetHeight,
        width: container.offsetWidth,
      },
    };

    this.size = params.size;

    const configParams = {
      ...params,
      chartType: MODES_VALUES[CHART_MODES.BAR_VIEW],
      isPointsShow: false,
      messages: MESSAGES,
      testCaseClickHandler: this.testCaseClickHandler,
    };

    this.config = getConfig(configParams);

    this.setState({
      isConfigReady: true,
    });
  };

  getCoords = ({ pageX, pageY }) => {
    this.x = pageX;
    this.y = pageY;
  };

  getPosition = (d, width, height) => {
    const rect = this.node.getBoundingClientRect();
    const left = this.x - rect.left - width / 2;
    const top = this.y - rect.top - height;

    return {
      top: top - 8,
      left,
    };
  };

  resizeChart = () => {
    const { offsetHeight: newHeight } = this.props.container;
    const { offsetWidth: newWidth } = this.props.container;

    if (this.height !== newHeight || this.width !== newWidth) {
      this.chart.resize({
        height: newHeight,
        width: newWidth,
      });
      this.height = newHeight;
      this.width = newWidth;
      this.config.size.height = newHeight;
      this.config.size.width = newWidth;
    }
  };

  testCaseClickHandler = (id) => {
    const {
      project,
      widget: {
        content: { result, latestLaunch = {} },
      },
      navigate,
    } = this.props;
    const targetElement = result.find((el) => el.id === id) || {};
    const { path } = targetElement;
    let itemLink;
    let pageType;

    if (path) {
      itemLink = `${latestLaunch.id}/${path.replace(/[.]/g, '/')}`;
      pageType = PROJECT_LOG_PAGE;
    } else {
      itemLink = `${latestLaunch.id}`;
      pageType = TEST_ITEM_PAGE;
    }

    const navigationParams = {
      payload: {
        projectId: project,
        filterId: ALL,
        testItemIds: itemLink,
      },
      type: pageType,
    };

    navigate(navigationParams);
  };

  render() {
    return (
      this.state.isConfigReady && (
        <div className={cx('most-time-consuming-chart')}>
          <C3Chart
            config={this.config}
            onChartCreated={this.onChartCreated}
            className={cx('widget-wrapper')}
          />
        </div>
      )
    );
  }
}
