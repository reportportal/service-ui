import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape } from 'react-intl';
import isEqual from 'fast-deep-equal';
import { ALL } from 'common/constants/reservedFilterIds';
import { TEST_ITEM_PAGE, PROJECT_LOG_PAGE } from 'controllers/pages/constants';
import { C3Chart } from 'components/widgets/common/c3chart';
import { getConfig } from './config/getConfig';
import styles from './mostTimeConsumingTestCasesChart.scss';

const cx = classNames.bind(styles);

@injectIntl
export class MostTimeConsumingTestCasesChart extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widget: PropTypes.object.isRequired,
    container: PropTypes.instanceOf(Element).isRequired,
    projectId: PropTypes.string.isRequired,
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
    const { widget, container } = this.props;

    this.height = container.offsetHeight;
    this.width = container.offsetWidth;

    const params = {
      content: widget.content,
      positionCallback: this.getPosition,
      size: {
        height: container.offsetHeight,
        width: container.offsetWidth,
      },
      itemClickHandler: this.testCaseClickHandler,
    };

    this.config = getConfig(params);

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
    const { offsetHeight: newHeight, offsetWidth: newWidth } = this.props.container;

    if (this.height !== newHeight) {
      this.chart.resize({
        height: newHeight,
      });
      this.height = newHeight;
      this.config.size.height = newHeight;
    } else if (this.width !== newWidth) {
      this.chart.flush();
    }
    this.width = newWidth;
  };

  testCaseClickHandler = (id) => {
    const {
      projectId,
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
        projectId,
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
